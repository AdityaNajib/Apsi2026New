import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkKelasPerMatkul() {
  try {
    console.log('🔍 ANALISIS KELAS PER MATA KULIAH\n');
    console.log('='.repeat(80) + '\n');

    const allMatkul = await prisma.mataKuliah.findMany({
      include: {
        kelas: {
          orderBy: { nama: 'asc' }
        }
      },
      orderBy: { kode: 'asc' }
    });

    // Group by kelas count
    const kelasCountGroups = {};
    allMatkul.forEach(mk => {
      const count = mk.kelas.length;
      if (!kelasCountGroups[count]) {
        kelasCountGroups[count] = [];
      }
      kelasCountGroups[count].push(mk);
    });

    console.log('📊 STATISTIK JUMLAH KELAS:\n');
    
    Object.keys(kelasCountGroups)
      .sort((a, b) => Number(b) - Number(a))
      .forEach(count => {
        const matkuls = kelasCountGroups[count];
        console.log(`${count} kelas: ${matkuls.length} mata kuliah`);
      });

    console.log('\n' + '='.repeat(80) + '\n');

    // Show mata kuliah with != 3 kelas
    const notThreeKelas = allMatkul.filter(mk => mk.kelas.length !== 3);
    
    if (notThreeKelas.length > 0) {
      console.log(`⚠️  MATA KULIAH YANG TIDAK PUNYA 3 KELAS (${notThreeKelas.length}):\n`);
      
      notThreeKelas.forEach(mk => {
        console.log(`📌 ${mk.kode} - ${mk.nama}`);
        console.log(`   Semester: ${mk.semester} | SKS: ${mk.sks} | Jumlah Kelas: ${mk.kelas.length}`);
        if (mk.kelas.length > 0) {
          console.log(`   Kelas: ${mk.kelas.map(k => k.nama).join(', ')}`);
        }
        console.log('');
      });
    } else {
      console.log('✅ SEMUA MATA KULIAH PUNYA TEPAT 3 KELAS!\n');
    }

    // Show summary by semester
    console.log('='.repeat(80) + '\n');
    console.log('📊 DISTRIBUSI PER SEMESTER:\n');
    
    for (let sem = 1; sem <= 8; sem++) {
      const matkulSem = allMatkul.filter(mk => mk.semester === sem);
      const totalKelas = matkulSem.reduce((sum, mk) => sum + mk.kelas.length, 0);
      const avgKelas = matkulSem.length > 0 ? (totalKelas / matkulSem.length).toFixed(1) : 0;
      
      console.log(`Semester ${sem}:`);
      console.log(`   ${matkulSem.length} mata kuliah | ${totalKelas} kelas | Rata-rata: ${avgKelas} kelas/MK`);
    }

    console.log('\n' + '='.repeat(80) + '\n');

    const totalKelas = allMatkul.reduce((sum, mk) => sum + mk.kelas.length, 0);
    console.log(`✅ TOTAL: ${allMatkul.length} mata kuliah dengan ${totalKelas} kelas\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkKelasPerMatkul();
