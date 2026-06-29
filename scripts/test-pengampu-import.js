/**
 * Script untuk testing import pengampu
 * 
 * Cara pakai:
 * 1. Pastikan server running: npm run dev
 * 2. Jalankan: node scripts/test-pengampu-import.js
 */

const fs = require('fs');
const path = require('path');

async function testImport() {
  const API_BASE = 'http://localhost:3000';
  const sampleFile = path.join(__dirname, '..', 'sample-data', 'pengampu-sample.csv');
  
  if (!fs.existsSync(sampleFile)) {
    console.error(`❌ File sample tidak ditemukan: ${sampleFile}`);
    console.log('Buat file sample terlebih dahulu atau sesuaikan path.');
    return;
  }

  console.log('🚀 Testing Import Pengampu API\n');
  console.log(`📂 File: ${sampleFile}`);
  console.log(`🌐 API: ${API_BASE}/api/admin/import/pengampu\n`);

  try {
    const FormData = require('form-data');
    const fetch = require('node-fetch');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(sampleFile));

    const url = `${API_BASE}/api/admin/import/pengampu?tahun_ajaran=2026/2027&semester=Ganjil`;
    
    console.log('📤 Mengirim request...');
    const response = await fetch(url, {
      method: 'POST',
      body: form,
    });

    const result = await response.json();
    
    console.log('\n📊 Hasil Import:');
    console.log('━'.repeat(60));
    
    if (result.summary) {
      console.log(`Total baris    : ${result.summary.total}`);
      console.log(`✅ Berhasil    : ${result.successCount}`);
      console.log(`⏭️  Dilewati    : ${result.skipCount}`);
      console.log(`⚠️  Warning    : ${result.warningCount}`);
      console.log(`❌ Error       : ${result.errorCount}`);
      console.log('━'.repeat(60));
    }

    // Tampilkan beberapa hasil
    if (result.results && result.results.length > 0) {
      console.log('\n📝 Detail (10 baris pertama):\n');
      
      const statusIcons = {
        success: '✅',
        skip: '⏭️',
        warning: '⚠️',
        error: '❌',
      };
      
      result.results.slice(0, 10).forEach(r => {
        const icon = statusIcons[r.status] || '•';
        console.log(`${icon} Baris ${r.row}: ${r.message}`);
        if (r.details) {
          console.log(`   ${r.details}`);
        }
      });
      
      if (result.results.length > 10) {
        console.log(`\n... dan ${result.results.length - 10} baris lainnya`);
      }
    }

    // Tampilkan error jika ada
    const errors = result.results?.filter(r => r.status === 'error');
    if (errors && errors.length > 0) {
      console.log('\n\n❌ Daftar Error:\n');
      errors.forEach(e => {
        console.log(`Baris ${e.row}: ${e.message}`);
        if (e.details) console.log(`  → ${e.details}`);
      });
    }

    console.log('\n✨ Test selesai!\n');
    
  } catch (error) {
    console.error('\n❌ Error saat testing:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Pastikan server sudah running: npm run dev');
    }
  }
}

// Run test
testImport().catch(console.error);
