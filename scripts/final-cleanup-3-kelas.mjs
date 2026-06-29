import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function finalCleanup() {
  try {
    console.log('🔍 CEK ULANG DATABASE\n');
    console.log('='.repeat(80) + '\n');

    // 1. Cek duplikasi nama
    console.log('1️⃣  CEK DUPLIKASI NAMA MATA KULIAH\n');
    
    const allMatkul = await prisma.mataKuliah.findMany({
      include: {
        kelas: {
          include: {
            pengampu: true,
            komponenNilai: true,
            krs: true
          },
          orderBy: { nama: 'asc' }
        }
      },
      orderBy: { kode: 'asc' }
    });

    const nameCounts = {};
    allMatkul.forEach(mk => {
      const name = mk.nama.trim().toLowerCase();
      if (!nameCounts[name]) {
        nameCounts[name] = [];
      }
      nameCounts[name].push(mk);
    });

    const duplicates = Object.entries(nameCounts).filter(([_, mks]) => mks.length > 1);
    
    if (duplicates.length > 0) {
      console.log(`⚠️  Ditemukan ${duplicates.length} nama duplikat:\n`);
      
      let totalDeleted = 0;
      
      for (const [name, mks] of duplicates) {
        console.log(`📌 "${mks[0].nama}" (${mks.length} entri):`);
        
        // Sort: prefer kode lebih pendek dan semester lebih kecil
        const sorted = mks.sort((a, b) => {
          if (a.kode.length !== b.kode.length) {
            return a.kode.length - b.kode.length;
          }
          return a.semester - b.semester;
        });

        const keep = sorted[0];
        const deleteList = sorted.slice(1);

        console.log(`   ✓ SIMPAN: ${keep.kode} | Semester ${keep.semester}`);

        for (const mk of deleteList) {
          console.log(`   ✗ HAPUS: ${mk.kode} | Semester ${mk.semester}`);

          // Hapus kelas dan relasinya
          for (const kelas of mk.kelas) {
            const komponenIds = kelas.komponenNilai.map(k => k.id);
            
            if (komponenIds.length > 0) {
              await prisma.bobotCPMK.deleteMany({
                where: { komponenId: { in: komponenIds } }
              });
              
              await prisma.nilaiMahasiswa.deleteMany({
                where: { komponenId: { in: komponenIds } }
              });
            }

            await prisma.komponenNilai.deleteMany({
              where: { kelasId: kelas.id }
            });

            await prisma.kRS.deleteMany({
              where: { kelasId: kelas.id }
            });

            await prisma.pengampu.deleteMany({
              where: { kelasId: kelas.id }
            });
          }

          await prisma.kelas.deleteMany({
            where: { mkId: mk.id }
          });

          await prisma.cPMK.deleteMany({
            where: { mkId: mk.id }
          });

          await prisma.mataKuliah.delete({
            where: { id: mk.id }
          });

          totalDeleted++;
        }
        console.log('');
      }

      console.log(`✅ ${totalDeleted} mata kuliah duplikat dihapus\n`);
    } else {
      console.log('✅ Tidak ada duplikasi nama mata kuliah\n');
    }

    // 2. Batasi kelas menjadi maksimal 3 (A, B, C)
    console.log('='.repeat(80) + '\n');
    console.log('2️⃣  BATASI KELAS MAKSIMAL 3 (A, B, C)\n');

    const allMatkulFresh = await prisma.mataKuliah.findMany({
      include: {
        kelas: {
          orderBy: { nama: 'asc' }
        }
      },
      orderBy: { kode: 'asc' }
    });

    let totalKelasDeleted = 0;
    let matkulAffected = 0;

    for (const mk of allMatkulFresh) {
      if (mk.kelas.length > 3) {
        matkulAffected++;
        console.log(`📚 ${mk.kode} - ${mk.nama}`);
        console.log(`   Kelas saat ini: ${mk.kelas.length} kelas`);

        // Group by nama kelas
        const kelasByNama = {};
        mk.kelas.forEach(k => {
          if (!kelasByNama[k.nama]) {
            kelasByNama[k.nama] = [];
          }
          kelasByNama[k.nama].push(k);
        });

        // Ambil hanya A, B, C - masing-masing 1 kelas
        const targetKelas = ['A', 'B', 'C'];
        const toKeep = [];
        
        for (const namaKelas of targetKelas) {
          if (kelasByNama[namaKelas] && kelasByNama[namaKelas].length > 0) {
            // Simpan yang pertama
            toKeep.push(kelasByNama[namaKelas][0].id);
          }
        }

        console.log(`   ✓ Simpan: ${toKeep.length} kelas (A, B, C)`);

        // Hapus kelas yang tidak dipertahankan
        const toDelete = mk.kelas.filter(k => !toKeep.includes(k.id));

        for (const kelas of toDelete) {
          console.log(`   ✗ Hapus: Kelas ${kelas.nama} (ID: ${kelas.id})`);

          // Hapus relasi
          const komponenIds = await prisma.komponenNilai.findMany({
            where: { kelasId: kelas.id },
            select: { id: true }
          });
          const komponenIdsList = komponenIds.map(k => k.id);

          if (komponenIdsList.length > 0) {
            await prisma.bobotCPMK.deleteMany({
              where: { komponenId: { in: komponenIdsList } }
            });

            await prisma.nilaiMahasiswa.deleteMany({
              where: { komponenId: { in: komponenIdsList } }
            });
          }

          await prisma.komponenNilai.deleteMany({
            where: { kelasId: kelas.id }
          });

          await prisma.kRS.deleteMany({
            where: { kelasId: kelas.id }
          });

          await prisma.pengampu.deleteMany({
            where: { kelasId: kelas.id }
          });

          await prisma.kelas.delete({
            where: { id: kelas.id }
          });

          totalKelasDeleted++;
        }

        console.log('');
      }
    }

    if (matkulAffected === 0) {
      console.log('✅ Semua mata kuliah sudah punya maksimal 3 kelas\n');
    } else {
      console.log(`✅ ${matkulAffected} mata kuliah diperbaiki`);
      console.log(`   ${totalKelasDeleted} kelas dihapus\n`);
    }

    // 3. Verifikasi final
    console.log('='.repeat(80) + '\n');
    console.log('3️⃣  VERIFIKASI FINAL\n');

    const finalMatkul = await prisma.mataKuliah.findMany({
      include: {
        kelas: true
      }
    });

    const finalKelas = await prisma.kelas.count();
    const matkulWith3Kelas = finalMatkul.filter(mk => mk.kelas.length === 3).length;
    const matkulWithLess3 = finalMatkul.filter(mk => mk.kelas.length < 3).length;
    const matkulWithMore3 = finalMatkul.filter(mk => mk.kelas.length > 3).length;

    console.log(`📊 HASIL FINAL:`);
    console.log(`   Total Mata Kuliah: ${finalMatkul.length}`);
    console.log(`   Total Kelas: ${finalKelas}`);
    console.log(`   `);
    console.log(`   Mata Kuliah dengan 3 kelas: ${matkulWith3Kelas} ✅`);
    console.log(`   Mata Kuliah dengan < 3 kelas: ${matkulWithLess3}`);
    console.log(`   Mata Kuliah dengan > 3 kelas: ${matkulWithMore3}`);

    if (matkulWithMore3 > 0) {
      console.log(`\n⚠️  Masih ada ${matkulWithMore3} mata kuliah dengan > 3 kelas:`);
      finalMatkul.filter(mk => mk.kelas.length > 3).forEach(mk => {
        console.log(`   - ${mk.kode} | ${mk.nama} | ${mk.kelas.length} kelas`);
      });
    }

    // Cek duplikasi nama final
    const finalNameCounts = {};
    finalMatkul.forEach(mk => {
      const name = mk.nama.trim().toLowerCase();
      if (!finalNameCounts[name]) {
        finalNameCounts[name] = [];
      }
      finalNameCounts[name].push(mk);
    });

    const finalDuplicates = Object.entries(finalNameCounts).filter(([_, mks]) => mks.length > 1);
    
    console.log(`\n   Duplikasi nama: ${finalDuplicates.length === 0 ? '✅ Tidak ada' : '❌ ' + finalDuplicates.length + ' duplikat'}`);

    console.log('\n' + '='.repeat(80));
    console.log('✅ CLEANUP SELESAI\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

finalCleanup();
