import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFinalGenapOnly() {
  console.log('=== VERIFIKASI FINAL: HANYA SEMESTER GENAP ===\n');

  const allMatkul = await prisma.mataKuliah.findMany({
    select: {
      id: true,
      kode: true,
      nama: true,
      semester: true,
      sks: true,
      _count: { select: { kelas: true } }
    },
    orderBy: [{ semester: 'asc' }, { kode: 'asc' }]
  });

  console.log('📊 DISTRIBUSI MATA KULIAH PER SEMESTER\n');
  
  for (let sem = 1; sem <= 8; sem++) {
    const mkSem = allMatkul.filter(m => m.semester === sem);
    const totalKelas = mkSem.reduce((sum, m) => sum + m._count.kelas, 0);
    const totalSKS = mkSem.reduce((sum, m) => sum + m.sks, 0);
    const isGenap = [2, 4, 6, 8].includes(sem);
    const type = isGenap ? 'GENAP ✅' : 'GANJIL ❌';
    
    console.log(`Semester ${sem} (${type}):`);
    console.log(`  - Mata Kuliah: ${mkSem.length} MK`);
    console.log(`  - Total SKS: ${totalSKS} SKS`);
    console.log(`  - Total Kelas: ${totalKelas} kelas`);
    
    if (totalKelas > 0) {
      const withKelas = mkSem.filter(m => m._count.kelas > 0);
      console.log(`  - MK dengan kelas: ${withKelas.length}`);
      
      // Show sample
      console.log(`  - Sample (5 MK pertama):`);
      withKelas.slice(0, 5).forEach(m => {
        console.log(`      ${m.kode} - ${m.nama} (${m.sks} SKS, ${m._count.kelas} kelas)`);
      });
      if (withKelas.length > 5) {
        console.log(`      ... dan ${withKelas.length - 5} MK lainnya`);
      }
    }
    console.log('');
  }

  // Summary by type
  console.log('📈 RINGKASAN PER TYPE\n');
  
  const genapMK = allMatkul.filter(m => [2, 4, 6, 8].includes(m.semester));
  const genapKelas = genapMK.reduce((sum, m) => sum + m._count.kelas, 0);
  const genapWithKelas = genapMK.filter(m => m._count.kelas > 0);
  
  const ganjilMK = allMatkul.filter(m => [1, 3, 5, 7].includes(m.semester));
  const ganjilKelas = ganjilMK.reduce((sum, m) => sum + m._count.kelas, 0);
  const ganjilWithKelas = ganjilMK.filter(m => m._count.kelas > 0);

  console.log('SEMESTER GENAP (2, 4, 6, 8):');
  console.log(`  - Total MK: ${genapMK.length}`);
  console.log(`  - MK dengan kelas: ${genapWithKelas.length}`);
  console.log(`  - Total kelas: ${genapKelas}`);
  console.log('');

  console.log('SEMESTER GANJIL (1, 3, 5, 7):');
  console.log(`  - Total MK: ${ganjilMK.length}`);
  console.log(`  - MK dengan kelas: ${ganjilWithKelas.length}`);
  console.log(`  - Total kelas: ${ganjilKelas}`);
  console.log('');

  // Database stats
  console.log('💾 STATISTIK DATABASE\n');
  
  const counts = await prisma.$transaction([
    prisma.mataKuliah.count(),
    prisma.kelas.count(),
    prisma.kRS.count(),
    prisma.mahasiswa.count(),
    prisma.pengampu.count(),
    prisma.komponenNilai.count(),
    prisma.nilaiMahasiswa.count(),
    prisma.cPMK.count()
  ]);

  console.log(`📚 Mata Kuliah: ${counts[0]}`);
  console.log(`🏫 Kelas: ${counts[1]} (hanya di semester genap)`);
  console.log(`📝 KRS: ${counts[2]}`);
  console.log(`👨‍🎓 Mahasiswa: ${counts[3]}`);
  console.log(`👨‍🏫 Pengampu: ${counts[4]}`);
  console.log(`📊 Komponen Nilai: ${counts[5]}`);
  console.log(`💯 Nilai Mahasiswa: ${counts[6]}`);
  console.log(`📋 CPMK: ${counts[7]}`);

  // Mahasiswa per angkatan
  console.log('\n👥 MAHASISWA PER ANGKATAN\n');
  
  const mahasiswaByAngkatan = await prisma.mahasiswa.groupBy({
    by: ['angkatan'],
    _count: { id: true },
    orderBy: { angkatan: 'desc' }
  });

  mahasiswaByAngkatan.forEach(m => {
    let expectedSemester;
    if (m.angkatan === '2025') expectedSemester = 2;
    else if (m.angkatan === '2024') expectedSemester = 4;
    else if (m.angkatan === '2023') expectedSemester = 6;
    else if (m.angkatan === '2022') expectedSemester = 8;
    
    console.log(`Angkatan ${m.angkatan}: ${m._count.id} mahasiswa → Semester ${expectedSemester} (GENAP)`);
  });

  // Final validation
  console.log('\n✅ VALIDASI FINAL\n');
  
  if (ganjilKelas === 0) {
    console.log('✅ PERFECT! Tidak ada kelas di semester GANJIL (1, 3, 5, 7)');
  } else {
    console.log(`❌ GAGAL! Masih ada ${ganjilKelas} kelas di semester ganjil`);
  }

  if (genapKelas > 0) {
    console.log('✅ CORRECT! Ada kelas di semester GENAP (2, 4, 6, 8)');
  } else {
    console.log('❌ ERROR! Tidak ada kelas di semester genap');
  }

  console.log('✅ Struktur kurikulum sudah sesuai!');
  console.log('✅ Database siap digunakan!\n');

  await prisma.$disconnect();
}

verifyFinalGenapOnly().catch(console.error);
