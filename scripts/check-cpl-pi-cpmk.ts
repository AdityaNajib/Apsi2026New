import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking CPL, PI, and CPMK data...\n');
  
  // Count existing data
  const cplCount = await prisma.cPL.count();
  const piCount = await prisma.pI.count();
  const cpmkCount = await prisma.cPMK.count();
  
  console.log('📊 Current Database Stats:');
  console.log(`   CPL  : ${cplCount} records`);
  console.log(`   PI   : ${piCount} records`);
  console.log(`   CPMK : ${cpmkCount} records`);
  console.log();
  
  // List all CPL
  console.log('📋 CPL (Capaian Pembelajaran Lulusan):');
  const cplList = await prisma.cPL.findMany({
    include: {
      pi: true
    }
  });
  
  for (const cpl of cplList) {
    console.log(`   ${cpl.kode}: ${cpl.deskripsi.substring(0, 80)}...`);
    console.log(`   └─ PI count: ${cpl.pi.length}`);
  }
  console.log();
  
  // List all PI
  console.log('📋 PI (Performance Indicators):');
  const piList = await prisma.pI.findMany({
    include: {
      cpl: true,
      cpmk: true
    }
  });
  
  for (const pi of piList) {
    console.log(`   ${pi.kode}: ${pi.deskripsi.substring(0, 80)}...`);
    console.log(`   └─ CPL: ${pi.cpl.kode}, CPMK count: ${pi.cpmk.length}`);
  }
  console.log();
  
  // List CPMK grouped by mata kuliah
  console.log('📋 CPMK (Capaian Pembelajaran Mata Kuliah):');
  const mataKuliahList = await prisma.mataKuliah.findMany({
    include: {
      cpmk: {
        include: {
          pi: {
            include: {
              cpl: true
            }
          }
        }
      }
    }
  });
  
  for (const mk of mataKuliahList) {
    if (mk.cpmk.length > 0) {
      console.log(`   ${mk.kode} - ${mk.nama}:`);
      for (const cpmk of mk.cpmk) {
        console.log(`      ${cpmk.kode}: ${cpmk.deskripsi.substring(0, 60)}...`);
        console.log(`      └─ PI: ${cpmk.pi.kode} (CPL: ${cpmk.pi.cpl.kode})`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log('='.repeat(60));
  console.log(`Total CPL : ${cplCount}`);
  console.log(`Total PI  : ${piCount}`);
  console.log(`Total CPMK: ${cpmkCount}`);
  console.log(`MK with CPMK: ${mataKuliahList.filter(mk => mk.cpmk.length > 0).length} / ${mataKuliahList.length}`);
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
