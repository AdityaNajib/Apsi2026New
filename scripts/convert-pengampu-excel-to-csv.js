/**
 * Script untuk membantu konversi data Excel Pengampu ke format CSV
 * 
 * Cara pakai:
 * 1. Export Excel "Data Pengampu.xlsx" ke CSV (Save As → CSV UTF-8)
 * 2. Jalankan script ini: node scripts/convert-pengampu-excel-to-csv.js input.csv output.csv
 * 3. Upload output.csv ke sistem
 */

const fs = require('fs');
const path = require('path');

function parseCSV(text) {
  const lines = text.replace(/\r/g, '').split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split('\t').map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split('\t');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (values[i] ?? '').trim(); });
    return obj;
  });
}

function convertToImportFormat(rows) {
  const output = [];
  
  for (const row of rows) {
    // Skip baris yang tidak lengkap
    if (!row['Kode Mk'] || !row['Nama Dosen'] || !row['Kelas']) {
      continue;
    }
    
    output.push({
      kode_mk: row['Kode Mk'],
      nama_mk: row['Nama Mk'],
      nama_dosen: row['Nama Dosen'],
      kelas: row['Kelas'],
      // Tambahkan tahun_ajaran dan semester jika ada di Excel
      // Jika tidak ada, bisa set default atau kosongkan
      tahun_ajaran: '', // akan gunakan default dari query param
      semester: '', // akan gunakan default dari query param
    });
  }
  
  return output;
}

function writeCSV(data, filename) {
  if (data.length === 0) {
    console.log('Tidak ada data untuk ditulis');
    return;
  }
  
  const headers = Object.keys(data[0]);
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
  console.log(`✓ File berhasil dibuat: ${filename}`);
  console.log(`  Total baris: ${data.length}`);
}

// Main execution
const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node convert-pengampu-excel-to-csv.js <input.csv> <output.csv>');
  console.log('\nContoh:');
  console.log('  node scripts/convert-pengampu-excel-to-csv.js "Data Pengampu.csv" pengampu-import.csv');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1];

if (!fs.existsSync(inputFile)) {
  console.error(`Error: File tidak ditemukan: ${inputFile}`);
  process.exit(1);
}

console.log(`Membaca file: ${inputFile}`);
const text = fs.readFileSync(inputFile, 'utf8');
const rows = parseCSV(text);
console.log(`Ditemukan ${rows.length} baris data`);

const converted = convertToImportFormat(rows);
console.log(`Berhasil konversi ${converted.length} baris`);

writeCSV(converted, outputFile);

console.log('\n📝 Langkah selanjutnya:');
console.log(`1. Upload file ${outputFile} ke sistem`);
console.log('2. Gunakan endpoint: POST /api/admin/import/pengampu');
console.log('3. Tambahkan query params jika perlu:');
console.log('   ?tahun_ajaran=2026/2027&semester=Ganjil');
