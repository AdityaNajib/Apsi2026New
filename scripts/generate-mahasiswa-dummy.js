/**
 * Script untuk generate dummy data mahasiswa
 * Angkatan: 2022, 2024, 2025
 * 
 * Cara pakai:
 * node scripts/generate-mahasiswa-dummy.js [jumlah_per_angkatan]
 * 
 * Contoh:
 * node scripts/generate-mahasiswa-dummy.js 50
 * → Generate 50 mahasiswa untuk setiap angkatan (total 150)
 */

const fs = require('fs');
const path = require('path');

// Daftar nama depan Indonesia
const namaDepan = [
  'Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gita', 'Hadi',
  'Indah', 'Joko', 'Kartika', 'Lina', 'Made', 'Nur', 'Oscar', 'Putri',
  'Reza', 'Siti', 'Taufik', 'Umi', 'Vera', 'Wati', 'Yani', 'Zahra',
  'Andi', 'Bayu', 'Candra', 'Dian', 'Eka', 'Faris', 'Galih', 'Hana',
  'Ilham', 'Joni', 'Kiki', 'Lestari', 'Maya', 'Nanda', 'Olivia', 'Prima',
  'Rani', 'Surya', 'Tari', 'Umar', 'Vina', 'Winda', 'Yoga', 'Zaki',
  'Arif', 'Bella', 'Chandra', 'Diana', 'Fauzi', 'Gilang', 'Hendra',
  'Irma', 'Jaya', 'Kurnia', 'Laila', 'Maulana', 'Nina', 'Oki',
  'Prasetyo', 'Qori', 'Rini', 'Samsul', 'Tina', 'Utami', 'Wahyu',
  'Yuda', 'Zulfan', 'Agus', 'Bambang', 'Cahya', 'Dini', 'Erwana',
];

// Daftar nama belakang Indonesia
const namaBelakang = [
  'Pratama', 'Putra', 'Putri', 'Wijaya', 'Kusuma', 'Santoso', 'Saputra',
  'Permana', 'Wibowo', 'Nugroho', 'Hidayat', 'Ramadhan', 'Firmansyah',
  'Setiawan', 'Harahap', 'Gunawan', 'Susanto', 'Kurniawan', 'Utomo',
  'Prabowo', 'Atmaja', 'Anggraini', 'Lestari', 'Sari', 'Rahayu',
  'Maharani', 'Prasetyo', 'Hermawan', 'Syahputra', 'Budiman', 'Saputri',
  'Wulandari', 'Cahyani', 'Aditya', 'Maulana', 'Safitri', 'Azzahra',
  'Nurfadilah', 'Andriani', 'Kusumawati', 'Prihatin', 'Suryanto',
  'Mulyadi', 'Irawan', 'Handoko', 'Sirait', 'Pangestu', 'Darmawan',
];

// Generate nama random Indonesia
function generateNama() {
  const depan = namaDepan[Math.floor(Math.random() * namaDepan.length)];
  const belakang = namaBelakang[Math.floor(Math.random() * namaBelakang.length)];
  
  // Kadang tambah nama tengah
  if (Math.random() > 0.6) {
    const tengah = namaDepan[Math.floor(Math.random() * namaDepan.length)];
    return `${depan} ${tengah} ${belakang}`;
  }
  
  return `${depan} ${belakang}`;
}

// Generate NIM: format I0522XXX (Teknik Industri UNS)
// I = Teknik Industri
// 05 = Fakultas (FT)
// 22/24/25 = Angkatan
// XXX = Nomor urut
function generateNIM(angkatan, urutan) {
  const tahunShort = angkatan.substring(2); // 2022 → 22
  const nomorUrut = String(urutan).padStart(3, '0');
  return `I05${tahunShort}${nomorUrut}`;
}

// Generate email dari nama
function generateEmail(nim) {
  return `${nim.toLowerCase()}@student.uns.ac.id`;
}

