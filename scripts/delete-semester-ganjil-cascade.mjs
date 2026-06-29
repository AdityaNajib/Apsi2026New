import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteSemesterGanjilCascade() {
  console.log('=== HAPUS MATA KULIAH SEMESTER GANJIL (1, 3, 5, 7) ===\n');
  console.log('Dengan cascade delete semua relasi terkait\n');

  // Get mata kuliah semester ganjil
  const matkulGanjil = await prisma.mataKuliah.findMany({
    where: {
      semester: { in: [1, 3, 5, 7] }
    },
    select: {
      id: true,
      kode: true,
      nama: true,
      semester: true
    },
    orderBy: [{ semester: 'asc' }, { kode: 'asc' }]
  });

  console.log(`Ditemukan ${matkulGanjil.length} mata kuliah semester ganjil\n`);

  const matkulIds = matkulGanjil.map(mk => mk.id);

  // Get all kelas for these mata kuliah
  const kelasList = await prisma.kelas.findMany({
    where: { mkId: { in: matkulIds } },
    select: { id: true }
  });

  const kelasIds = kelasList.map(k => k.id);

  console.log(`Total kelas terkait: ${kelasIds.length}\n`);

  // Get komponenNilai for these kelas
  const komponenList = await prisma.komponenNilai.findMany({
    where: { kelasId: { in: kelasIds } },
    select: { id: true }
  });

  const komponenIds = komponenList.map(k => k.id);

  console.log(`Total komponen nilai terkait: ${komponenIds.length}\n`);

  console.log('Mulai cascade delete...\n');

  // Step 1: Delete BobotCPMK
  const bobotCpmkDeleted = await prisma.bobotCPMK.deleteMany({
    where: { komponenId: { in: komponenIds } }
  });
  console.log(`✅ Deleted ${bobotCpmkDeleted.count} BobotCPMK`);

  // Step 2: Delete NilaiMahasiswa
  const nilaiDeleted = await prisma.nilaiMahasiswa.deleteMany({
    where: { komponenId: { in: komponenIds } }
  });
  console.log(`✅ Deleted ${nilaiDeleted.count} NilaiMahasiswa`);

  // Step 3: Delete KomponenNilai
  const komponenDeleted = await prisma.komponenNilai.deleteMany({
    where: { kelasId: { in: kelasIds } }
  });
  console.log(`✅ Deleted ${komponenDeleted.count} KomponenNilai`);

  // Step 4: Delete KRS
  const krsDeleted = await prisma.kRS.deleteMany({
    where: { kelasId: { in: kelasIds } }
  });
  console.log(`✅ Deleted ${krsDeleted.count} KRS`);

  // Step 5: Delete Pengampu
  const pengampuDeleted = await prisma.pengampu.deleteMany({
    where: { kelasId: { in: kelasIds } }
  });
  console.log(`✅ Deleted ${pengampuDeleted.count} Pengampu`);

  // Step 6: Delete CPMK
  const cpmkDeleted = await prisma.cPMK.deleteMany({
    where: { mkId: { in: matkulIds } }
  });
  console.log(`✅ Deleted ${cpmkDeleted.count} CPMK`);

  // Step 7: Delete Kelas
  const kelasDeleted = await prisma.kelas.deleteMany({
    where: { mkId: { in: matkulIds } }
  });
  console.log(`✅ Deleted ${kelasDeleted.count} Kelas`);

  // Step 8: Delete MataKuliah
  const matkulDeleted = await prisma.mataKuliah.deleteMany({
    where: { semester: { in: [1, 3, 5, 7] } }
  });
  console.log(`✅ Deleted ${matkulDeleted.count} MataKuliah\n`);

  // Verify final state
  console.log('=== STATUS AKHIR ===\n');

  const remainingMK = await prisma.mataKuliah.findMany({
    select: {
      semester: true,
      _count: { select: { kelas: true } }
    }
  });

  for (let sem = 1; sem <= 8; sem++) {
    const mkSem = remainingMK.filter(m => m.semester === sem);
    const totalKelas = mkSem.reduce((sum, m) => sum + m._count.kelas, 0);
    const status = [2, 4, 6, 8].includes(sem) ? '✅' : '❌';
    console.log(`${status} Semester ${sem}: ${mkSem.length} MK, ${totalKelas} kelas`);
  }

  const totalMK = remainingMK.length;
  const totalKelas = remainingMK.reduce((sum, m) => sum + m._count.kelas, 0);

  console.log(`\n📊 Total Akhir:`);
  console.log(`   - ${totalMK} mata kuliah (hanya semester GENAP)`);
  console.log(`   - ${totalKelas} kelas (${totalMK} × 3)`);

  // Count remaining records
  const counts = await prisma.$transaction([
    prisma.kRS.count(),
    prisma.nilaiMahasiswa.count(),
    prisma.komponenNilai.count(),
    prisma.pengampu.count(),
    prisma.cPMK.count(),
    prisma.mahasiswa.count()
  ]);

  console.log(`   - ${counts[0]} KRS`);
  console.log(`   - ${counts[1]} Nilai Mahasiswa`);
  console.log(`   - ${counts[2]} Komponen Nilai`);
  console.log(`   - ${counts[3]} Pengampu`);
  console.log(`   - ${counts[4]} CPMK`);
  console.log(`   - ${counts[5]} Mahasiswa Aktif`);

  console.log('\n✅ Selesai! Hanya semester GENAP (2, 4, 6, 8) yang tersisa.\n');

  await prisma.$disconnect();
}

deleteSemesterGanjilCascade().catch(console.error);
