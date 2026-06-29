const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🎓 Generating Dummy KRS (Student Enrollment to Classes)\n');
  
  // Get all mahasiswa by angkatan
  const mahasiswa2022 = await prisma.mahasiswa.findMany({ where: { angkatan: '2022' }, orderBy: { nim: 'asc' } });
  const mahasiswa2023 = await prisma.mahasiswa.findMany({ where: { angkatan: '2023' }, orderBy: { nim: 'asc' } });
  const mahasiswa2024 = await prisma.mahasiswa.findMany({ where: { angkatan: '2024' }, orderBy: { nim: 'asc' } });
  const mahasiswa2025 = await prisma.mahasiswa.findMany({ where: { angkatan: '2025' }, orderBy: { nim: 'asc' } });
  
  console.log(`Mahasiswa counts:`);
  console.log(`  2022: ${mahasiswa2022.length}`);
  console.log(`  2023: ${mahasiswa2023.length}`);
  console.log(`  2024: ${mahasiswa2024.length}`);
  console.log(`  2025: ${mahasiswa2025.length}`);
  console.log('');
  
  // Get all kelas with their mata kuliah info
  const allKelas = await prisma.kelas.findMany({
    include: {
      mataKuliah: true
    },
    orderBy: [
      { mkId: 'asc' },
      { nama: 'asc' }
    ]
  });
  
  console.log(`Total kelas: ${allKelas.length}\n`);
  
  // Strategy: Enroll students to classes randomly but realistically
  // - Each student takes 15-20 kelas (random)
  // - Each kelas should have some students (15-40)
  
  let createdCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  // For each kelas, randomly assign 15-40 students
  for (const kelas of allKelas) {
    // Randomly determine how many students for this class
    const numStudents = 15 + Math.floor(Math.random() * 26); // 15-40
    
    // Get all mahasiswa pool
    const allMhs = [...mahasiswa2022, ...mahasiswa2023, ...mahasiswa2024, ...mahasiswa2025];
    
    // Shuffle and take numStudents
    const shuffled = allMhs.sort(() => Math.random() - 0.5);
    const selectedMhs = shuffled.slice(0, numStudents);
    
    console.log(`${kelas.mataKuliah.kode} - ${kelas.nama}: Enrolling ${selectedMhs.length} students...`);
    
    for (const mhs of selectedMhs) {
      try {
        // Check if already enrolled
        const existing = await prisma.kRS.findFirst({
          where: {
            mahasiswaId: mhs.id,
            kelasId: kelas.id
          }
        });
        
        if (existing) {
          skippedCount++;
          continue;
        }
        
        await prisma.kRS.create({
          data: {
            mahasiswaId: mhs.id,
            kelasId: kelas.id
          }
        });
        
        createdCount++;
      } catch (error) {
        errorCount++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Created : ${createdCount}`);
  console.log(`⏭️  Skipped : ${skippedCount}`);
  console.log(`❌ Errors  : ${errorCount}`);
  console.log('='.repeat(60));
  
  const totalKRS = await prisma.kRS.count();
  console.log(`\n💾 Total KRS in database: ${totalKRS}`);
  
  // Show sample of kelas with their student counts
  console.log('\nSample kelas with student counts:');
  const sampleKelas = await prisma.kelas.findMany({
    take: 10,
    include: {
      mataKuliah: true,
      _count: {
        select: { krs: true }
      }
    }
  });
  
  sampleKelas.forEach(k => {
    console.log(`  ${k.mataKuliah.kode} - ${k.nama}: ${k._count.krs} students`);
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
