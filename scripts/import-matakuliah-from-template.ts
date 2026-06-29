import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data mata kuliah dari template-upload-mk-kuriulum.xlsx
// Hanya ambil yang kode 08033XXXXXX (kurikulum terbaru)
const mataKuliahData = [
  // Semester 1
  { kode: '08033143001', nama: 'Kalkulus I', sks: 3, semester: 1 },
  { kode: '08033143002', nama: 'Fisika I', sks: 3, semester: 1 },
  { kode: '08033142003', nama: 'Kimia', sks: 2, semester: 1 },
  { kode: '08033142004', nama: 'Biologi', sks: 2, semester: 1 },
  { kode: '08033142005', nama: 'Pengantar Teknik Industri', sks: 2, semester: 1 },
  { kode: '08033142006', nama: 'Ekologi Industri', sks: 2, semester: 1 },
  { kode: '08033142007', nama: 'Menggambar Teknik', sks: 2, semester: 1 },
  { kode: '08033142008', nama: 'Algoritma dan Pemrograman Komputer', sks: 2, semester: 1 },
  { kode: '08033112001', nama: 'Pendidikan Agama Budha', sks: 2, semester: 1 },
  { kode: '08033112002', nama: 'Pendidikan Agama Hindu', sks: 2, semester: 1 },
  { kode: '08033112003', nama: 'Pendidikan Agama Islam', sks: 2, semester: 1 },
  { kode: '08033112004', nama: 'Pendidikan Agama Katolik', sks: 2, semester: 1 },
  { kode: '08033112005', nama: 'Pendidikan Agama Kong Hucu', sks: 2, semester: 1 },
  { kode: '08033112006', nama: 'Pendidikan Agama Kristen Protestan', sks: 2, semester: 1 },
  { kode: '08033112008', nama: 'Kewarganegaraan', sks: 2, semester: 1 },
  { kode: '08033122005', nama: 'Bahasa Inggris', sks: 2, semester: 1 },
  
  // Semester 2
  { kode: '08033243010', nama: 'Kalkulus II', sks: 3, semester: 2 },
  { kode: '08033243011', nama: 'Fisika II', sks: 3, semester: 2 },
  { kode: '08033241012', nama: 'Praktikum Fisika', sks: 2, semester: 2 },
  { kode: '08033242013', nama: 'Material Teknik', sks: 2, semester: 2 },
  { kode: '08033242014', nama: 'Mekanika Teknik', sks: 2, semester: 2 },
  { kode: '08033242015', nama: 'Ergonomi Kerja', sks: 2, semester: 2 },
  { kode: '08033242016', nama: 'Pengantar Pengembangan Produk', sks: 2, semester: 2 },
  { kode: '08033242017', nama: 'Analisis dan Pengendalian Biaya', sks: 2, semester: 2 },
  { kode: '08033242018', nama: 'Proses Manufaktur I', sks: 2, semester: 2 },
  
  // Semester 3
  { kode: '08033142021', nama: 'Pengukuran dan Perancangan Sistem Kerja', sks: 2, semester: 3 },
  { kode: '08033142022', nama: 'Mekatronika', sks: 2, semester: 3 },
  { kode: '08033142023', nama: 'Proses Manufaktur II', sks: 2, semester: 3 },
  { kode: '08033142024', nama: 'Elemen Mesin', sks: 2, semester: 3 },
  { kode: '08033142025', nama: 'Perilaku Organisasi', sks: 2, semester: 3 },
  { kode: '08033142027', nama: 'Manajemen Pemasaran', sks: 2, semester: 3 },
  { kode: '08033142028', nama: 'Praktikum Perancangan Teknik Industri I', sks: 2, semester: 3 },
  { kode: '08033143019', nama: 'Aljabar Linear', sks: 3, semester: 3 },
  { kode: '08033143020', nama: 'Teori Probabilitas', sks: 3, semester: 3 },
  { kode: '08033143026', nama: 'Ekonomika dan Ekonomi Teknik', sks: 3, semester: 3 },
  
  // Semester 4
  { kode: '08033242033', nama: 'Keselamatan dan Kesehatan Kerja', sks: 2, semester: 4 },
  { kode: '08033242034', nama: 'Perancangan Fasilitas', sks: 2, semester: 4 },
  { kode: '08033242035', nama: 'Analisis Sistem Produksi', sks: 2, semester: 4 },
  { kode: '08033242036', nama: 'Praktikum Perancangan Teknik Industri II', sks: 2, semester: 4 },
  { kode: '08033243029', nama: 'Matematika Optimasi', sks: 3, semester: 4 },
  { kode: '08033243030', nama: 'Statistika', sks: 3, semester: 4 },
  { kode: '08033243031', nama: 'Riset Operasi I', sks: 3, semester: 4 },
  { kode: '08033244032', nama: 'Perencanaan dan Pengendalian Produksi', sks: 4, semester: 4 },
  { kode: '08033242037', nama: 'Pancasila', sks: 2, semester: 4 },
  
  // Semester 5
  { kode: '08033122045', nama: 'Kewirausahaan', sks: 2, semester: 5 },
  { kode: '08033122047', nama: 'Kerja Praktek', sks: 2, semester: 5 },
  { kode: '08033142038', nama: 'Analitika Data', sks: 2, semester: 5 },
  { kode: '08033142039', nama: 'Otomatisasi Sistem', sks: 2, semester: 5 },
  { kode: '08033142041', nama: 'Pemodelan Sistem', sks: 2, semester: 5 },
  { kode: '08033142042', nama: 'Sistem Rantai Pasok', sks: 2, semester: 5 },
  { kode: '08033142043', nama: 'Biomekanika Kerja', sks: 2, semester: 5 },
  { kode: '08033142044', nama: 'Manajemen Proyek', sks: 2, semester: 5 },
  { kode: '08033142046', nama: 'Praktikum Perancangan Teknik Industri III', sks: 2, semester: 5 },
  { kode: '08033143040', nama: 'Riset Operasi II', sks: 3, semester: 5 },
  
  // Semester 6
  { kode: '08033222001', nama: 'Kuliah Kerja Nyata', sks: 2, semester: 6 },
  { kode: '08033242049', nama: 'Perancangan Eksperimen', sks: 2, semester: 6 },
  { kode: '08033242050', nama: 'Pengendalian dan Penjaminan Mutu', sks: 3, semester: 6 },
  { kode: '08033242052', nama: 'Analisis dan Perancangan Sistem Informasi', sks: 2, semester: 6 },
  { kode: '08033242053', nama: 'Metodologi Penelitian', sks: 2, semester: 6 },
  { kode: '08033242054', nama: 'Praktikum Perancangan Teknik Industri IV', sks: 2, semester: 6 },
  { kode: '08033242056', nama: 'Bahasa Indonesia', sks: 2, semester: 6 },
  { kode: '08033243048', nama: 'Simulasi Sistem', sks: 3, semester: 6 },
  { kode: '08033243051', nama: 'Perancangan dan Manajemen Organisasi Industri', sks: 3, semester: 6 },
  
  // Semester 6-7 (Mata Kuliah Pilihan)
  { kode: '08033353002', nama: 'Teori Persediaan', sks: 3, semester: 6 },
  { kode: '08033353006', nama: 'Pengambilan Keputusan Kriteria Majemuk', sks: 3, semester: 6 },
  { kode: '08033353008', nama: 'Manufaktur Cerdas', sks: 3, semester: 6 },
  { kode: '08033353016', nama: 'Aplikasi Ergonomi Industri', sks: 3, semester: 6 },
  { kode: '08033353023', nama: 'Analisis Komparasi Kuantitatif', sks: 3, semester: 6 },
  { kode: '08033353042', nama: 'Manajemen Rantai Pasok yang Berkelanjutan', sks: 3, semester: 6 },
  { kode: '08033353046', nama: 'Manufaktur Komposit Alam', sks: 3, semester: 6 },
  { kode: '08033353049', nama: 'Rekayasa Balik dan Manufaktur Aditif', sks: 3, semester: 6 },
  
  // Semester 7
  { kode: '08033122002', nama: 'Kerja Praktek', sks: 2, semester: 7 },
  { kode: '08033122060', nama: 'Kuliah Kerja Nyata', sks: 2, semester: 7 },
  { kode: '08033122062', nama: 'Bahasa Inggris', sks: 2, semester: 7 },
  { kode: '08033142057', nama: 'Proyek Perancangan Terpadu I', sks: 2, semester: 7 },
  { kode: '08033142058', nama: 'Proyek Perancangan Terpadu I', sks: 2, semester: 7 },
  { kode: '08033142061', nama: 'Kewarganegaraan', sks: 2, semester: 7 },
  { kode: '08033354018', nama: 'Modul Nusantara', sks: 4, semester: 7 },
  
  // Semester 8
  { kode: '08033224004', nama: 'Tugas Akhir', sks: 4, semester: 8 },
  { kode: '08033242063', nama: 'Proyek Perancangan Terpadu II', sks: 2, semester: 8 },
  { kode: '08033242064', nama: 'Skripsi', sks: 2, semester: 8 },
];

