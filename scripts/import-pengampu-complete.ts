import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface PengampuRow {
  kode_mk: string;
  nama_mk: string;
  nama_dosen: string;
  kelas: string;
  tahun_ajaran: string;
  semester: string;
}

interface DosenData {
  nidn: string;
  name: string;
  email: string;
}

function parseCSV(text: string): PengampuRow[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  
  const results: PengampuRow[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 6) {
      results.push({
        kode_mk: parts[0].trim(),
        nama_mk: parts[1].trim(),
        nama_dosen: parts[2].trim(),
        kelas: parts[3].trim(),
        tahun_ajaran: parts[4].trim(),
        semester: parts[5].trim(),
      });
    }
  }
  
  return results;
}

function extractNIDN(dosenString: string): string {
  // Extract NIDN from "JUM001 - Jumiyanto Widodo S.Sos. M.Si."
  const match = dosenString.match(/^([A-Z]+\d+)/);
  return match ? match[1] : '';
}

function extractDosenName(dosenString: string): string {
  // Extract name from "JUM001 - Jumiyanto Widodo S.Sos. M.Si."
  const parts = dosenString.split(' - ');
  return parts.length > 1 ? parts[1].trim() : dosenString;
}

function getUniqueDosen(pengampuList: PengampuRow[]): DosenData[] {
  const dosenMap = new Map<string, DosenData>();
  
  for (const row of pengampuList) {
    const nidn = extractNIDN(row.nama_dosen);
    const name = extractDosenName(row.nama_dosen);
    
    if (nidn && !dosenMap.has(nidn)) {
      dosenMap.set(nidn, {
        nidn,
        name,
        email: `${nidn.toLowerCase()}@staff.uns.ac.id`,
      });
    }
  }
  
  return Array.from(dosenMap.values());
}

async function importDosen(dosenList: DosenData[]) {
  console.log('\n👨‍🏫 Importing Dosen...\n');
  
  let successCount = 0;
  let skipCount = 0;
  
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  for (const dosen of dosenList) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: dosen.email }
      });
      
      if (existingUser) {
        console.log(`⏭️  Skip: ${dosen.nidn} - ${dosen.name} (already exists)`);
        skipCount++;
      } else {
        // Create user and dosen
        await prisma.user.create({
          data: {
            name: dosen.name,
            email: dosen.email,
            password: hashedPassword,
            role: 'DOSEN',
            dosen: {
              create: {
                nidn: dosen.nidn,
              }
            }
          }
        });
        console.log(`✅ Added: ${dosen.nidn} - ${dosen.name}`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Error: ${dosen.nidn} - ${error}`);
    }
  }
  
  console.log(`\n📊 Dosen Import: ${successCount} added, ${skipCount} skipped`);
}

async function importPengampu(pengampuList: PengampuRow[]) {
  console.log('\n📚 Importing Pengampu (Teaching Assignments)...\n');
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const row of pengampuList) {
    try {
      // Find mata kuliah
      const mataKuliah = await prisma.mataKuliah.findUnique({
        where: { kode: row.kode_mk }
      });
      
      if (!mataKuliah) {
        console.log(`❌ MK not found: ${row.kode_mk}`);
        errorCount++;
        continue;
      }
      
      // Find or create kelas
      let kelas = await prisma.kelas.findFirst({
        where: {
          mkId: mataKuliah.id,
          nama: row.kelas,
          tahun_ajaran: row.tahun_ajaran,
          semester: row.semester,
        }
      });
      
      if (!kelas) {
        kelas = await prisma.kelas.create({
          data: {
            mkId: mataKuliah.id,
            nama: row.kelas,
            tahun_ajaran: row.tahun_ajaran,
            semester: row.semester,
          }
        });
      }
      
      // Find dosen
      const nidn = extractNIDN(row.nama_dosen);
      const dosen = await prisma.dosen.findUnique({
        where: { nidn }
      });
      
      if (!dosen) {
        console.log(`❌ Dosen not found: ${nidn}`);
        errorCount++;
        continue;
      }
      
      // Check if pengampu already exists
      const existingPengampu = await prisma.pengampu.findFirst({
        where: {
          kelasId: kelas.id,
          dosenId: dosen.id,
        }
      });
      
      if (existingPengampu) {
        skipCount++;
      } else {
        // Create pengampu
        await prisma.pengampu.create({
          data: {
            kelasId: kelas.id,
            dosenId: dosen.id,
          }
        });
        
        console.log(`✅ ${nidn} → ${row.kode_mk} ${row.kelas} (${row.tahun_ajaran} ${row.semester})`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Error: ${row.kode_mk} ${row.kelas} - ${error}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Pengampu Import: ${successCount} added, ${skipCount} skipped, ${errorCount} errors`);
}

async function main() {
  console.log('🚀 Starting Complete Pengampu Import Process...\n');
  console.log('='.repeat(60));
  
  // Read CSV
  const csvPath = path.join(__dirname, '..', 'sample-data', 'pengampu-from-excel.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const pengampuList = parseCSV(csvContent);
  
  console.log(`📊 Found ${pengampuList.length} pengampu records\n`);
  
  // Step 1: Extract unique dosen
  const dosenList = getUniqueDosen(pengampuList);
  console.log(`👨‍🏫 Found ${dosenList.length} unique dosen\n`);
  
  // Step 2: Import dosen
  await importDosen(dosenList);
  
  // Step 3: Import pengampu
  await importPengampu(pengampuList);
  
  // Step 4: Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Import Complete!');
  console.log('='.repeat(60));
  
  // Verify counts
  const counts = await Promise.all([
    prisma.dosen.count(),
    prisma.kelas.count(),
    prisma.pengampu.count(),
  ]);
  
  console.log(`👨‍🏫 Total Dosen    : ${counts[0]}`);
  console.log(`📚 Total Kelas    : ${counts[1]}`);
  console.log(`🔗 Total Pengampu : ${counts[2]}`);
  console.log('='.repeat(60));
  console.log('\n✅ All dosen credentials:');
  console.log('   Email: {NIDN}@staff.uns.ac.id (lowercase)');
  console.log('   Password: password123\n');
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
