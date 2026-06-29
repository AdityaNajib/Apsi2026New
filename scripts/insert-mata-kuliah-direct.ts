import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MataKuliahRow {
  kode: string;
  nama: string;
  sks: number;
  semester: number;
}

function parseCSV(text: string): MataKuliahRow[] {
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return [];
  
  const results: MataKuliahRow[] = [];
  
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
  console.log('🎓 Importing Mata Kuliah from Excel...\n');
  
  const csvPath = path.join(__dirname, '..', 'sample-data', 'mata-kuliah-from-excel.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const mataKuliahList = parseCSV(csvContent);
  
  console.log(`📊 Found ${mataKuliahList.length} mata kuliah to import\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  for (const mk of mataKuliahList) {
    try {
      // Check if exists
      const existing = await prisma.mataKuliah.findUnique({
        where: { kode: mk.kode }
      });
      
      if (existing) {
        console.log(`⏭️  Skip: ${mk.kode} - ${mk.nama} (already exists)`);
        skipCount++;
      } else {
        await prisma.mataKuliah.create({
          data: mk
        });
        console.log(`✅ Added: ${mk.kode} - ${mk.nama} (${mk.sks} SKS, Sem ${mk.semester})`);
        successCount++;
      }
    } catch (error) {
      console.log(`❌ Error: ${mk.kode} - ${error}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Success  : ${successCount}`);
  console.log(`⏭️  Skipped  : ${skipCount}`);
  console.log(`❌ Errors   : ${errorCount}`);
  console.log(`📚 Total    : ${mataKuliahList.length}`);
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
