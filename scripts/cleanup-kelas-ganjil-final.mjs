import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupKelasGanjilFinal() {
  console.log('=== CLEANUP KELAS SEMESTER GANJIL (FINAL) ===\n');
  console.log('Menghapus semua kelas di semester GANJIL (1, 3, 5, 7)\n');

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

  console.log(`Mata kuliah semester ganjil: ${matkulGanjil.length} MK\n`);

  // Get all kelas for these mata kuliah
  const kelasList = await prisma.kelas.findMany({
    where: { mkId: { in: matkulIds } },
    select: { 
      id: true,
      nama: true,
      mataKuliah: {
        select: {
          kode: true,
          semester: true
        }
      }
    }
  });

  const kelasIds = kelasList.map(k => k.id);

  console.log(`Kelas yang akan dihapus: ${kelasIds.length} kelas\n`);

  // Group by semester
  const bySemester = {};
  kelasList.forEach(k => {
    const sem = k.mataKuliah.semester;
    bySemester[sem] = (bySemester[sem] || 0) + 1;
  });

  console.log('Distribusi kelas yang akan dihapus:');
  [1, 3, 5, 7].forEach(sem => {
    const count = bySemester[sem] || 0;
    if (count > 0) {
      console.log(`  - Semester ${sem}: ${count} kelas`);
    }
  });
  console.log('');

  if (kelasIds.length === 0) {
    console.log('✅ Tidak ada kelas di semester ganjil. Database sudah bersih!\n');
    await prisma.$disconnect();
    return;
  }

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
  console.log('=== VERIFIKASI HASIL AKHIR ===\n');

  const allMatkul = await prisma.mataKuliah.findMany({
    select: {
      semester: true,
      _count: { select: { kelas: true } }
    }
  });

  console.log('Distribusi kelas per semester:\n');

  for (let sem = 1; sem <= 8; sem++) {
    const mkSem = allMatkul.filter(m => m.semester === sem);
    const totalKelas = mkSem.reduce((sum, m) => sum + m._count.kelas, 0);
    const isGenap = [2, 4, 6, 8].includes(sem);
    const type = isGenap ? 'GENAP' : 'GANJIL';
    const status = isGenap ? '✅' : '❌';
    const expected = isGenap ? '(harus ada kelas)' : '(tidak boleh ada kelas)';
    const check = (isGenap && totalKelas > 0) || (!isGenap && totalKelas === 0) ? '✅' : '❌';
    
    console.log(`${status} Semester ${sem} (${type}): ${mkSem.length} MK, ${totalKelas} kelas ${expected} ${check}`);
  }

  const totalMK = allMatkul.length;
  const totalKelas = allMatkul.reduce((sum, m) => sum + m._count.kelas, 0);
  const mkWithKelas = allMatkul.filter(m => m._count.kelas > 0).length;

  console.log(`\n📊 Total Akhir:`);
  console.log(`   - ${totalMK} mata kuliah`);
  console.log(`   - ${mkWithKelas} MK dengan kelas (semester GENAP saja)`);
  console.log(`   - ${totalKelas} total kelas (hanya di semester GENAP)`);

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

  // Final check
  const ganjilWithKelas = allMatkul.filter(m => 
    [1, 3, 5, 7].includes(m.semester) && m._count.kelas > 0
  );

  console.log('\n🎯 Validasi Akhir:');
  if (ganjilWithKelas.length === 0) {
    console.log('   ✅ PERFECT! Tidak ada kelas di semester GANJIL');
    console.log('   ✅ Hanya semester GENAP (2, 4, 6, 8) yang memiliki kelas\n');
  } else {
    console.log(`   ❌ MASIH ADA ${ganjilWithKelas.length} MK semester ganjil dengan kelas!\n`);
  }

  await prisma.$disconnect();
}

cleanupKelasGanjilFinal().catch(console.error);
