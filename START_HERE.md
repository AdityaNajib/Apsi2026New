# 🚀 START HERE - Dashboard Dosen SICAL-TI

## ✅ DATABASE SUDAH SIAP!

Database SQLite sudah dibuat dan terisi dengan data dummy lengkap.

---

## 🎯 LANGKAH CEPAT (30 Detik)

### 1. Start Server
```bash
npm run dev
```

### 2. Buka Browser
```
http://localhost:3000/login
```

### 3. Login Dosen
```
Email: dosen@staff.uns.ac.id
Password: password123
```

### 4. Test Fitur
- Klik **"Mata Kuliah Ampu"** di sidebar
- Klik **"Kelola Nilai"** pada Sistem Basis Data
- Lihat nilai 8 mahasiswa yang sudah ada
- Klik **"Rekap Mahasiswa"** di sidebar
- Lihat statistik & klik **"Export CSV"**

---

## 📊 DATA YANG SUDAH ADA

### Mata Kuliah
- **TI2023 - Sistem Basis Data** (40 mahasiswa) ← **SUDAH ADA NILAI**
- TI1014 - Algoritma Pemrograman (35 mahasiswa)
- TI3055 - Kecerdasan Buatan (30 mahasiswa)
- TI4012 - Manajemen Proyek (0 mahasiswa)

### Komponen Nilai (Sistem Basis Data)
- UTS: 30%
- UAS: 40%
- Tugas: 30%

### Mahasiswa dengan Nilai
8 mahasiswa sudah punya nilai lengkap di kelas Sistem Basis Data.

---

## 🎮 TEST SCENARIO

### Scenario 1: Lihat Nilai yang Sudah Ada
```
1. Login dosen
2. Sidebar → Mata Kuliah Ampu
3. Klik "Kelola Nilai" pada TI2023
4. Lihat tabel nilai 8 mahasiswa
```

### Scenario 2: Edit Nilai
```
1. Di halaman Input Nilai
2. Ubah nilai UTS mahasiswa pertama
3. Klik "Simpan"
4. Refresh halaman → nilai berubah
```

### Scenario 3: Tambah Komponen Baru
```
1. Klik "Tambah Komponen"
2. Nama: "Quiz", Bobot: 10
3. Klik "Tambah"
4. ⚠️ Total bobot jadi 110% (error)
5. Edit UTS jadi 25%, UAS jadi 35%
6. Total bobot jadi 100% ✓
```

### Scenario 4: Lihat Rekap
```
1. Sidebar → Rekap Mahasiswa
2. Pilih "TI2023 - Sistem Basis Data"
3. Lihat statistik kelas
4. Klik "Export CSV"
```

---

## 🔑 LOGIN CREDENTIALS

| Role      | Email                      | Password    |
|-----------|----------------------------|-------------|
| **Dosen** | dosen@staff.uns.ac.id      | password123 |
| Dosen 2   | siti@staff.uns.ac.id       | password123 |
| Mahasiswa | aditya@student.uns.ac.id   | password123 |
| Kaprodi   | kaprodi@staff.uns.ac.id    | password123 |
| Admin     | admin@staff.uns.ac.id      | password123 |

---

## 🗄️ LIHAT DATABASE

```bash
npx prisma studio
```

Buka `http://localhost:5555` untuk explore database dengan GUI.

---

## 📚 DOKUMENTASI LENGKAP

- **README_FINAL.md** - Overview lengkap & testing guide
- **QUICK_START.md** - Quick start dengan screenshot
- **API_DOCUMENTATION.md** - API endpoints
- **SETUP_DATABASE.md** - Database troubleshooting

---

## 🐛 TROUBLESHOOTING

### Server tidak jalan
```bash
# Pastikan port 3000 tidak dipakai
npm run dev -- -p 3001
```

### Data tidak muncul
```bash
# Re-seed database
npm run db:seed
```

### Error di browser
```
Buka Console (F12) → lihat error message
```

---

## 🎉 FITUR YANG BISA DICOBA

### ✅ Mata Kuliah Ampu
- Lihat daftar mata kuliah
- Statistik: Total MK, Mahasiswa, SKS
- Status komponen nilai

### ✅ Input Nilai
- **CRUD Komponen Nilai**
  - Tambah (UTS, UAS, Tugas, Quiz, dll)
  - Edit bobot
  - Hapus komponen
  - Validasi total 100%
- **Input Nilai Mahasiswa**
  - Input nilai per komponen
  - Simpan individual atau batch
  - Range 0-100

### ✅ Rekap Mahasiswa
- Pilih mata kuliah
- **Statistik:**
  - Rata-rata kelas
  - Nilai tertinggi
  - Nilai terendah
  - Jumlah lulus
- **Tabel Rekap:**
  - Nilai per komponen
  - Nilai akhir (weighted average)
  - Nilai huruf (A, A-, B+, B, B-, C+, C, C-, D, E)
- **Export CSV**

---

## 💡 TIPS

1. **Sistem Basis Data** adalah satu-satunya kelas yang sudah ada nilai lengkap
2. Untuk kelas lain, Anda perlu tambah komponen nilai dulu
3. Total bobot komponen harus 100% sebelum bisa input nilai
4. Nilai akhir dihitung otomatis dengan weighted average
5. Export CSV bisa dibuka di Excel

---

## 🚀 SELAMAT MENCOBA!

Jika ada pertanyaan atau error, cek dokumentasi lengkap di file-file MD lainnya.

**Happy Teaching! 📚**