// Generate data mahasiswa
function generateMahasiswaData(angkatan, jumlah) {
  const data = [];
  const usedNames = new Set();
  const usedNIMs = new Set();
  
  let urutan = 1;
  while (data.length < jumlah) {
    const nama = generateNama();
    const nim = generateNIM(angkatan, urutan);
    
    // Skip jika nama atau NIM sudah dipakai (untuk avoid duplicate)
    if (usedNames.has(nama) || usedNIMs.has(nim)) {
      urutan++;
      continue;
    }
    
    const email = generateEmail(nim);
    
    data.push({
      name: nama,
      email: email,
      nim: nim,
      angkatan: angkatan,
    });
    
    usedNames.add(nama);
    usedNIMs.add(nim);
    urutan++;
  }
  
  return data;
}

// Write CSV
function writeCSV(data, filename) {
  const headers = ['name', 'email', 'nim', 'angkatan'];
  const csvLines = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h] || '';
      // Escape jika ada koma atau quote
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    });
    csvLines.push(values.join(','));
  }
  
  fs.writeFileSync(filename, csvLines.join('\n'), 'utf8');
}

// Main execution
const args = process.argv.slice(2);
const jumlahPerAngkatan = args[0] ? parseInt(args[0], 10) : 50;

if (isNaN(jumlahPerAngkatan) || jumlahPerAngkatan < 1) {
  console.error('Error: Jumlah harus berupa angka positif');
  console.log('\nUsage: node generate-mahasiswa-dummy.js [jumlah_per_angkatan]');
  console.log('Contoh: node scripts/generate-mahasiswa-dummy.js 50');
  process.exit(1);
}

console.log('🎓 Generate Dummy Data Mahasiswa');
console.log('═'.repeat(60));
console.log(`Jumlah per angkatan: ${jumlahPerAngkatan}`);
console.log('Angkatan: 2022, 2024, 2025');
console.log(`Total: ${jumlahPerAngkatan * 3} mahasiswa\n`);

const angkatanList = ['2022', '2024', '2025'];
const allData = [];

for (const angkatan of angkatanList) {
  console.log(`📝 Generating data angkatan ${angkatan}...`);
  const data = generateMahasiswaData(angkatan, jumlahPerAngkatan);
  allData.push(...data);
  console.log(`   ✓ ${data.length} mahasiswa generated`);
}

// Write to separate files per angkatan
const outputDir = path.join(__dirname, '..', 'sample-data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('\n📁 Writing files...');

// Write combined file
const combinedFile = path.join(outputDir, 'mahasiswa-dummy-all.csv');
writeCSV(allData, combinedFile);
console.log(`   ✓ ${combinedFile}`);
console.log(`     Total: ${allData.length} mahasiswa`);

// Write per angkatan
for (const angkatan of angkatanList) {
  const angkatanData = allData.filter(m => m.angkatan === angkatan);
  const filename = path.join(outputDir, `mahasiswa-dummy-${angkatan}.csv`);
  writeCSV(angkatanData, filename);
  console.log(`   ✓ ${filename}`);
  console.log(`     Angkatan ${angkatan}: ${angkatanData.length} mahasiswa`);
}

console.log('\n📊 Summary:');
console.log('═'.repeat(60));
console.log(`Total mahasiswa generated: ${allData.length}`);
console.log(`Files created: 4 (1 combined + 3 per angkatan)`);

console.log('\n🎯 Sample data (5 baris pertama):');
console.log('─'.repeat(60));
allData.slice(0, 5).forEach(m => {
  console.log(`${m.nim} | ${m.name.padEnd(25)} | Angkatan ${m.angkatan}`);
});

console.log('\n📤 Next steps:');
console.log('1. Review file CSV di folder sample-data/');
console.log('2. Import ke sistem:');
console.log('   curl -X POST "http://localhost:3000/api/admin/import/mahasiswa" \\');
console.log('     -F "file=@sample-data/mahasiswa-dummy-all.csv"');
console.log('3. Atau import per angkatan untuk lebih manageable');
console.log('\n✨ Done!\n');
