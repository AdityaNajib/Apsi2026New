import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function keepOnlySemesterGenap() {
  console.log('=== HAPUS MATA KULIAH SEMESTER GANJIL (1, 3, 5, 7) ===\n');
  console.log('Hanya semester GENAP (2, 4, 6, 8) yang akan dipertahankan\n');

  // Get mata kuliah semester ganjil
  const matkulGanjil = await prisma.mataKuliah.findMany({
    where: {
      semester: { in: [1, 3, 5, 7] }
    },
    select: {
      id: true,
      kode: true,
      nama: true,
      semester: true,
      _count: {
        select: {
          kelas: true,
          cpmk: true
        }
      }
    },
    orderBy: [{ semester: 'asc' }, { kode: 'asc' }]
  });

  console.log(`Ditemukan ${matkulGanjil.length} mata kuliah semester ganjil:\n`);

  let totalKelas = 0;
  matkulGanjil.forEach(mk => {
    totalKelas += mk._count.kelas;
    console.log(`- ${mk.kode} - ${mk.nama} (Sem ${mk.semester}) - ${mk._count.kelas} kelas, ${mk._count.cpmk} CPMK`);
  });

  console.log(`\nTotal: ${matkulGanjil.length} MK, ${totalKelas} kelas akan dihapus`);
  console.log('\nMulai penghapusan...\n');

  // Delete mata kuliah semester ganjil (cascade will handle related records)
  const result = await prisma.mataKuliah.deleteMany({
    where: {
      semester: { in: [1, 3, 5, 7] }
    }
  });

  console.log(`✅ Berhasil menghapus ${result.count} mata kuliah semester ganjil\n`);

  // Verify remaining
  const remaining = await prisma.mataKuliah.findMany({
    select: {
      semester: true,
      _count: { select: { kelas: true } }
    }
  });

  console.log('=== STATUS SETELAH PENGHAPUSAN ===\n');
  
  for (let sem = 1; sem <= 8; sem++) {
    const mkSem = remaining.filter(m => m.semester === sem);
    const totalKelas = mkSem.reduce((sum, m) => sum + m._count.kelas, 0);
    const status = [2, 4, 6, 8].includes(sem) ? '✅' : '❌';
    console.log(`${status} Semester ${sem}: ${mkSem.length} MK, ${totalKelas} kelas`);
  }

  const totalMK = remaining.length;
  const totalKelasRemaining = remaining.reduce((sum, m) => sum + m._count.kelas, 0);
  
  console.log(`\nTotal Akhir: ${totalMK} mata kuliah, ${totalKelasRemaining} kelas`);
  console.log('✅ Hanya semester GENAP (2, 4, 6, 8) yang tersisa!\n');

  await prisma.$disconnect();
}

keepOnlySemesterGenap().catch(console.error);
