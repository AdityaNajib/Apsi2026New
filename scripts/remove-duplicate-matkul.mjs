import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeDuplicates() {
  try {
    console.log('🔍 Mencari duplikasi mata kuliah...\n');

    const allMatkul = await prisma.mataKuliah.findMany({
      orderBy: { nama: 'asc' },
      include: {
        _count: {
          select: {
            kelas: true,
            cpmk: true
          }
        }
      }
    });

    // Group by nama (case-insensitive)
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
      console.log('✅ Tidak ada duplikasi mata kuliah.\n');
      return;
    }

    console.log(`⚠️  Ditemukan ${duplicates.length} nama mata kuliah yang duplikat:\n`);

    const toDelete = [];

    duplicates.forEach(([name, mks]) => {
      console.log(`📌 "${mks[0].nama}" (${mks.length} entri):`);
      
      // Sort by priority:
      // 1. Prefer dengan kelas lebih banyak
      // 2. Prefer dengan CPMK lebih banyak
      // 3. Prefer kode yang lebih pendek (lebih umum)
      const sorted = mks.sort((a, b) => {
        if (a._count.kelas !== b._count.kelas) {
          return b._count.kelas - a._count.kelas;
        }
        if (a._count.cpmk !== b._count.cpmk) {
          return b._count.cpmk - a._count.cpmk;
        }
        return a.kode.length - b.kode.length;
      });

      // Keep first (highest priority), delete the rest
      const keep = sorted[0];
      const deleteList = sorted.slice(1);

      console.log(`   ✓ SIMPAN: ${keep.kode} | SKS: ${keep.sks} | Semester: ${keep.semester} | ${keep._count.kelas} kelas | ${keep._count.cpmk} CPMK`);
      
      deleteList.forEach(mk => {
        console.log(`   ✗ HAPUS: ${mk.kode} | SKS: ${mk.sks} | Semester: ${mk.semester} | ${mk._count.kelas} kelas | ${mk._count.cpmk} CPMK`);
        toDelete.push(mk);
      });
      
      console.log('');
    });

    if (toDelete.length === 0) {
      console.log('✅ Tidak ada mata kuliah yang perlu dihapus.\n');
      return;
    }

    console.log(`\n⚠️  Total ${toDelete.length} mata kuliah akan dihapus...\n`);

    const mkIds = toDelete.map(mk => mk.id);

    // Hapus dalam urutan untuk menghindari foreign key constraint
    // 1. Hapus relasi kelas terlebih dahulu
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

      // Ambil komponen nilai IDs
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

    // 2. Hapus CPMK
    const deletedCPMK = await prisma.cPMK.deleteMany({
      where: { mkId: { in: mkIds } }
    });
    console.log(`  ✓ ${deletedCPMK.count} CPMK dihapus`);

    // 3. Hapus mata kuliah
    const deletedMatkul = await prisma.mataKuliah.deleteMany({
      where: { id: { in: mkIds } }
    });
    console.log(`  ✓ ${deletedMatkul.count} mata kuliah dihapus\n`);

    console.log('✅ Duplikasi berhasil dihapus!\n');

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

removeDuplicates();
