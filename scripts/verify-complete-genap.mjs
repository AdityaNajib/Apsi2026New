import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyCompleteGenap() {
  console.log('=== VERIFIKASI LENGKAP: SEMUA SEMESTER ===\n');

  const allMatkul = await prisma.mataKuliah.findMany({
    select: {
      semester: true,
      _count: { select: { kelas: true } }
    }
  });

  console.log('📊 DISTRIBUSI KELAS PER SEMESTER\n');

  for (let sem = 1; sem <= 8; sem++) {
    const mkSem = allMatkul.filter(m => m.semester === sem);
    const totalKelas = mkSem.reduce((sum, m) => sum + m._count.kelas, 0);
    const isGenap = [2, 4, 6, 8].includes(sem);
    const type = isGenap ? 'GENAP ✅' : 'GANJIL ❌';
    
    const mkWith3Kelas = mkSem.filter(m => m._count.kelas === 3).length;
    const mkWith0Kelas = mkSem.filter(m => m._count.kelas === 0).length;
    
    console.log(`Semester ${sem} (${type}):`);
    console.log(`  - Total MK: ${mkSem.length}`);
    console.log(`  - MK dengan 3 kelas: ${mkWith3Kelas}`);
    console.log(`  - MK dengan 0 kelas: ${mkWith0Kelas}`);
    console.log(`  - Total kelas: ${totalKelas}`);
    
    if (isGenap) {
      const expected = mkSem.length * 3;
      const status = totalKelas === expected ? '✅ PERFECT' : `⚠️ Kurang ${expected - totalKelas}`;
      console.log(`  - Expected: ${expected} kelas ${status}`);
    } else {
      const status = totalKelas === 0 ? '✅ CORRECT' : `❌ Harus 0`;
      console.log(`  - Expected: 0 kelas ${status}`);
    }
    console.log('');
  }

  // Summary
  const genapMK = allMatkul.filter(m => [2, 4, 6, 8].includes(m.semester));
  const genapKelas = genapMK.reduce((sum, m) => sum + m._count.kelas, 0);
  
  const ganjilMK = allMatkul.filter(m => [1, 3, 5, 7].includes(m.semester));
  const ganjilKelas = ganjilMK.reduce((sum, m) => sum + m._count.kelas, 0);

  console.log('📈 RINGKASAN\n');
  console.log('SEMESTER GENAP (2, 4, 6, 8):');
  console.log(`  - Total MK: ${genapMK.length}`);
  console.log(`  - Total kelas: ${genapKelas}`);
  console.log(`  - Expected: ${genapMK.length * 3}`);
  console.log(`  - Status: ${genapKelas === genapMK.length * 3 ? '✅ PERFECT' : '❌ KURANG'}`);
  console.log('');

  console.log('SEMESTER GANJIL (1, 3, 5, 7):');
  console.log(`  - Total MK: ${ganjilMK.length}`);
  console.log(`  - Total kelas: ${ganjilKelas}`);
  console.log(`  - Expected: 0`);
  console.log(`  - Status: ${ganjilKelas === 0 ? '✅ PERFECT' : '❌ HARUS 0'}`);
  console.log('');

  // Database stats
  const counts = await prisma.$transaction([
    prisma.mataKuliah.count(),
    prisma.kelas.count(),
    prisma.kRS.count(),
    prisma.mahasiswa.count(),
    prisma.pengampu.count()
  ]);

  console.log('💾 DATABASE STATISTICS\n');
  console.log(`📚 Mata Kuliah: ${counts[0]}`);
  console.log(`🏫 Kelas: ${counts[1]}`);
  console.log(`📝 KRS: ${counts[2]}`);
  console.log(`👨‍🎓 Mahasiswa: ${counts[3]}`);
  console.log(`👨‍🏫 Pengampu: ${counts[4]}`);

  // Final validation
  console.log('\n✅ VALIDASI FINAL\n');
  
  const allGenapHave3 = genapMK.every(m => m._count.kelas === 3);
  const allGanjilHave0 = ganjilMK.every(m => m._count.kelas === 0);

  if (allGenapHave3) {
    console.log('✅ Semua MK GENAP punya 3 kelas (A, B, C)');
  } else {
    console.log('❌ Ada MK GENAP yang tidak punya 3 kelas');
  }

  if (allGanjilHave0) {
    console.log('✅ Semua MK GANJIL tidak punya kelas');
  } else {
    console.log('❌ Ada MK GANJIL yang masih punya kelas');
  }

  if (allGenapHave3 && allGanjilHave0) {
    console.log('\n🎉 DATABASE PERFECT! Siap digunakan!\n');
  } else {
    console.log('\n⚠️ Masih ada yang perlu diperbaiki\n');
  }

  await prisma.$disconnect();
}

verifyCompleteGenap().catch(console.error);
