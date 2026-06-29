import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function moveSemester6To7() {
  console.log('=== PINDAH MATA KULIAH SEMESTER 6 KE SEMESTER 7 ===\n');

  // Get all mata kuliah semester 6
  const matkulSem6 = await prisma.mataKuliah.findMany({
    where: { semester: 6 },
    select: {
      id: true,
      kode: true,
      nama: true,
      semester: true,
      _count: {
        select: { kelas: true }
      }
    },
    orderBy: { kode: 'asc' }
  });

  console.log(`Ditemukan ${matkulSem6.length} mata kuliah semester 6\n`);
  
  const totalKelas = matkulSem6.reduce((sum, mk) => sum + mk._count.kelas, 0);
  console.log(`Total kelas terkait: ${totalKelas}\n`);

  console.log('Sample mata kuliah yang akan dipindah:');
  matkulSem6.slice(0, 10).forEach(mk => {
    console.log(`  - ${mk.kode} - ${mk.nama} (${mk._count.kelas} kelas)`);
  });
  if (matkulSem6.length > 10) {
    console.log(`  ... dan ${matkulSem6.length - 10} mata kuliah lainnya`);
  }
  console.log('');

  // Update all semester 6 to semester 7
  const result = await prisma.mataKuliah.updateMany({
    where: { semester: 6 },
    data: { semester: 7 }
  });

  console.log(`✅ Berhasil memindahkan ${result.count} mata kuliah dari semester 6 ke semester 7\n`);

  // Verify final distribution
  console.log('=== DISTRIBUSI AKHIR MATA KULIAH ===\n');

  const allMatkul = await prisma.mataKuliah.findMany({
    select: {
      semester: true,
      _count: { select: { kelas: true } }
    }
  });

  for (let sem = 1; sem <= 8; sem++) {
    const mkSem = allMatkul.filter(m => m.semester === sem);
    const totalKelas = mkSem.reduce((sum, m) => sum + m._count.kelas, 0);
    const isGenap = [2, 4, 6, 8].includes(sem);
    const status = isGenap ? '✅ GENAP' : '❌ GANJIL';
    const kelasInfo = totalKelas > 0 ? `${totalKelas} kelas` : 'TIDAK ADA KELAS';
    console.log(`${status} Semester ${sem}: ${mkSem.length} MK, ${kelasInfo}`);
  }

  // Breakdown by semester
  console.log('\n📊 Detail per Semester:\n');
  
  const summary = {
    2: { name: 'Semester 2 (Genap)', mk: 0, kelas: 0 },
    4: { name: 'Semester 4 (Genap)', mk: 0, kelas: 0 },
    6: { name: 'Semester 6 (Genap)', mk: 0, kelas: 0 },
    7: { name: 'Semester 7 (Ganjil)', mk: 0, kelas: 0 },
    8: { name: 'Semester 8 (Genap)', mk: 0, kelas: 0 }
  };

  allMatkul.forEach(m => {
    if (summary[m.semester]) {
      summary[m.semester].mk++;
      summary[m.semester].kelas += m._count.kelas;
    }
  });

  Object.entries(summary).forEach(([sem, data]) => {
    console.log(`${data.name}: ${data.mk} MK, ${data.kelas} kelas`);
  });

  console.log('\n✅ Selesai! Semua mata kuliah semester 6 telah dipindah ke semester 7.\n');

  await prisma.$disconnect();
}

moveSemester6To7().catch(console.error);
