import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSemesterDistribution() {
  console.log('=== CEK DISTRIBUSI MATA KULIAH PER SEMESTER ===\n');

  const matkul = await prisma.mataKuliah.findMany({
    orderBy: [{ semester: 'asc' }, { kode: 'asc' }],
    select: {
      kode: true,
      nama: true,
      semester: true,
      _count: {
        select: { kelas: true }
      }
    }
  });

  console.log('Total Mata Kuliah:', matkul.length);
  console.log('\n--- Distribusi per Semester ---\n');

  for (let sem = 1; sem <= 8; sem++) {
    const mkSem = matkul.filter(m => m.semester === sem);
    const totalKelas = mkSem.reduce((sum, m) => sum + m._count.kelas, 0);
    console.log(`Semester ${sem}: ${mkSem.length} MK, ${totalKelas} kelas`);
  }

  console.log('\n--- Sample Mata Kuliah Semester GANJIL (1, 3, 5, 7) ---\n');
  const ganjil = matkul.filter(m => [1, 3, 5, 7].includes(m.semester));
  ganjil.slice(0, 15).forEach(m => {
    console.log(`${m.kode} - ${m.nama} (Sem ${m.semester}) - ${m._count.kelas} kelas`);
  });

  console.log(`\n... dan ${ganjil.length - 15} MK semester ganjil lainnya`);

  await prisma.$disconnect();
}

checkSemesterDistribution().catch(console.error);
