import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixDuplicateKelas() {
  try {
    console.log('🔍 MENCARI DAN MENGHAPUS DUPLIKASI KELAS\n');
    console.log('='.repeat(80) + '\n');

    const allMatkul = await prisma.mataKuliah.findMany({
      include: {
        kelas: {
          orderBy: { nama: 'asc' }
        }
      },
      orderBy: { kode: 'asc' }
    });

    let totalDeleted = 0;
    let totalKelasDeleted = 0;
    let totalPengampuDeleted = 0;
    let totalKomponenDeleted = 0;
    let totalKrsDeleted = 0;

    for (const mk of allMatkul) {
      if (mk.kelas.length <= 3) {
        continue; // Skip if already 3 or less
      }

      // Group kelas by nama
      const kelasByNama = {};
      mk.kelas.forEach(kelas => {
        if (!kelasByNama[kelas.nama]) {
          kelasByNama[kelas.nama] = [];
        }
        kelasByNama[kelas.nama].push(kelas);
      });

      // Find duplicates
      const hasDuplicates = Object.values(kelasByNama).some(list => list.length > 1);
      
      if (!hasDuplicates) {
        continue;
      }

      console.log(`📚 ${mk.kode} - ${mk.nama}`);
      console.log(`   Total kelas: ${mk.kelas.length}`);

      let mkDeleted = 0;

      for (const [namaKelas, kelasList] of Object.entries(kelasByNama)) {
        if (kelasList.length > 1) {
          console.log(`   🔄 Kelas ${namaKelas}: ${kelasList.length} duplikat`);

          // Keep the first one (oldest), delete the rest
          const keep = kelasList[0];
          const deleteList = kelasList.slice(1);

          console.log(`      ✓ SIMPAN: ID ${keep.id}`);

          for (const kelas of deleteList) {
            console.log(`      ✗ HAPUS: ID ${kelas.id}`);

            // Get komponen nilai IDs first
            const komponenIds = await prisma.komponenNilai.findMany({
              where: { kelasId: kelas.id },
              select: { id: true }
            });
            const komponenIdsList = komponenIds.map(k => k.id);

            if (komponenIdsList.length > 0) {
              // Delete bobot CPMK
              await prisma.bobotCPMK.deleteMany({
                where: { komponenId: { in: komponenIdsList } }
              });

              // Delete nilai mahasiswa
              const deletedNilai = await prisma.nilaiMahasiswa.deleteMany({
                where: { komponenId: { in: komponenIdsList } }
              });
            }

            // Delete komponen nilai
            const deletedKomponen = await prisma.komponenNilai.deleteMany({
              where: { kelasId: kelas.id }
            });
            totalKomponenDeleted += deletedKomponen.count;

            // Delete KRS
            const deletedKrs = await prisma.kRS.deleteMany({
              where: { kelasId: kelas.id }
            });
            totalKrsDeleted += deletedKrs.count;

            // Delete pengampu
            const deletedPengampu = await prisma.pengampu.deleteMany({
              where: { kelasId: kelas.id }
            });
            totalPengampuDeleted += deletedPengampu.count;

            // Delete kelas
            await prisma.kelas.delete({
              where: { id: kelas.id }
            });

            mkDeleted++;
            totalKelasDeleted++;
          }
        }
      }

      if (mkDeleted > 0) {
        console.log(`   ✅ ${mkDeleted} kelas duplikat dihapus\n`);
        totalDeleted++;
      }
    }

    console.log('='.repeat(80) + '\n');
    console.log('📊 RINGKASAN:\n');
    console.log(`   ${totalDeleted} mata kuliah memiliki duplikasi`);
    console.log(`   ${totalKelasDeleted} kelas duplikat dihapus`);
    console.log(`   ${totalPengampuDeleted} pengampu dihapus`);
    console.log(`   ${totalKomponenDeleted} komponen nilai dihapus`);
    console.log(`   ${totalKrsDeleted} KRS dihapus\n`);

    // Verify result
    const finalCount = await prisma.kelas.count();
    console.log(`✅ Total kelas tersisa: ${finalCount}\n`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDuplicateKelas();
