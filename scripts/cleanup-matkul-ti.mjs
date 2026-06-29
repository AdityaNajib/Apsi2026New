import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupMatkulTI() {
  try {
    console.log('🔍 Mencari mata kuliah dengan kode TI...\n');

    // SQLite doesn't support case-insensitive contains, so get all and filter
    const allMatkul = await prisma.mataKuliah.findMany({
      include: {
        _count: {
          select: {
            kelas: true,
            cpmk: true
          }
        }
      }
    });

    // Filter mata kuliah dengan kode yang mengandung "TI" (case-insensitive)
    const matkulTI = allMatkul.filter(mk => 
      mk.kode.toUpperCase().includes('TI')
    );

    console.log(`📚 Ditemukan ${matkulTI.length} mata kuliah dengan kode TI:\n`);
    
    matkulTI.forEach(mk => {
      console.log(`- ${mk.kode} | ${mk.nama}`);
      console.log(`  └─ ${mk._count.kelas} kelas, ${mk._count.cpmk} CPMK`);
    });

    if (matkulTI.length === 0) {
      console.log('\n✅ Tidak ada mata kuliah dengan kode TI yang perlu dihapus.');
      return;
    }

    console.log('\n⚠️  Menghapus data terkait...\n');

    const mkIds = matkulTI.map(mk => mk.id);

    // Hapus dalam urutan untuk menghindari foreign key constraint
    // 1. Hapus nilai mahasiswa dari kelas yang terkait
    const kelasIds = await prisma.kelas.findMany({
      where: { mkId: { in: mkIds } },
      select: { id: true }
    });
    const kelasIdsList = kelasIds.map(k => k.id);

    if (kelasIdsList.length > 0) {
      // Hapus KRS
      const deletedKrs = await prisma.kRS.deleteMany({
        where: { kelasId: { in: kelasIdsList } }
      });
      console.log(`  ✓ ${deletedKrs.count} KRS dihapus`);

      // Ambil komponen nilai IDs untuk hapus nilai mahasiswa dan bobot CPMK
      const komponenIds = await prisma.komponenNilai.findMany({
        where: { kelasId: { in: kelasIdsList } },
        select: { id: true }
      });
      const komponenIdsList = komponenIds.map(k => k.id);

      if (komponenIdsList.length > 0) {
        // Hapus nilai mahasiswa
        const deletedNilaiMhs = await prisma.nilaiMahasiswa.deleteMany({
          where: { komponenId: { in: komponenIdsList } }
        });
        console.log(`  ✓ ${deletedNilaiMhs.count} nilai mahasiswa dihapus`);

        // Hapus bobot CPMK
        const deletedBobotCPMK = await prisma.bobotCPMK.deleteMany({
          where: { komponenId: { in: komponenIdsList } }
        });
        console.log(`  ✓ ${deletedBobotCPMK.count} bobot CPMK dihapus`);
      }

      // Hapus komponen nilai
      const deletedKomponenNilai = await prisma.komponenNilai.deleteMany({
        where: { kelasId: { in: kelasIdsList } }
      });
      console.log(`  ✓ ${deletedKomponenNilai.count} komponen nilai dihapus`);

      // Hapus pengampu
      const deletedPengampu = await prisma.pengampu.deleteMany({
        where: { kelasId: { in: kelasIdsList } }
      });
      console.log(`  ✓ ${deletedPengampu.count} pengampu dihapus`);

      // Hapus kelas
      const deletedKelas = await prisma.kelas.deleteMany({
        where: { id: { in: kelasIdsList } }
      });
      console.log(`  ✓ ${deletedKelas.count} kelas dihapus`);
    }

    // 2. Hapus CPMK (yang otomatis akan hapus bobot CPMK jika masih ada)
    const deletedCPMK = await prisma.cPMK.deleteMany({
      where: { mkId: { in: mkIds } }
    });
    console.log(`  ✓ ${deletedCPMK.count} CPMK dihapus`);

    // 3. Hapus mata kuliah
    const deletedMatkul = await prisma.mataKuliah.deleteMany({
      where: { id: { in: mkIds } }
    });
    console.log(`  ✓ ${deletedMatkul.count} mata kuliah dihapus\n`);

    console.log('✅ Semua mata kuliah dengan kode TI berhasil dihapus!\n');

    // Cek duplikasi nama mata kuliah
    console.log('🔍 Memeriksa duplikasi nama mata kuliah...\n');

    const remainingMatkul = await prisma.mataKuliah.findMany({
      orderBy: { nama: 'asc' }
    });

    const nameCounts = {};
    remainingMatkul.forEach(mk => {
      const name = mk.nama.trim().toLowerCase();
      if (!nameCounts[name]) {
        nameCounts[name] = [];
      }
      nameCounts[name].push(mk);
    });

    const duplicates = Object.entries(nameCounts).filter(([_, mks]) => mks.length > 1);

    if (duplicates.length > 0) {
      console.log(`⚠️  Ditemukan ${duplicates.length} nama mata kuliah yang duplikat:\n`);
      duplicates.forEach(([name, mks]) => {
        console.log(`📌 "${mks[0].nama}" (${mks.length} entri):`);
        mks.forEach(mk => {
          console.log(`   - ${mk.kode} | ID: ${mk.id} | SKS: ${mk.sks} | Semester: ${mk.semester}`);
        });
        console.log('');
      });
    } else {
      console.log('✅ Tidak ada duplikasi nama mata kuliah.\n');
    }

    // Tampilkan statistik akhir
    const finalCount = await prisma.mataKuliah.count();
    console.log(`📊 Total mata kuliah tersisa: ${finalCount}`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupMatkulTI();
