import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyClean() {
  try {
    console.log('📊 VERIFIKASI DATABASE MATA KULIAH\n');
    console.log('='.repeat(60) + '\n');

    // 1. Check for TI codes
    const allMatkul = await prisma.mataKuliah.findMany({
      orderBy: { kode: 'asc' }
    });

    const matkulWithTI = allMatkul.filter(mk => mk.kode.toUpperCase().includes('TI'));
    
    console.log('1️⃣  CEK KODE TI:');
    if (matkulWithTI.length === 0) {
      console.log('   ✅ Tidak ada mata kuliah dengan kode TI\n');
    } else {
      console.log(`   ❌ Masih ada ${matkulWithTI.length} mata kuliah dengan kode TI:`);
      matkulWithTI.forEach(mk => console.log(`      - ${mk.kode} | ${mk.nama}`));
      console.log('');
    }

    // 2. Check for duplicates
    console.log('2️⃣  CEK DUPLIKASI NAMA:');
    const nameCounts = {};
    allMatkul.forEach(mk => {
      const name = mk.nama.trim().toLowerCase();
      if (!nameCounts[name]) {
        nameCounts[name] = [];
      }
      nameCounts[name].push(mk);
    });

    const duplicates = Object.entries(nameCounts).filter(([_, mks]) => mks.length > 1);
    
    if (duplicates.length === 0) {
      console.log('   ✅ Tidak ada duplikasi nama mata kuliah\n');
    } else {
      console.log(`   ❌ Masih ada ${duplicates.length} nama yang duplikat:`);
      duplicates.forEach(([name, mks]) => {
        console.log(`      📌 "${mks[0].nama}" (${mks.length} entri):`);
        mks.forEach(mk => console.log(`         - ${mk.kode} | SKS: ${mk.sks} | Semester: ${mk.semester}`));
      });
      console.log('');
    }

    // 3. Statistics
    console.log('3️⃣  STATISTIK DATABASE:');
    
    const totalMatkul = await prisma.mataKuliah.count();
    console.log(`   📚 Total Mata Kuliah: ${totalMatkul}`);

    const totalKelas = await prisma.kelas.count();
    console.log(`   🏫 Total Kelas: ${totalKelas}`);

    const totalPengampu = await prisma.pengampu.count();
    console.log(`   👨‍🏫 Total Pengampu: ${totalPengampu}`);

    const totalCPMK = await prisma.cPMK.count();
    console.log(`   📝 Total CPMK: ${totalCPMK}`);

    const totalKomponenNilai = await prisma.komponenNilai.count();
    console.log(`   ⚖️  Total Komponen Nilai: ${totalKomponenNilai}`);

    const totalKRS = await prisma.kRS.count();
    console.log(`   📋 Total KRS: ${totalKRS}`);

    const totalNilai = await prisma.nilaiMahasiswa.count();
    console.log(`   💯 Total Nilai Mahasiswa: ${totalNilai}`);

    // 4. Sample mata kuliah by semester
    console.log('\n4️⃣  DISTRIBUSI MATA KULIAH PER SEMESTER:');
    for (let sem = 1; sem <= 8; sem++) {
      const count = allMatkul.filter(mk => mk.semester === sem).length;
      const bar = '█'.repeat(Math.ceil(count / 2));
      console.log(`   Semester ${sem}: ${count.toString().padStart(2)} MK ${bar}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFIKASI SELESAI\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

verifyClean();
