import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteKelasSemesterGanjil() {
  console.log('=== HAPUS KELAS UNTUK MATA KULIAH SEMESTER GANJIL ===\n');
  console.log('Mata kuliah tetap ada, hanya kelas yang dihapus\n');

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
    }
  });

  const matkulIds = matkulGanjil.map(mk => mk.id);

  console.log(`Ditemukan ${matkulGanjil.length} mata kuliah semester ganjil\n`);

  // Get all kelas for these mata kuliah
  const kelasList = await prisma.kelas.findMany({
    where: { mkId: { in: matkulIds } },
    select: { 
      id: true,
      nama: true,
      tahun_ajaran: true,
      semester: true,
      mataKuliah: {
        select: {
          kode: true,
          nama: true,
          semester: true
        }
      }
    }
  });

  const kelasIds = kelasList.map(k => k.id);

  console.log(`Total kelas yang akan dihapus: ${kelasIds.length}\n`);
  console.log('Sample kelas yang akan dihapus:');
  kelasList.slice(0, 10).forEach(k => {
    console.log(`  - ${k.mataKuliah.kode} (Sem ${k.mataKuliah.semester}) - Kelas ${k.nama} - ${k.tahun_ajaran} ${k.semester}`);
  });
  console.log('  ...\n');

  // Get komponenNilai for these kelas
  const komponenList = await prisma.komponenNilai.findMany({
    where: { kelasId: { in: kelasIds } },
    select: { id: true }
  });

  const komponenIds = komponenList.map(k => k.id);

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

  // Step 6: Delete Kelas
  const kelasDeleted = await prisma.kelas.deleteMany({
    where: { mkId: { in: matkulIds } }
  });
  console.log(`✅ Deleted ${kelasDeleted.count} Kelas\n`);

  // Verify final state
  console.log('=== STATUS AKHIR ===\n');

  const allMatkul = await prisma.mataKuliah.findMany({
    select: {
      semester: true,
      _count: { select: { kelas: true } }
    }
  });

  for (let sem = 1; sem <= 8; sem++) {
    const mkSem = allMatkul.filter(m => m.semester === sem);
    const totalKelas = mkSem.reduce((sum, m) => sum + m._count.kelas, 0);
    const status = [2, 4, 6, 8].includes(sem) ? '✅' : '❌';
    const info = [2, 4, 6, 8].includes(sem) ? 'ADA KELAS' : 'TIDAK ADA KELAS';
    console.log(`${status} Semester ${sem}: ${mkSem.length} MK, ${totalKelas} kelas (${info})`);
  }

  const totalMK = allMatkul.length;
  const totalKelas = allMatkul.reduce((sum, m) => sum + m._count.kelas, 0);
  const mkDenganKelas = allMatkul.filter(m => m._count.kelas > 0).length;
  const mkTanpaKelas = allMatkul.filter(m => m._count.kelas === 0).length;

  console.log(`\n📊 Total Akhir:`);
  console.log(`   - ${totalMK} mata kuliah (semua semester 1-8 tetap ada)`);
  console.log(`   - ${mkDenganKelas} MK dengan kelas (semester GENAP: 2, 4, 6, 8)`);
  console.log(`   - ${mkTanpaKelas} MK tanpa kelas (semester GANJIL: 1, 3, 5, 7)`);
  console.log(`   - ${totalKelas} total kelas aktif`);

  // Count remaining records
  const counts = await prisma.$transaction([
    prisma.kRS.count(),
    prisma.nilaiMahasiswa.count(),
    prisma.komponenNilai.count(),
    prisma.pengampu.count(),
    prisma.mahasiswa.count()
  ]);

  console.log(`   - ${counts[0]} KRS`);
  console.log(`   - ${counts[1]} Nilai Mahasiswa`);
  console.log(`   - ${counts[2]} Komponen Nilai`);
  console.log(`   - ${counts[3]} Pengampu`);
  console.log(`   - ${counts[4]} Mahasiswa Aktif`);

  console.log('\n✅ Selesai! Kelas hanya ada di semester GENAP (2, 4, 6, 8).\n');

  await prisma.$disconnect();
}

deleteKelasSemesterGanjil().catch(console.error);
