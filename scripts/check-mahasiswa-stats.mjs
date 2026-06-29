import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMahasiswaStats() {
  try {
    console.log('📊 CEK STATISTIK MAHASISWA\n');
    console.log('='.repeat(80) + '\n');

    // 1. Total mahasiswa di database
    const totalMhs = await prisma.mahasiswa.count();
    const totalMhsAktif = await prisma.mahasiswa.count({
      where: { status: 'AKTIF' }
    });

    console.log('1️⃣  TOTAL MAHASISWA DI DATABASE:');
    console.log(`   Total semua mahasiswa: ${totalMhs}`);
    console.log(`   Mahasiswa AKTIF: ${totalMhsAktif}`);
    console.log('');

    // 2. Mahasiswa per angkatan
    const mhsPerAngkatan = await prisma.mahasiswa.groupBy({
      by: ['angkatan', 'status'],
      _count: true,
      orderBy: { angkatan: 'desc' }
    });

    console.log('2️⃣  DISTRIBUSI PER ANGKATAN:');
    const angkatanMap = {};
    mhsPerAngkatan.forEach(g => {
      if (!angkatanMap[g.angkatan]) {
        angkatanMap[g.angkatan] = { AKTIF: 0, total: 0 };
      }
      angkatanMap[g.angkatan][g.status] = g._count;
      angkatanMap[g.angkatan].total += g._count;
    });

    Object.entries(angkatanMap)
      .sort(([a], [b]) => b.localeCompare(a))
      .forEach(([angkatan, data]) => {
        const aktifCount = data.AKTIF || 0;
        const totalCount = data.total;
        console.log(`   Angkatan ${angkatan}: ${totalCount} mahasiswa (${aktifCount} aktif)`);
      });
    console.log('');

    // 3. Total KRS (pendaftaran kelas)
    const totalKRS = await prisma.kRS.count();
    console.log('3️⃣  PENDAFTARAN KELAS (KRS):');
    console.log(`   Total KRS: ${totalKRS} (akumulatif semua kelas)`);
    console.log('');

    // 4. Mahasiswa unik yang terdaftar di kelas
    const allKRS = await prisma.kRS.findMany({
      select: {
        mahasiswaId: true,
        mahasiswa: {
          select: {
            angkatan: true,
            status: true,
          }
        }
      }
    });

    const uniqueMahasiswaIds = new Set();
    const uniqueMahasiswaAktif = new Set();
    allKRS.forEach(krs => {
      uniqueMahasiswaIds.add(krs.mahasiswaId);
      if (krs.mahasiswa.status === 'AKTIF') {
        uniqueMahasiswaAktif.add(krs.mahasiswaId);
      }
    });

    console.log('4️⃣  MAHASISWA UNIK TERDAFTAR DI KELAS:');
    console.log(`   Semua status: ${uniqueMahasiswaIds.size} mahasiswa unik`);
    console.log(`   Status AKTIF: ${uniqueMahasiswaAktif.size} mahasiswa unik`);
    console.log('');

    // 5. Rata-rata kelas per mahasiswa
    const avgKelasPerMhs = uniqueMahasiswaIds.size > 0 
      ? (totalKRS / uniqueMahasiswaIds.size).toFixed(1)
      : 0;

    console.log('5️⃣  ANALISIS:');
    console.log(`   Rata-rata kelas per mahasiswa: ${avgKelasPerMhs} kelas`);
    console.log('');

    // 6. Total kelas
    const totalKelas = await prisma.kelas.count();
    console.log('6️⃣  KELAS:');
    console.log(`   Total kelas tersedia: ${totalKelas}`);
    console.log('');

    console.log('='.repeat(80));
    console.log('\n💡 KESIMPULAN:\n');
    console.log(`   ✅ ${totalMhs} mahasiswa total di database`);
    console.log(`   ✅ ${totalMhsAktif} mahasiswa berstatus AKTIF`);
    console.log(`   ✅ ${uniqueMahasiswaAktif.size} mahasiswa unik yang terdaftar di kelas (AKTIF)`);
    console.log(`   ✅ ${totalKRS} total pendaftaran kelas (KRS akumulatif)`);
    console.log(`   ✅ ${totalKelas} kelas tersedia`);
    console.log('');
    console.log('   📌 Yang ditampilkan di dashboard: Mahasiswa Unik AKTIF = ' + uniqueMahasiswaAktif.size);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkMahasiswaStats();
