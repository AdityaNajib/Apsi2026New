import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySemesterGenap() {
  console.log('=== VERIFIKASI DATABASE SEMESTER GENAP ===\n');

  // Check mata kuliah distribution
  const allMatkul = await prisma.mataKuliah.findMany({
    select: {
      id: true,
      kode: true,
      nama: true,
      semester: true,
      _count: {
        select: { kelas: true }
      }
    },
    orderBy: [{ semester: 'asc' }, { kode: 'asc' }]
  });

  console.log('1️⃣ DISTRIBUSI MATA KULIAH DAN KELAS\n');
  
  for (let sem = 1; sem <= 8; sem++) {
    const mkSem = allMatkul.filter(m => m.semester === sem);
    const totalKelas = mkSem.reduce((sum, m) => sum + m._count.kelas, 0);
    const isGenap = [2, 4, 6, 8].includes(sem);
    const status = isGenap ? '✅' : '❌';
    const expected = isGenap ? 'HARUS ADA KELAS' : 'TIDAK BOLEH ADA KELAS';
    const actual = totalKelas > 0 ? 'ADA KELAS' : 'TIDAK ADA KELAS';
    const check = (isGenap && totalKelas > 0) || (!isGenap && totalKelas === 0) ? '✅' : '❌';
    
    console.log(`${status} Semester ${sem}: ${mkSem.length} MK, ${totalKelas} kelas`);
    console.log(`   Expected: ${expected} | Actual: ${actual} ${check}\n`);
  }

  // Check mahasiswa per angkatan
  console.log('2️⃣ MAHASISWA PER ANGKATAN\n');
  
  const mahasiswaByAngkatan = await prisma.mahasiswa.groupBy({
    by: ['angkatan'],
    _count: { id: true },
    orderBy: { angkatan: 'desc' }
  });

  mahasiswaByAngkatan.forEach(m => {
    let expectedSemester;
    if (m.angkatan === '2025') expectedSemester = 2;
    else if (m.angkatan === '2024') expectedSemester = 4;
    else if (m.angkatan === '2023') expectedSemester = 6;
    else if (m.angkatan === '2022') expectedSemester = 8;
    
    console.log(`Angkatan ${m.angkatan}: ${m._count.id} mahasiswa → Semester ${expectedSemester} (GENAP)`);
  });

  // Check KRS distribution
  console.log('\n3️⃣ DISTRIBUSI KRS PER SEMESTER MATA KULIAH\n');
  
  const krsData = await prisma.kRS.findMany({
    select: {
      kelas: {
        select: {
          mataKuliah: {
            select: { semester: true }
          }
        }
      }
    }
  });

  const krsBySemester = {};
  krsData.forEach(krs => {
    const sem = krs.kelas.mataKuliah.semester;
    krsBySemester[sem] = (krsBySemester[sem] || 0) + 1;
  });

  for (let sem = 1; sem <= 8; sem++) {
    const count = krsBySemester[sem] || 0;
    const isGenap = [2, 4, 6, 8].includes(sem);
    const status = isGenap ? '✅' : '❌';
    const check = (isGenap && count > 0) || (!isGenap && count === 0) ? '✅' : '⚠️';
    console.log(`${status} Semester ${sem}: ${count} KRS ${check}`);
  }

  // Check unique active students
  console.log('\n4️⃣ MAHASISWA AKTIF YANG MENGAMBIL KELAS\n');
  
  const uniqueStudents = await prisma.kRS.findMany({
    select: {
      mahasiswaId: true,
      mahasiswa: {
        select: {
          nim: true,
          angkatan: true
        }
      }
    },
    distinct: ['mahasiswaId']
  });

  const studentsByAngkatan = {};
  uniqueStudents.forEach(s => {
    const angkatan = s.mahasiswa.angkatan;
    studentsByAngkatan[angkatan] = (studentsByAngkatan[angkatan] || 0) + 1;
  });

  Object.keys(studentsByAngkatan).sort().reverse().forEach(angkatan => {
    console.log(`Angkatan ${angkatan}: ${studentsByAngkatan[angkatan]} mahasiswa aktif`);
  });

  console.log(`\nTotal mahasiswa unik yang mengambil kelas: ${uniqueStudents.length}`);

  // Final summary
  console.log('\n5️⃣ RINGKASAN DATABASE\n');
  
  const counts = await prisma.$transaction([
    prisma.mataKuliah.count(),
    prisma.kelas.count(),
    prisma.kRS.count(),
    prisma.mahasiswa.count(),
    prisma.pengampu.count(),
    prisma.komponenNilai.count(),
    prisma.nilaiMahasiswa.count()
  ]);

  console.log(`📚 Mata Kuliah: ${counts[0]}`);
  console.log(`🏫 Kelas: ${counts[1]} (hanya semester genap)`);
  console.log(`📝 KRS: ${counts[2]}`);
  console.log(`👨‍🎓 Mahasiswa: ${counts[3]}`);
  console.log(`👨‍🏫 Pengampu: ${counts[4]}`);
  console.log(`📊 Komponen Nilai: ${counts[5]}`);
  console.log(`💯 Nilai Mahasiswa: ${counts[6]}`);

  console.log('\n✅ VERIFIKASI SELESAI!\n');

  await prisma.$disconnect();
}

verifySemesterGenap().catch(console.error);
