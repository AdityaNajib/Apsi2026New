// Script untuk membuat 3 kelas (A, B, C) untuk setiap mata kuliah
// Usage: node scripts/create-3-kelas-per-matkul.mjs

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Mulai membuat 3 kelas untuk setiap mata kuliah...\n');

  // Get all mata kuliah
  const mataKuliahList = await prisma.mataKuliah.findMany({
    orderBy: [{ semester: 'asc' }, { kode: 'asc' }],
  });

  console.log(`📚 Ditemukan ${mataKuliahList.length} mata kuliah\n`);

  // Get all dosen untuk distribusi pengampu
  const dosenList = await prisma.dosen.findMany({
    include: { user: true },
  });

  if (dosenList.length === 0) {
    console.error('❌ Tidak ada dosen! Import dosen dulu.');
    return;
  }

  console.log(`👨‍🏫 Ditemukan ${dosenList.length} dosen\n`);

  // Tahun ajaran
  const tahunAjaran = '2024/2025';
  const semester = 'Ganjil'; // atau 'Genap'

  let totalCreated = 0;
  let totalSkipped = 0;

  for (const mk of mataKuliahList) {
    console.log(`\n📖 ${mk.kode} - ${mk.nama} (Semester ${mk.semester})`);

    // Cek kelas yang sudah ada
    const existingKelas = await prisma.kelas.findMany({
      where: {
        mkId: mk.id,
        tahun_ajaran: tahunAjaran,
        semester: semester,
      },
    });

    const existingNames = existingKelas.map(k => k.nama);
    const kelasNames = ['A', 'B', 'C'];

    for (const namaKelas of kelasNames) {
      if (existingNames.includes(namaKelas)) {
        console.log(`   ⏭  Kelas ${namaKelas} sudah ada, skip`);
        totalSkipped++;
        continue;
      }

      // Create kelas
      const kelas = await prisma.kelas.create({
        data: {
          mkId: mk.id,
          nama: namaKelas,
          tahun_ajaran: tahunAjaran,
          semester: semester,
        },
      });

      // Assign dosen pengampu (round-robin dari dosen list)
      const dosenIndex = (totalCreated % dosenList.length);
      const assignedDosen = dosenList[dosenIndex];

      await prisma.pengampu.create({
        data: {
          kelasId: kelas.id,
          dosenId: assignedDosen.id,
        },
      });

      console.log(`   ✅ Kelas ${namaKelas} dibuat, diampu oleh ${assignedDosen.user.name}`);
      totalCreated++;
    }
  }

  console.log(`\n\n✅ Selesai!`);
  console.log(`   📊 Total kelas dibuat: ${totalCreated}`);
  console.log(`   ⏭  Total kelas sudah ada (skip): ${totalSkipped}`);
  console.log(`   🎓 Total: ${totalCreated + totalSkipped} kelas\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
