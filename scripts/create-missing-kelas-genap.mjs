import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMissingKelasGenap() {
  console.log('=== BUAT KELAS UNTUK SEMUA MK SEMESTER GENAP ===\n');

  // Get all mata kuliah semester genap
  const matkulGenap = await prisma.mataKuliah.findMany({
    where: {
      semester: { in: [2, 4, 6, 8] }
    },
    select: {
      id: true,
      kode: true,
      nama: true,
      semester: true,
      _count: { select: { kelas: true } }
    },
    orderBy: [{ semester: 'asc' }, { kode: 'asc' }]
  });

  console.log(`Total MK semester genap: ${matkulGenap.length}\n`);

  // Filter MK yang belum punya kelas atau kurang dari 3 kelas
  const mkNeedKelas = matkulGenap.filter(mk => mk._count.kelas < 3);

  console.log(`MK yang perlu ditambah kelas: ${mkNeedKelas.length}\n`);

  if (mkNeedKelas.length === 0) {
    console.log('✅ Semua MK semester genap sudah punya 3 kelas!\n');
    await prisma.$disconnect();
    return;
  }

  // Group by semester
  const bySemester = {};
  mkNeedKelas.forEach(mk => {
    const sem = mk.semester;
    if (!bySemester[sem]) bySemester[sem] = [];
    bySemester[sem].push(mk);
  });

  console.log('Distribusi MK yang perlu kelas:');
  [2, 4, 6, 8].forEach(sem => {
    const mks = bySemester[sem] || [];
    if (mks.length > 0) {
      console.log(`  - Semester ${sem}: ${mks.length} MK`);
    }
  });
  console.log('');

  // Tahun ajaran mapping
  const tahunAjaranMap = {
    2: '2024/2025',  // Angkatan 2025 semester 2 (genap 2024/2025)
    4: '2023/2024',  // Angkatan 2024 semester 4 (genap 2023/2024)
    6: '2022/2023',  // Angkatan 2023 semester 6 (genap 2022/2023)
    8: '2021/2022'   // Angkatan 2022 semester 8 (genap 2021/2022)
  };

  console.log('Mulai membuat kelas...\n');

  let totalKelasCreated = 0;

  for (const mk of mkNeedKelas) {
    const currentKelasCount = mk._count.kelas;
    const needToCreate = 3 - currentKelasCount;
    
    // Get existing kelas to know which letters are already used
    const existingKelas = await prisma.kelas.findMany({
      where: { mkId: mk.id },
      select: { nama: true }
    });

    const existingNames = existingKelas.map(k => k.nama);
    const allNames = ['A', 'B', 'C'];
    const namesToCreate = allNames.filter(name => !existingNames.includes(name));

    const tahunAjaran = tahunAjaranMap[mk.semester] || '2024/2025';

    for (let i = 0; i < needToCreate; i++) {
      const namaKelas = namesToCreate[i];
      
      await prisma.kelas.create({
        data: {
          nama: namaKelas,
          tahun_ajaran: tahunAjaran,
          semester: 'Genap',
          mkId: mk.id
        }
      });

      totalKelasCreated++;
    }

    console.log(`✅ ${mk.kode} - ${mk.nama} (Sem ${mk.semester}): +${needToCreate} kelas → Total 3 kelas`);
  }

  console.log(`\n✅ Berhasil membuat ${totalKelasCreated} kelas baru\n`);

  // Verify final state
  console.log('=== VERIFIKASI HASIL AKHIR ===\n');

  const allMatkulGenap = await prisma.mataKuliah.findMany({
    where: {
      semester: { in: [2, 4, 6, 8] }
    },
    select: {
      semester: true,
      _count: { select: { kelas: true } }
    }
  });

  console.log('Distribusi kelas per semester GENAP:\n');

  for (let sem of [2, 4, 6, 8]) {
    const mkSem = allMatkulGenap.filter(m => m.semester === sem);
    const totalKelas = mkSem.reduce((sum, m) => sum + m._count.kelas, 0);
    const mkWith3Kelas = mkSem.filter(m => m._count.kelas === 3).length;
    const mkWithLess = mkSem.filter(m => m._count.kelas < 3).length;
    
    console.log(`Semester ${sem} (GENAP):`);
    console.log(`  - Total MK: ${mkSem.length}`);
    console.log(`  - MK dengan 3 kelas: ${mkWith3Kelas} ✅`);
    console.log(`  - MK dengan < 3 kelas: ${mkWithLess} ${mkWithLess === 0 ? '✅' : '❌'}`);
    console.log(`  - Total kelas: ${totalKelas}`);
    console.log('');
  }

  // Final summary
  const totalMK = allMatkulGenap.length;
  const totalKelas = allMatkulGenap.reduce((sum, m) => sum + m._count.kelas, 0);
  const expectedKelas = totalMK * 3;

  console.log('📊 RINGKASAN AKHIR:\n');
  console.log(`Total MK Semester GENAP: ${totalMK}`);
  console.log(`Total Kelas: ${totalKelas}`);
  console.log(`Expected: ${expectedKelas} (${totalMK} MK × 3 kelas)`);
  
  if (totalKelas === expectedKelas) {
    console.log('\n✅ PERFECT! Semua MK semester GENAP punya 3 kelas (A, B, C)\n');
  } else {
    console.log(`\n⚠️ KURANG ${expectedKelas - totalKelas} kelas\n`);
  }

  await prisma.$disconnect();
}

createMissingKelasGenap().catch(console.error);