async function main() {
  console.log('🚀 Importing Mata Kuliah from Template...\n');
  console.log('📊 Source: template-upload-mk-kuriulum.xlsx');
  console.log(`📚 Total to process: ${mataKuliahData.length} mata kuliah\n`);
  
  let addedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const mk of mataKuliahData) {
    try {
      // Check if already exists
      const existing = await prisma.mataKuliah.findUnique({
        where: { kode: mk.kode }
      });
      
      if (existing) {
        console.log(`⏭️  Skip: ${mk.kode} - ${mk.nama} (already exists)`);
        skippedCount++;
      } else {
        // Create new
        await prisma.mataKuliah.create({
          data: mk
        });
        console.log(`✅ Added: ${mk.kode} - ${mk.nama} (${mk.sks} SKS, Sem ${mk.semester})`);
        addedCount++;
      }
    } catch (error) {
      console.log(`❌ Error: ${mk.kode} - ${error}`);
      errorCount++;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary:');
  console.log('='.repeat(60));
  console.log(`✅ Added   : ${addedCount}`);
  console.log(`⏭️  Skipped : ${skippedCount}`);
  console.log(`❌ Errors  : ${errorCount}`);
  console.log(`📚 Total   : ${mataKuliahData.length}`);
  console.log('='.repeat(60));
  
  // Verify total in database
  const totalInDB = await prisma.mataKuliah.count();
  console.log(`\n📊 Total mata kuliah in database: ${totalInDB}`);
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
