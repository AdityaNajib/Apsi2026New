import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Data CPL dari Excel
const cplData = [
  {
    kode: 'CPL-1',
    deskripsi: 'P1: Kemampuan untuk menerapkan pengetahuan matematika, ilmu pengetahuan alam dan/atau material, teknologi informasi, dan teknik untuk memperoleh pemahaman yang komprehensif tentang prinsip-prinsip rekayasa (CPL1/K24).'
  },
  {
    kode: 'CPL-2',
    deskripsi: 'KK1: Kemampuan untuk merancang sistem terintegrasi untuk memenuhi kebutuhan yang diinginkan dalam batasan-batasan yang realistis dalam berbagai aspek seperti teknis, standar, hukum, ekonomi, lingkungan, sosial, politik, kesehatan dan keselamatan, keberlanjutan, serta melibatkan pemangku kepentingan yang relevan, mengenali dan/atau memanfaatkan potensi sumber daya lokal dan nasional dengan perspektif global (CPL2/K24).'
  },
  {
    kode: 'CPL-3',
    deskripsi: 'KK2: Kemampuan untuk merancang dan melakukan eksperimen laboratorium dan/atau lapangan serta menganalisis dan menginterpretasikan data untuk mendukung proses pengambilan keputusan di bidang teknik industri (CPL3/K24).'
  },
  {
    kode: 'CPL-4',
    deskripsi: 'KK3: Kemampuan untuk mengidentifikasi, memformulasikan, menganalisis, dan memecahkan masalah-masalah teknik yang kompleks dalam sebuah sistem yang terintegrasi (CPL4/K24).'
  },
  {
    kode: 'CPL-5',
    deskripsi: 'KK4: Kemampuan untuk menerapkan metode, keterampilan, dan alat teknik modern yang diperlukan untuk praktik teknik industri. (CPL5/K24).'
  },
  {
    kode: 'CPL-6',
    deskripsi: 'KU1: Kemampuan untuk berkomunikasi secara efektif dengan berbagai audiens dan situasi.(CPL6/K24).'
  },
  {
    kode: 'CPL-7',
    deskripsi: 'KU2: Kemampuan untuk merencanakan, menyelesaikan, dan mengevaluasi tugas-tugas di bawah batasan-batasan tertentu (CPL7/K24).'
  },
  {
    kode: 'CPL-8',
    deskripsi: 'KU3: Kemampuan untuk bekerja dalam tim multidisiplin dan multikultural (CPL8/K24).'
  },
  {
    kode: 'CPL-9',
    deskripsi: 'S1: Kemampuan untuk bertanggung jawab kepada masyarakat dan mematuhi etika profesi dalam menyelesaikan masalah-masalah teknik industri (CPL9/K24).'
  },
  {
    kode: 'CPL-10',
    deskripsi: 'S2: Kemampuan untuk mengambil inisiatif dalam pembelajaran sepanjang hayat, termasuk akses ke pengetahuan yang relevan dalam isu-isu kontemporer (CPL10/K24).'
  }
];

