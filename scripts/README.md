# Scripts Directory

Kumpulan script utility untuk development dan data management.

## Data Import Scripts

### convert-pengampu-excel-to-csv.js
Konversi file Excel "Data Pengampu" ke format CSV yang siap diimport ke sistem.

**Usage:**
```bash
node scripts/convert-pengampu-excel-to-csv.js "Data Pengampu.csv" pengampu-import.csv
```

**Input:** File CSV hasil export dari Excel (Tab-separated)
**Output:** File CSV dengan format standar (Comma-separated)

### test-pengampu-import.js
Script untuk testing import pengampu API.

**Usage:**
```bash
# Pastikan server running terlebih dahulu
npm run dev

# Di terminal lain, jalankan test
node scripts/test-pengampu-import.js
```

**Prerequisites:**
```bash
npm install node-fetch form-data
```

**Output:** 
- Menampilkan hasil import
- Statistik success/skip/error
- Detail per baris (10 baris pertama)
- Daftar semua error jika ada

## Data Generation Scripts

### generate-mahasiswa-dummy.js
Generate dummy data mahasiswa untuk testing dan development.

**Usage:**
```bash
# Generate 50 mahasiswa per angkatan (default)
node scripts/generate-mahasiswa-dummy.js

# Generate dengan jumlah custom
node scripts/generate-mahasiswa-dummy.js 100
```

**Output:**
- `mahasiswa-dummy-all.csv` - Semua angkatan combined
- `mahasiswa-dummy-2022.csv` - Angkatan 2022
- `mahasiswa-dummy-2024.csv` - Angkatan 2024
- `mahasiswa-dummy-2025.csv` - Angkatan 2025

**Features:**
- Random nama Indonesia
- Sequential NIM (format: I05YYXXX)
- Email format: {nim}@student.uns.ac.id
- Password default: password123

### import-mahasiswa-dummy.js
Import dummy data mahasiswa ke database via API.

**Usage:**
```bash
# Import semua angkatan
node scripts/import-mahasiswa-dummy.js all

# Import angkatan tertentu
node scripts/import-mahasiswa-dummy.js 2022
node scripts/import-mahasiswa-dummy.js 2024
node scripts/import-mahasiswa-dummy.js 2025
```

**Prerequisites:** Server harus running (`npm run dev`)

**Output:**
- Statistik per angkatan
- Detail error jika ada
- Summary total

## Prerequisites

Beberapa script memerlukan dependencies tambahan:

```bash
# Install dependencies untuk testing
npm install --save-dev node-fetch form-data

# Atau jika menggunakan pnpm
pnpm add -D node-fetch form-data
```

## Workflow Import Data Pengampu

1. **Persiapkan Data Excel**
   - Pastikan format sesuai dengan kolom: Kode Mk, Nama Mk, Nama Dosen, Kelas
   - Export ke CSV (Tab-separated atau Comma-separated)

2. **Konversi Format** (jika perlu)
   ```bash
   node scripts/convert-pengampu-excel-to-csv.js input.csv output.csv
   ```

3. **Import Prerequisite Data**
   - Import dosen terlebih dahulu jika belum ada
   - Import mata kuliah (opsional, bisa auto-create)

4. **Import Pengampu**
   - Via API: `POST /api/admin/import/pengampu`
   - Via Script Test: `node scripts/test-pengampu-import.js`

5. **Verifikasi**
   - Cek dashboard admin untuk melihat data pengampu
   - Cek log jika ada error

## Workflow Generate & Import Mahasiswa Dummy

1. **Generate Data Mahasiswa**
   ```bash
   node scripts/generate-mahasiswa-dummy.js 50
   ```
   - Generate 50 mahasiswa per angkatan (2022, 2024, 2025)
   - Total: 150 mahasiswa
   - Output ke `sample-data/mahasiswa-dummy-*.csv`

2. **Import ke Database**
   ```bash
   node scripts/import-mahasiswa-dummy.js all
   ```
   - Import semua angkatan sekaligus
   - Atau import per angkatan untuk lebih manageable

3. **Test Login**
   - Email: `i0522001@student.uns.ac.id`
   - Password: `password123`

4. **Verifikasi**
   - Login sebagai mahasiswa
   - Cek profil dan data mahasiswa
   - Test fitur mahasiswa (CPL, riwayat, dll)

## Tips

- Selalu backup database sebelum import data besar
- Test dengan sample data kecil terlebih dahulu
- Periksa format NIDN dosen (harus sesuai dengan database)
- Gunakan mode dry-run jika tersedia untuk preview hasil import

## Troubleshooting

### Error: "Cannot find module 'node-fetch'"
Install dependencies: `npm install node-fetch form-data`

### Error: "ECONNREFUSED"
Server belum running. Jalankan: `npm run dev`

### Error: "Dosen tidak ditemukan"
Import data dosen terlebih dahulu menggunakan `/api/admin/import/dosen`

## Development

Untuk menambahkan script baru:

1. Buat file .js di directory ini
2. Tambahkan dokumentasi di README
3. Tambahkan npm script di package.json jika perlu:
   ```json
   {
     "scripts": {
       "import:pengampu": "node scripts/test-pengampu-import.js"
     }
   }
   ```
