import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAfterMove() {
  console.log('=== VERIFIKASI SETELAH PINDAH SEMESTER 6 → 7 ===\n');

  const allMatkul = await prisma.mataKuliah.findMany({
    select: {
      id: true,
      kode: true,
      nama: true,
      semester: true,
      _count: { select: { kelas: true } }
    },
    orderBy: [{ semester: 'asc' }, { kode: 'asc' }]
  });

  console.log('📊 DISTRIBUSI MATA KULIAH DAN KELAS\n');
  
  for (let sem = 1; sem <= 8; sem++) {
    const mkSem = allMatkul.filter(m => m.semester === sem);
    const totalKelas = mkSem.reduce((sum, m) => sum + m._count.kelas, 0);
    const isGenap = [2, 4, 6, 8].includes(sem);
    const type = isGenap ? 'GENAP' : 'GANJIL';
    const status = isGenap ? '✅' : '❌';
    
    console.log(`${status} Semester ${sem} (${type}): ${mkSem.length} MK, ${totalKelas} kelas`);
    
    // Show detail if kelas exist
    if (totalKelas > 0) {
      const withKelas = mkSem.filter(m => m._count.kelas > 0);
      console.log(`   → ${withKelas.length} MK dengan kelas:`);
      withKelas.slice(0, 5).forEach(m => {
        console.log(`      - ${m.kode}: ${m._count.kelas} kelas`);
      });
      if (withKelas.length > 5) {
        console.log(`      ... dan ${withKelas.length - 5} MK lainnya`);
      }
    }
    console.log('');
  }

  // Check for anomalies - kelas di semester ganjil
  console.log('⚠️  CEK ANOMALI: Kelas di Semester GANJIL\n');
  
  const ganjilWithKelas = allMatkul.filter(m => 
    [1, 3, 5, 7].includes(m.semester) && m._count.kelas > 0
  );

  if (ganjilWithKelas.length > 0) {
    console.log(`❌ DITEMUKAN ${ganjilWithKelas.length} MK semester GANJIL yang masih punya kelas!\n`);
    ganjilWithKelas.forEach(m => {
      console.log(`   - Semester ${m.semester}: ${m.kode} - ${m.nama} (${m._count.kelas} kelas)`);
    });
    console.log('');
  } else {
    console.log('✅ Tidak ada anomali - semester ganjil tidak ada kelas\n');
  }

  // Summary
  console.log('📈 RINGKASAN\n');
  
  const totalMK = allMatkul.length;
  const totalKelas = allMatkul.reduce((sum, m) => sum + m._count.kelas, 0);
  const mkWithKelas = allMatkul.filter(m => m._count.kelas > 0).length;
  const mkNoKelas = allMatkul.filter(m => m._count.kelas === 0).length;

  console.log(`Total Mata Kuliah: ${totalMK}`);
  console.log(`  - Dengan kelas: ${mkWithKelas} MK`);
  console.log(`  - Tanpa kelas: ${mkNoKelas} MK`);
  console.log(`Total Kelas: ${totalKelas}\n`);

  // By semester
  const genapMK = allMatkul.filter(m => [2, 4, 6, 8].includes(m.semester));
  const genapKelas = genapMK.reduce((sum, m) => sum + m._count.kelas, 0);
  const ganjilMK = allMatkul.filter(m => [1, 3, 5, 7].includes(m.semester));
  const ganjilKelas = ganjilMK.reduce((sum, m) => sum + m._count.kelas, 0);

  console.log('Per Type:');
  console.log(`  - GENAP (2,4,6,8): ${genapMK.length} MK, ${genapKelas} kelas`);
  console.log(`  - GANJIL (1,3,5,7): ${ganjilMK.length} MK, ${ganjilKelas} kelas`);

  console.log('\n✅ Verifikasi selesai!\n');

  await prisma.$disconnect();
}

verifyAfterMove().catch(console.error);
