import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MKRow {
  kode: string;
  nama: string;
  sks: number;
  semester: number;
}

function parseCSV(csvText: string): MKRow[] {
  const lines = csvText.split('\n').filter(l => l.trim());
  const results: MKRow[] = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split(',');
    if (parts.length >= 4) {
      results.push({
        kode: parts[0].trim(),
        nama: parts[1].trim(),
        sks: parseInt(parts[2].trim(), 10),
        semester: parseInt(parts[3].trim(), 10),
      });
    }
  }
  
  return results;
}

async function main() {
  console.log('🚀 Importing ALL Mata Kuliah from Template...\n');
  
  const csvPath = path.join(__dirname, '..', 'sample-data', 'all-matakuliah-template.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const mataKuliahList = parseCSV(csvContent);
  
  console.log(`📊 Total to process: ${mataKuliahList.length} mata kuliah\n`);
  
  let addedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  // Group by semester for cleaner output
  const bySemester = new Map<number, MKRow[]>();
  for (const mk of mataKuliahList) {
    if (!bySemester.has(mk.semester)) {
      bySemester.set(mk.semester, []);
    }
    bySemester.get(mk.semester)!.push(mk);
  }
  
  // Process semester by semester
  for (let sem = 1; sem <= 8; sem++) {
    const mkList = bySemester.get(sem) || [];
    if (mkList.length === 0) continue;
    
    console.log(`\n📚 SEMESTER ${sem} (${mkList.length} mata kuliah):`);
    console.log('='.repeat(60));
    
    for (const mk of mkList) {
      try {
        const existing = await prisma.mataKuliah.findUnique({
          where: { kode: mk.kode }
        });
        
        if (existing) {
          console.log(`⏭️  ${mk.kode} - ${mk.nama.substring(0, 40)}... (exists)`);
          skippedCount++;
        } else {
          await prisma.mataKuliah.create({
            data: mk
          });
          console.log(`✅ ${mk.kode} - ${mk.nama} (${mk.sks} SKS)`);
          addedCount++;
        }
      } catch (error) {
        console.log(`❌ ${mk.kode} - Error: ${error}`);
        errorCount++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Added   : ${addedCount}`);
  console.log(`⏭️  Skipped : ${skippedCount}`);
  console.log(`❌ Errors  : ${errorCount}`);
  console.log(`📚 Total   : ${mataKuliahList.length}`);
  console.log('='.repeat(60));
  
  const totalInDB = await prisma.mataKuliah.count();
  console.log(`\n💾 Total mata kuliah in database: ${totalInDB}`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
