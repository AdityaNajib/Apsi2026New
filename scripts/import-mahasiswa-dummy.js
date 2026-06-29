/**
 * Script untuk import dummy data mahasiswa ke database
 * 
 * Cara pakai:
 * node scripts/import-mahasiswa-dummy.js [all|2022|2024|2025]
 * 
 * Contoh:
 * node scripts/import-mahasiswa-dummy.js all    → Import semua angkatan
 * node scripts/import-mahasiswa-dummy.js 2022   → Import angkatan 2022 saja
 */

const fs = require('fs');
const path = require('path');

async function importMahasiswa(filename) {
  const API_BASE = 'http://localhost:3000';
  const filePath = path.join(__dirname, '..', 'sample-data', filename);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File tidak ditemukan: ${filePath}`);
    return null;
  }

  try {
    const FormData = require('form-data');
    const fetch = require('node-fetch');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const url = `${API_BASE}/api/admin/import/mahasiswa`;
    
    console.log(`📤 Importing ${filename}...`);
    const response = await fetch(url, {
      method: 'POST',
      body: form,
    });

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error(`❌ Error importing ${filename}:`, error.message);
    return null;
  }
}

function displayResults(result, label) {
  if (!result) {
    console.log(`❌ ${label}: Import gagal\n`);
    return;
  }
  
  console.log(`\n📊 Hasil Import ${label}:`);
  console.log('─'.repeat(60));
  console.log(`✅ Berhasil : ${result.successCount}`);
  console.log(`❌ Error    : ${result.errorCount}`);
  
  if (result.errorCount > 0 && result.results) {
    const errors = result.results.filter(r => r.status === 'error');
    console.log(`\n⚠️  Error details (${Math.min(5, errors.length)} pertama):`);
    errors.slice(0, 5).forEach(e => {
      console.log(`   Baris ${e.row}: ${e.message}`);
    });
    if (errors.length > 5) {
      console.log(`   ... dan ${errors.length - 5} error lainnya`);
    }
  }
  
  console.log('');
}

async function main() {
  const args = process.argv.slice(2);
  const target = args[0] || 'all';
  
  console.log('🎓 Import Dummy Data Mahasiswa');
  console.log('═'.repeat(60));
  console.log(`Target: ${target}\n`);
  
  const files = {
    'all': 'mahasiswa-dummy-all.csv',
    '2022': 'mahasiswa-dummy-2022.csv',
    '2024': 'mahasiswa-dummy-2024.csv',
    '2025': 'mahasiswa-dummy-2025.csv',
  };
  
  if (!files[target]) {
    console.error(`❌ Target tidak valid: ${target}`);
    console.log('\nTarget yang valid: all, 2022, 2024, 2025');
    console.log('\nContoh:');
    console.log('  node scripts/import-mahasiswa-dummy.js all');
    console.log('  node scripts/import-mahasiswa-dummy.js 2022');
    process.exit(1);
  }
  
  if (target === 'all') {
    // Import all angkatan
    console.log('📦 Importing semua angkatan...\n');
    
    for (const [angkatan, filename] of Object.entries(files)) {
      if (angkatan === 'all') continue;
      
      const result = await importMahasiswa(filename);
      displayResults(result, `Angkatan ${angkatan}`);
      
      // Delay sedikit antar request
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } else {
    // Import specific angkatan
    const filename = files[target];
    const result = await importMahasiswa(filename);
    displayResults(result, `Angkatan ${target}`);
  }
  
  console.log('✨ Import selesai!\n');
}

// Check prerequisites
const FormData = require('form-data');
const fetch = require('node-fetch');

if (!FormData || !fetch) {
  console.error('❌ Missing dependencies!');
  console.log('\nInstall dengan:');
  console.log('  npm install node-fetch form-data');
  process.exit(1);
}

// Run
main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  
  if (error.code === 'ECONNREFUSED') {
    console.log('\n💡 Pastikan server sudah running:');
    console.log('   npm run dev');
  }
  
  process.exit(1);
});
