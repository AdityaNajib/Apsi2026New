const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim());
  const results = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // CSV format: name,email,nim,angkatan
    const parts = line.split(',');
    if (parts.length >= 4) {
      results.push({
        name: parts[0].trim(),
        email: parts[1].trim(),
        nim: parts[2].trim(),
        angkatan: parts[3].trim(),
      });
    }
  }
  
  return results;
}

async function main() {
  console.log('🎓 Import Dummy Mahasiswa Direct to Database\n');
  
  const csvPath = path.join(__dirname, '..', 'sample-data', 'mahasiswa-dummy-all.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const mahasiswaList = parseCSV(csvContent);
  
  console.log(`📊 Total to import: ${mahasiswaList.length} mahasiswa\n`);
  
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  
  const byAngkatan = {};
  mahasiswaList.forEach(m => {
    if (!byAngkatan[m.angkatan]) byAngkatan[m.angkatan] = 0;
    byAngkatan[m.angkatan]++;
  });
  
  console.log('Expected breakdown:');
  Object.keys(byAngkatan).sort().forEach(ang => {
    console.log(`  Angkatan ${ang}: ${byAngkatan[ang]} mahasiswa`);
  });
  console.log('\n' + '='.repeat(60));
  console.log('Starting import...\n');
  
  // Hash password once
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  for (const mhs of mahasiswaList) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: mhs.email }
      });
      
      if (existingUser) {
        console.log(`⏭️  ${mhs.nim} - ${mhs.name} (already exists)`);
        skipCount++;
        continue;
      }
      
      // Create user and mahasiswa in transaction
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: mhs.name,
            email: mhs.email,
            password: hashedPassword,
            role: 'MAHASISWA',
          }
        });
        
        await tx.mahasiswa.create({
          data: {
            nim: mhs.nim,
            angkatan: mhs.angkatan,
            status: 'AKTIF',
            userId: user.id,
          }
        });
      });
      
      console.log(`✅ ${mhs.nim} - ${mhs.name} (${mhs.angkatan})`);
      successCount++;
      
    } catch (error) {
      console.log(`❌ ${mhs.nim} - Error: ${error.message}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Imported : ${successCount}`);
  console.log(`⏭️  Skipped  : ${skipCount}`);
  console.log(`❌ Errors   : ${errorCount}`);
  console.log(`📚 Total    : ${mahasiswaList.length}`);
  console.log('='.repeat(60));
  
  const totalInDB = await prisma.mahasiswa.count();
  console.log(`\n💾 Total mahasiswa in database: ${totalInDB}`);
  
  // Show breakdown by angkatan
  const dbByAngkatan = await prisma.mahasiswa.groupBy({
    by: ['angkatan'],
    _count: true,
  });
  
  console.log('\nBreakdown by angkatan (DB):');
  dbByAngkatan.sort((a, b) => a.angkatan.localeCompare(b.angkatan)).forEach(item => {
    console.log(`  Angkatan ${item.angkatan}: ${item._count} mahasiswa`);
  });
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
