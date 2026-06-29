import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteAngkatan2026() {
  try {
    console.log('🗑️  HAPUS MAHASISWA ANGKATAN 2026\n');
    console.log('='.repeat(80) + '\n');

    // 1. Cari mahasiswa angkatan 2026
    const mahasiswa2026 = await prisma.mahasiswa.findMany({
      where: { angkatan: '2026' },
      include: {
        user: true,
        krs: {
          include: {
            kelas: {
              include: {
                mataKuliah: true
              }
            }
          }
        }
      }
    });

    console.log(`📊 Ditemukan: ${mahasiswa2026.length} mahasiswa angkatan 2026\n`);

    if (mahasiswa2026.length === 0) {
      console.log('✅ Tidak ada mahasiswa angkatan 2026 yang perlu dihapus\n');
      return;
    }

    // Tampilkan sample
    console.log('Sample mahasiswa yang akan dihapus:');
    mahasiswa2026.slice(0, 5).forEach(mhs => {
      console.log(`   - ${mhs.nim} | ${mhs.user.name} | ${mhs.krs.length} KRS`);
    });
    if (mahasiswa2026.length > 5) {
      console.log(`   ... dan ${mahasiswa2026.length - 5} mahasiswa lainnya`);
    }
    console.log('');

    // Hitung total data terkait
    const totalKRS = mahasiswa2026.reduce((sum, m) => sum + m.krs.length, 0);
    const mahasiswaIds = mahasiswa2026.map(m => m.id);
    const userIds = mahasiswa2026.map(m => m.userId);

    console.log('📋 Data yang akan dihapus:');
    console.log(`   ${mahasiswa2026.length} mahasiswa`);
    console.log(`   ${totalKRS} KRS (pendaftaran kelas)`);
    console.log(`   ${mahasiswa2026.length} user accounts`);
    console.log('');

    console.log('🗑️  Menghapus data...\n');

    // Hapus nilai mahasiswa jika ada
    const komponenIds = await prisma.komponenNilai.findMany({
      where: {
        kelas: {
          krs: {
            some: {
              mahasiswaId: { in: mahasiswaIds }
            }
          }
        }
      },
      select: { id: true }
    });

    if (komponenIds.length > 0) {
      const komponenIdsList = komponenIds.map(k => k.id);
      const deletedNilai = await prisma.nilaiMahasiswa.deleteMany({
        where: {
          mahasiswaId: { in: mahasiswaIds }
        }
      });
      console.log(`   ✓ ${deletedNilai.count} nilai mahasiswa dihapus`);
    }

    // Hapus KRS
    const deletedKRS = await prisma.kRS.deleteMany({
      where: { mahasiswaId: { in: mahasiswaIds } }
    });
    console.log(`   ✓ ${deletedKRS.count} KRS dihapus`);

    // Hapus mahasiswa
    const deletedMahasiswa = await prisma.mahasiswa.deleteMany({
      where: { id: { in: mahasiswaIds } }
    });
    console.log(`   ✓ ${deletedMahasiswa.count} mahasiswa dihapus`);

    // Hapus user accounts
    const deletedUsers = await prisma.user.deleteMany({
      where: { id: { in: userIds } }
    });
    console.log(`   ✓ ${deletedUsers.count} user accounts dihapus`);

    console.log('\n' + '='.repeat(80));
    console.log('\n✅ MAHASISWA ANGKATAN 2026 BERHASIL DIHAPUS\n');

    // Tampilkan statistik akhir
    const remainingMhs = await prisma.mahasiswa.count();
    const remainingKRS = await prisma.kRS.count();

    console.log('📊 STATISTIK AKHIR:');
    console.log(`   Mahasiswa tersisa: ${remainingMhs}`);
    console.log(`   KRS tersisa: ${remainingKRS}`);
    console.log('');

    // Tampilkan distribusi per angkatan
    const perAngkatan = await prisma.mahasiswa.groupBy({
      by: ['angkatan'],
      _count: true,
      orderBy: { angkatan: 'desc' }
    });

    console.log('   Distribusi per angkatan:');
    perAngkatan.forEach(g => {
      console.log(`   - Angkatan ${g.angkatan}: ${g._count} mahasiswa`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

deleteAngkatan2026();
