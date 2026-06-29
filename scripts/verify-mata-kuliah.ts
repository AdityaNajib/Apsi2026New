import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verifying Mata Kuliah in Database...\n');
  
  const mataKuliah = await prisma.mataKuliah.findMany({
    orderBy: { kode: 'asc' }
  });
  
  console.log(`📚 Total Mata Kuliah: ${mataKuliah.length}\n`);
  console.log('=' .repeat(80));
  console.log('Kode'.padEnd(15) + 'Nama'.padEnd(50) + 'SKS'.padEnd(5) + 'Sem');
  console.log('='.repeat(80));
  
  mataKuliah.forEach(mk => {
    console.log(
      mk.kode.padEnd(15) + 
      mk.nama.substring(0, 48).padEnd(50) + 
      mk.sks.toString().padEnd(5) + 
      mk.semester
    );
  });
  
  console.log('='.repeat(80));
  console.log(`\n✅ All ${mataKuliah.length} mata kuliah verified!\n`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
