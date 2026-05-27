import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data
  await prisma.nilaiMahasiswa.deleteMany();
  await prisma.bobotCPMK.deleteMany();
  await prisma.komponenNilai.deleteMany();
  await prisma.kRS.deleteMany();
  await prisma.cPMK.deleteMany();
  await prisma.pengampu.deleteMany();
  await prisma.kelas.deleteMany();
  await prisma.mataKuliah.deleteMany();
  await prisma.pI.deleteMany();
  await prisma.cPL.deleteMany();
  await prisma.mahasiswa.deleteMany();
  await prisma.dosen.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Users
  const kaprodiUser = await prisma.user.create({
    data: {
      id: 'kaprodi-001',
      name: 'Dr. Wahyudi, S.T., M.T.',
      email: 'kaprodi@staff.uns.ac.id',
      password: hashedPassword,
      role: 'KAPRODI',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      id: 'admin-001',
      name: 'Budi Santoso, S.Kom.',
      email: 'admin@staff.uns.ac.id',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const dosenUser = await prisma.user.create({
    data: {
      id: 'dosen-001',
      name: 'Ir. Joko Widodo, M.T.',
      email: 'dosen@staff.uns.ac.id',
      password: hashedPassword,
      role: 'DOSEN',
    },
  });

  const dosen2User = await prisma.user.create({
    data: {
      id: 'dosen-002',
      name: 'Dr. Siti Nurhaliza, S.T., M.Eng.',
      email: 'siti@staff.uns.ac.id',
      password: hashedPassword,
      role: 'DOSEN',
    },
  });

  // Create Dosen
  const dosen1 = await prisma.dosen.create({
    data: {
      nidn: '0612108901',
      nip: '198912120001',
      userId: dosenUser.id,
    },
  });

  const dosen2 = await prisma.dosen.create({
    data: {
      nidn: '0615109002',
      nip: '199015150002',
      userId: dosen2User.id,
    },
  });

  // Create Mahasiswa
  const mahasiswaData = [
    { nim: 'I0323001', name: 'Aditya Pratama', email: 'aditya@student.uns.ac.id', angkatan: '2023' },
    { nim: 'I0323002', name: 'Budi Santoso', email: 'budi@student.uns.ac.id', angkatan: '2023' },
    { nim: 'I0323003', name: 'Citra Dewi', email: 'citra@student.uns.ac.id', angkatan: '2023' },
    { nim: 'I0323004', name: 'Dian Purnama', email: 'dian@student.uns.ac.id', angkatan: '2023' },
    { nim: 'I0323005', name: 'Eka Wijaya', email: 'eka@student.uns.ac.id', angkatan: '2023' },
    { nim: 'I0323006', name: 'Fajar Ramadhan', email: 'fajar@student.uns.ac.id', angkatan: '2023' },
    { nim: 'I0323007', name: 'Gita Savitri', email: 'gita@student.uns.ac.id', angkatan: '2023' },
    { nim: 'I0323008', name: 'Hendra Kusuma', email: 'hendra@student.uns.ac.id', angkatan: '2023' },
    { nim: 'I0323009', name: 'Indah Permata', email: 'indah@student.uns.ac.id', angkatan: '2023' },
    { nim: 'I0323010', name: 'Joko Susilo', email: 'joko@student.uns.ac.id', angkatan: '2023' },
  ];

  const mahasiswaList = [];
  for (const mhsData of mahasiswaData) {
    const user = await prisma.user.create({
      data: {
        name: mhsData.name,
        email: mhsData.email,
        password: hashedPassword,
        role: 'MAHASISWA',
      },
    });

    const mhs = await prisma.mahasiswa.create({
      data: {
        nim: mhsData.nim,
        angkatan: mhsData.angkatan,
        status: 'AKTIF',
        userId: user.id,
      },
    });

    mahasiswaList.push(mhs);
  }

  // Create Mata Kuliah
  const mk1 = await prisma.mataKuliah.create({
    data: {
      kode: 'TI2023',
      nama: 'Sistem Basis Data',
      sks: 3,
      semester: 3,
    },
  });

  const mk2 = await prisma.mataKuliah.create({
    data: {
      kode: 'TI1014',
      nama: 'Algoritma Pemrograman',
      sks: 4,
      semester: 1,
    },
  });

  const mk3 = await prisma.mataKuliah.create({
    data: {
      kode: 'TI3055',
      nama: 'Kecerdasan Buatan',
      sks: 3,
      semester: 5,
    },
  });

  const mk4 = await prisma.mataKuliah.create({
    data: {
      kode: 'TI4012',
      nama: 'Manajemen Proyek',
      sks: 2,
      semester: 7,
    },
  });

  // Create Kelas
  const kelas1 = await prisma.kelas.create({
    data: {
      nama: 'A',
      tahun_ajaran: '2026/2027',
      semester: 'Ganjil',
      mkId: mk1.id,
    },
  });

  const kelas2 = await prisma.kelas.create({
    data: {
      nama: 'B',
      tahun_ajaran: '2026/2027',
      semester: 'Ganjil',
      mkId: mk2.id,
    },
  });

  const kelas3 = await prisma.kelas.create({
    data: {
      nama: 'A',
      tahun_ajaran: '2026/2027',
      semester: 'Ganjil',
      mkId: mk3.id,
    },
  });

  const kelas4 = await prisma.kelas.create({
    data: {
      nama: 'A',
      tahun_ajaran: '2026/2027',
      semester: 'Ganjil',
      mkId: mk4.id,
    },
  });

  // Create Pengampu (Dosen 1 mengampu 4 kelas)
  await prisma.pengampu.create({
    data: {
      kelasId: kelas1.id,
      dosenId: dosen1.id,
    },
  });

  await prisma.pengampu.create({
    data: {
      kelasId: kelas2.id,
      dosenId: dosen1.id,
    },
  });

  await prisma.pengampu.create({
    data: {
      kelasId: kelas3.id,
      dosenId: dosen1.id,
    },
  });

  await prisma.pengampu.create({
    data: {
      kelasId: kelas4.id,
      dosenId: dosen1.id,
    },
  });

  // Create KRS (enroll mahasiswa ke kelas)
  // Kelas 1 (Sistem Basis Data) - 8 mahasiswa
  for (const mhs of mahasiswaList.slice(0, 8)) {
    await prisma.kRS.create({
      data: {
        mahasiswaId: mhs.id,
        kelasId: kelas1.id,
      },
    });
  }

  // Kelas 2 (Algoritma Pemrograman) - 7 mahasiswa
  for (const mhs of mahasiswaList.slice(0, 7)) {
    await prisma.kRS.create({
      data: {
        mahasiswaId: mhs.id,
        kelasId: kelas2.id,
      },
    });
  }

  // Kelas 3 (Kecerdasan Buatan) - 6 mahasiswa
  for (const mhs of mahasiswaList.slice(0, 6)) {
    await prisma.kRS.create({
      data: {
        mahasiswaId: mhs.id,
        kelasId: kelas3.id,
      },
    });
  }

  // Kelas 4 (Manajemen Proyek) - 5 mahasiswa
  for (const mhs of mahasiswaList.slice(0, 5)) {
    await prisma.kRS.create({
      data: {
        mahasiswaId: mhs.id,
        kelasId: kelas4.id,
      },
    });
  }

  // Create Komponen Nilai untuk Kelas 1 (Sistem Basis Data)
  const komponenUTS1 = await prisma.komponenNilai.create({
    data: {
      nama: 'UTS',
      bobot: 30,
      kelasId: kelas1.id,
    },
  });

  const komponenUAS1 = await prisma.komponenNilai.create({
    data: {
      nama: 'UAS',
      bobot: 40,
      kelasId: kelas1.id,
    },
  });

  const komponenTugas1 = await prisma.komponenNilai.create({
    data: {
      nama: 'Tugas',
      bobot: 30,
      kelasId: kelas1.id,
    },
  });

  // Create sample nilai for Kelas 1
  const nilaiSamples = [
    { uts: 75, uas: 80, tugas: 85 },
    { uts: 80, uas: 85, tugas: 90 },
    { uts: 70, uas: 75, tugas: 80 },
    { uts: 85, uas: 90, tugas: 88 },
    { uts: 78, uas: 82, tugas: 86 },
    { uts: 82, uas: 88, tugas: 84 },
    { uts: 76, uas: 80, tugas: 82 },
    { uts: 88, uas: 92, tugas: 90 },
  ];

  for (let i = 0; i < Math.min(mahasiswaList.length, nilaiSamples.length); i++) {
    const mhs = mahasiswaList[i];
    const nilai = nilaiSamples[i];

    await prisma.nilaiMahasiswa.create({
      data: {
        mahasiswaId: mhs.id,
        komponenId: komponenUTS1.id,
        nilai: nilai.uts,
      },
    });

    await prisma.nilaiMahasiswa.create({
      data: {
        mahasiswaId: mhs.id,
        komponenId: komponenUAS1.id,
        nilai: nilai.uas,
      },
    });

    await prisma.nilaiMahasiswa.create({
      data: {
        mahasiswaId: mhs.id,
        komponenId: komponenTugas1.id,
        nilai: nilai.tugas,
      },
    });
  }

  // Create Admin with Dosen profile
  const admin2User = await prisma.user.create({
    data: {
      name: 'Siti Aminah, S.T., M.Kom.',
      email: 'siti.admin@staff.uns.ac.id',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  await prisma.dosen.create({
    data: {
      nidn: '0618109103',
      nip: '199118180003',
      userId: admin2User.id,
    },
  });

  // Create CPL (12 CPL sesuai standar IABEE)
  const cpl1 = await prisma.cPL.create({
    data: {
      kode: 'CPL-01',
      deskripsi: 'Kemampuan menerapkan pengetahuan matematika, sains, dan prinsip rekayasa',
    },
  });

  const cpl2 = await prisma.cPL.create({
    data: {
      kode: 'CPL-02',
      deskripsi: 'Kemampuan merancang dan melakukan eksperimen serta menganalisis dan menginterpretasi data',
    },
  });

  const cpl3 = await prisma.cPL.create({
    data: {
      kode: 'CPL-03',
      deskripsi: 'Kemampuan merancang sistem, komponen, atau proses untuk memenuhi kebutuhan',
    },
  });

  const cpl4 = await prisma.cPL.create({
    data: {
      kode: 'CPL-04',
      deskripsi: 'Kemampuan bekerja dalam tim multidisiplin',
    },
  });

  const cpl5 = await prisma.cPL.create({
    data: {
      kode: 'CPL-05',
      deskripsi: 'Kemampuan mengidentifikasi, merumuskan, dan menyelesaikan masalah rekayasa',
    },
  });

  const cpl6 = await prisma.cPL.create({
    data: {
      kode: 'CPL-06',
      deskripsi: 'Pemahaman tanggung jawab profesional dan etika',
    },
  });

  const cpl7 = await prisma.cPL.create({
    data: {
      kode: 'CPL-07',
      deskripsi: 'Kemampuan berkomunikasi secara efektif',
    },
  });

  const cpl8 = await prisma.cPL.create({
    data: {
      kode: 'CPL-08',
      deskripsi: 'Pemahaman dampak solusi rekayasa dalam konteks global dan sosial',
    },
  });

  const cpl9 = await prisma.cPL.create({
    data: {
      kode: 'CPL-09',
      deskripsi: 'Kemampuan belajar sepanjang hayat',
    },
  });

  const cpl10 = await prisma.cPL.create({
    data: {
      kode: 'CPL-10',
      deskripsi: 'Pengetahuan tentang isu kontemporer',
    },
  });

  const cpl11 = await prisma.cPL.create({
    data: {
      kode: 'CPL-11',
      deskripsi: 'Kemampuan menggunakan teknik, keterampilan, dan peralatan modern',
    },
  });

  const cpl12 = await prisma.cPL.create({
    data: {
      kode: 'CPL-12',
      deskripsi: 'Kemampuan menerapkan prinsip manajemen proyek',
    },
  });

  // Create PI (Performance Indicators)
  const pi1 = await prisma.pI.create({
    data: {
      kode: 'PI-01-01',
      deskripsi: 'Mampu mengidentifikasi, merumuskan, dan menganalisis masalah rekayasa',
      cplId: cpl1.id,
    },
  });

  const pi2 = await prisma.pI.create({
    data: {
      kode: 'PI-01-02',
      deskripsi: 'Mampu menerapkan metode matematika untuk menyelesaikan masalah',
      cplId: cpl1.id,
    },
  });

  const pi3 = await prisma.pI.create({
    data: {
      kode: 'PI-02-01',
      deskripsi: 'Mampu merancang eksperimen untuk menguji hipotesis',
      cplId: cpl2.id,
    },
  });

  const pi4 = await prisma.pI.create({
    data: {
      kode: 'PI-02-02',
      deskripsi: 'Mampu menganalisis dan menginterpretasi data eksperimen',
      cplId: cpl2.id,
    },
  });

  const pi5 = await prisma.pI.create({
    data: {
      kode: 'PI-03-01',
      deskripsi: 'Mampu merancang sistem informasi sesuai kebutuhan',
      cplId: cpl3.id,
    },
  });

  const pi6 = await prisma.pI.create({
    data: {
      kode: 'PI-04-01',
      deskripsi: 'Mampu berkolaborasi dalam tim proyek',
      cplId: cpl4.id,
    },
  });

  const pi7 = await prisma.pI.create({
    data: {
      kode: 'PI-05-01',
      deskripsi: 'Mampu mengidentifikasi dan menyelesaikan masalah kompleks',
      cplId: cpl5.id,
    },
  });

  const pi8 = await prisma.pI.create({
    data: {
      kode: 'PI-06-01',
      deskripsi: 'Memahami kode etik profesi dan tanggung jawab profesional',
      cplId: cpl6.id,
    },
  });

  // Create CPMK (Capaian Pembelajaran Mata Kuliah)
  await prisma.cPMK.create({
    data: {
      kode: 'CPMK-TI2023-01',
      deskripsi: 'Mahasiswa mampu memahami konsep basis data relasional',
      piId: pi1.id,
      mkId: mk1.id,
    },
  });

  await prisma.cPMK.create({
    data: {
      kode: 'CPMK-TI2023-02',
      deskripsi: 'Mahasiswa mampu merancang skema basis data',
      piId: pi3.id,
      mkId: mk1.id,
    },
  });

  await prisma.cPMK.create({
    data: {
      kode: 'CPMK-TI2023-03',
      deskripsi: 'Mahasiswa mampu mengimplementasikan query SQL',
      piId: pi5.id,
      mkId: mk1.id,
    },
  });

  await prisma.cPMK.create({
    data: {
      kode: 'CPMK-TI1014-01',
      deskripsi: 'Mahasiswa mampu memahami konsep algoritma dan struktur data',
      piId: pi1.id,
      mkId: mk2.id,
    },
  });

  await prisma.cPMK.create({
    data: {
      kode: 'CPMK-TI1014-02',
      deskripsi: 'Mahasiswa mampu mengimplementasikan algoritma dalam bahasa pemrograman',
      piId: pi2.id,
      mkId: mk2.id,
    },
  });

  await prisma.cPMK.create({
    data: {
      kode: 'CPMK-TI3055-01',
      deskripsi: 'Mahasiswa mampu memahami konsep kecerdasan buatan',
      piId: pi1.id,
      mkId: mk3.id,
    },
  });

  await prisma.cPMK.create({
    data: {
      kode: 'CPMK-TI3055-02',
      deskripsi: 'Mahasiswa mampu menerapkan algoritma machine learning',
      piId: pi4.id,
      mkId: mk3.id,
    },
  });

  await prisma.cPMK.create({
    data: {
      kode: 'CPMK-TI4012-01',
      deskripsi: 'Mahasiswa mampu memahami prinsip manajemen proyek',
      piId: pi6.id,
      mkId: mk4.id,
    },
  });

  await prisma.cPMK.create({
    data: {
      kode: 'CPMK-TI4012-02',
      deskripsi: 'Mahasiswa mampu mengelola tim proyek',
      piId: pi7.id,
      mkId: mk4.id,
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- Users: 14 (1 Kaprodi, 2 Admin, 2 Dosen, 10 Mahasiswa)');
  console.log('- Mata Kuliah: 4');
  console.log('- Kelas: 4');
  console.log('- Pengampu: 4 (Dosen 1 mengampu semua kelas)');
  console.log('- Mahasiswa enrolled: 26 KRS records');
  console.log('  - Kelas 1 (Sistem Basis Data): 8 mahasiswa');
  console.log('  - Kelas 2 (Algoritma Pemrograman): 7 mahasiswa');
  console.log('  - Kelas 3 (Kecerdasan Buatan): 6 mahasiswa');
  console.log('  - Kelas 4 (Manajemen Proyek): 5 mahasiswa');
  console.log('- Komponen Nilai: 3 (UTS, UAS, Tugas) for Kelas 1');
  console.log('- Nilai Mahasiswa: 24 records');
  console.log('- CPL: 12 (sesuai standar IABEE)');
  console.log('- PI: 8 (Performance Indicators)');
  console.log('- CPMK: 9 (tersebar di 4 mata kuliah)');
  console.log('\n🔑 Login credentials:');
  console.log('- Kaprodi: kaprodi@staff.uns.ac.id / password123');
  console.log('- Admin: admin@staff.uns.ac.id / password123');
  console.log('- Dosen: dosen@staff.uns.ac.id / password123');
  console.log('  → Mengampu 4 mata kuliah:');
  console.log('    1. TI2023 - Sistem Basis Data (8 mhs) ✅ Ada nilai');
  console.log('    2. TI1014 - Algoritma Pemrograman (7 mhs)');
  console.log('    3. TI3055 - Kecerdasan Buatan (6 mhs)');
  console.log('    4. TI4012 - Manajemen Proyek (5 mhs)');
  console.log('- Mahasiswa: aditya@student.uns.ac.id / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