// Data PI dari Excel
const piData = [
  // CPL-1 Performance Indicators
  { kode: 'I-1', deskripsi: 'Mampu menganalisis masalah keteknikan menggunakan pendekatan matematika', cplKode: 'CPL-1' },
  { kode: 'I-2', deskripsi: 'Mampu menganalisis masalah keteknikan menggunakan sains', cplKode: 'CPL-1' },
  { kode: 'I-3', deskripsi: 'Mampu menggunakan Teknologi Informasi untuk menganalisis masalah keteknikan', cplKode: 'CPL-1' },
  
  // CPL-2 Performance Indicators
  { kode: 'II-1', deskripsi: 'Mampu merancang fasilitas produksi (lini produksi) dengan mempertimbangkan K3, sistem kerja dan aspek ekonomi', cplKode: 'CPL-2' },
  { kode: 'II-2', deskripsi: 'Mampu merancang sistem organisasi', cplKode: 'CPL-2' },
  { kode: 'II-3', deskripsi: 'Mampu membuat rencana produksi', cplKode: 'CPL-2' },
  { kode: 'II-4', deskripsi: 'Mampu merancang sistem terintegrasi yang mempertimbangkan berbagai aspek', cplKode: 'CPL-2' },
  
  // CPL-3 Performance Indicators
  { kode: 'III-1', deskripsi: 'Mampu merancang eksperimen', cplKode: 'CPL-3' },
  { kode: 'III-2', deskripsi: 'Mampu melakukan eksperimen', cplKode: 'CPL-3' },
  { kode: 'III-3', deskripsi: 'Mampu menganalisis data hasil eksperimen', cplKode: 'CPL-3' },
  
  // CPL-4 Performance Indicators
  { kode: 'IV-1', deskripsi: 'Kemampuan memformulasikan masalah teknik yang kompleks', cplKode: 'CPL-4' },
  { kode: 'IV-2', deskripsi: 'Kemampuan menganalisis masalah teknik yang kompleks', cplKode: 'CPL-4' },
  { kode: 'IV-3', deskripsi: 'Kemampuan memecahkan masalah teknik yang kompleks', cplKode: 'CPL-4' },
  
  // CPL-5 Performance Indicators
  { kode: 'V-1', deskripsi: 'Mampu menggunakan metode teknik modern untuk menganalisis masalah keteknikan', cplKode: 'CPL-5' },
  { kode: 'V-2', deskripsi: 'Terampil menggunakan alat teknik modern', cplKode: 'CPL-5' },
  
  // CPL-6 Performance Indicators
  { kode: 'VI-1', deskripsi: 'Mampu menyampaikan hasil pekerjaan dalam bentuk laporan tertulis', cplKode: 'CPL-6' },
  { kode: 'VI-2', deskripsi: 'Mampu berkomunikasi secara verbal dengan stakeholder', cplKode: 'CPL-6' },
  
  // CPL-7 Performance Indicators
  { kode: 'VII-1', deskripsi: 'Mampu membuat perencanaan waktu, biaya dan sumber daya dalam proyek keteknikan', cplKode: 'CPL-7' },
  { kode: 'VII-2', deskripsi: 'Mampu melaksanakan tugas sesuai rencana dan sumber daya yang ada', cplKode: 'CPL-7' },
  { kode: 'VII-3', deskripsi: 'Mampu mengevaluasi tugas', cplKode: 'CPL-7' },
  
  // CPL-8 Performance Indicators
  { kode: 'VIII-1', deskripsi: 'Mampu melaksanakan tugas yang menjadi tanggung jawabnya dalam sebuah tim', cplKode: 'CPL-8' },
  { kode: 'VIII-2', deskripsi: 'Mampu berkontribusi secara kolaboratif dalam tim', cplKode: 'CPL-8' },
  
  // CPL-9 Performance Indicators
  { kode: 'IX-1', deskripsi: 'Kemampuan menerapkan standar, regulasi, dan kebijakan yang relevan dalam penyelesaian masalah teknik industri', cplKode: 'CPL-9' },
  { kode: 'IX-2', deskripsi: 'Kemampuan menerapkan prinsip etika dalam menyelesaikan permasalahan teknik industri', cplKode: 'CPL-9' },
  
  // CPL-10 Performance Indicators
  { kode: 'X-1', deskripsi: 'Mengidentifikasi sumber pengetahuan dan informasi untuk meningkatkan kompetensi', cplKode: 'CPL-10' },
  { kode: 'X-2', deskripsi: 'Mampu menganalisis isu isu kontemporer dalam konteks teknik industri', cplKode: 'CPL-10' },
];

async function main() {
  console.log('🚀 Importing CPL and PI data from Excel...\n');
  
  // Clear existing data (optional - comment out if you want to keep old data)
  console.log('🗑️  Clearing existing CPL and PI data...');
  await prisma.cPMK.deleteMany({});
  await prisma.pI.deleteMany({});
  await prisma.cPL.deleteMany({});
  console.log('✅ Cleared!\n');
  
  // Import CPL
  console.log('📚 Importing CPL...');
  let cplCount = 0;
  for (const cpl of cplData) {
    try {
      await prisma.cPL.create({
        data: cpl
      });
      console.log(`✅ ${cpl.kode}: ${cpl.deskripsi.substring(0, 60)}...`);
      cplCount++;
    } catch (error) {
      console.log(`❌ Error: ${cpl.kode} - ${error}`);
    }
  }
  console.log(`\n📊 CPL imported: ${cplCount}/${cplData.length}\n`);
  
  // Import PI
  console.log('📋 Importing PI...');
  let piCount = 0;
  for (const pi of piData) {
    try {
      // Find CPL
      const cpl = await prisma.cPL.findUnique({
        where: { kode: pi.cplKode }
      });
      
      if (!cpl) {
        console.log(`❌ CPL not found: ${pi.cplKode} for PI ${pi.kode}`);
        continue;
      }
      
      await prisma.pI.create({
        data: {
          kode: pi.kode,
          deskripsi: pi.deskripsi,
          cplId: cpl.id
        }
      });
      console.log(`✅ ${pi.kode}: ${pi.deskripsi.substring(0, 60)}...`);
      piCount++;
    } catch (error) {
      console.log(`❌ Error: ${pi.kode} - ${error}`);
    }
  }
  console.log(`\n📊 PI imported: ${piCount}/${piData.length}\n`);
  
  // Summary
  console.log('='.repeat(60));
  console.log('🎉 Import Complete!');
  console.log('='.repeat(60));
  console.log(`✅ CPL imported: ${cplCount}`);
  console.log(`✅ PI imported : ${piCount}`);
  console.log('='.repeat(60));
  
  // Verify
  console.log('\n📊 Verification:');
  const cplVerify = await prisma.cPL.findMany({
    include: {
      pi: true
    }
  });
  
  for (const cpl of cplVerify) {
    console.log(`   ${cpl.kode}: ${cpl.pi.length} PI`);
  }
}

main()
  .catch((e) => {
    console.error('Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
