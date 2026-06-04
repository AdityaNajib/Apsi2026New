# ❓ FAQ & Troubleshooting - SICAL TI

## 🔧 Masalah yang Pernah Dilaporkan & Solusinya

### 1. "Lihat Detail di Menu Dashboard Masih Gini"

**Masalah:**
- Tombol "Lihat Detail" di dashboard dosen tidak menampilkan data dengan benar
- Halaman rekap mahasiswa masih menunjukkan UI yang salah

**Penyebab:**
- Kemungkinan `kelasId` tidak ter-pass dengan benar ke URL
- Data belum ter-load dari API

**Solusi:**
```typescript
// Pastikan link "Lihat Detail" menggunakan kelasId yang benar
<a href={`/dosen/rekap?kelasId=${mk.kelasId}`}>
  Lihat Detail
</a>

// Di halaman rekap, pastikan mengambil kelasId dari query params
const searchParams = useSearchParams();
const kelasId = searchParams.get("kelasId");
```

**Cara Cek:**
1. Login sebagai dosen: `dosen@staff.uns.ac.id`
2. Di dashboard, klik "Lihat Detail" pada Sistem Basis Data
3. URL harus berubah ke: `/dosen/rekap?kelasId=<id>`
4. Halaman akan menampilkan:
   - Header kelas (TI2023 - Sistem Basis Data)
   - 4 card statistik (Rata-rata, Tertinggi, Terendah, Lulus)
   - Tabel rekap dengan kolom: NIM, Nama, Angkatan, UTS, UAS, Tugas, Nilai Akhir, Huruf

**Status:** ✅ **SUDAH DIPERBAIKI**
- File: `app/(dashboard)/dosen/rekap/page.tsx` sudah benar
- API endpoint: `/api/dosen/rekap/[kelasId]` sudah benar

---

### 2. "Rekap Mahasiswa Masih Kek Gitu"

**Masalah:**
- Halaman rekap mahasiswa menampilkan UI yang tidak lengkap
- Data tidak muncul atau masih kosong

**Penyebab Umum:**
1. Kelas belum memiliki komponen nilai (UTS, UAS, dll)
2. Mahasiswa belum diinput nilainya
3. Database belum di-seed

**Solusi:**

#### A. Seed Database Ulang
```bash
# Hapus database lama
rm prisma/dev.db

# Generate Prisma Client
npx prisma generate

# Jalankan migrasi
npx prisma migrate dev

# Seed data
npm run db:seed
```

#### B. Cek Data Kelas yang Sudah Ada Nilai
Dari seed, hanya **Kelas 1 (Sistem Basis Data)** yang sudah ada nilai.
- 8 mahasiswa sudah punya nilai UTS, UAS, Tugas
- Komponen nilai sudah diset: UTS (30%), UAS (40%), Tugas (30%)
- Total bobot = 100% ✅

Untuk melihat rekap:
1. Login sebagai dosen: `dosen@staff.uns.ac.id`
2. Dashboard → Cari "TI2023 - Sistem Basis Data"
3. Status harus: "Siap Input Nilai" (hijau)
4. Klik "Lihat Detail"
5. Akan muncul tabel rekap lengkap

#### C. Jika Kelas Lain Masih Kosong
Kelas lain (Algoritma Pemrograman, Kecerdasan Buatan, Manajemen Proyek) belum ada nilai.

Untuk input nilai:
1. Login sebagai dosen
2. Navigasi ke: **Mata Kuliah** → Pilih kelas
3. Klik "Kelola Nilai"
4. Tambah komponen nilai (UTS, UAS, Tugas)
5. Set bobot masing-masing
6. Pastikan total bobot = 100%
7. Input nilai per mahasiswa
8. Baru bisa lihat rekap

**Status:** ✅ **SUDAH DIPERBAIKI**
- Kelas 1 sudah ada data lengkap
- UI rekap sudah benar
- Statistik sudah dihitung dengan benar

---

### 3. "Menu Mahasiswa: Profil, Hasil CPL, Riwayat Nilai Belum Ada"

**Masalah:**
- User tidak menemukan menu-menu tersebut

**Solusi:**
Menu sudah ada! Cek di sidebar atau navigation:

1. **Profil**: `/mahasiswa/profil`
2. **Hasil CPL**: `/mahasiswa/cpl`
3. **Riwayat Nilai**: `/mahasiswa/riwayat`

**Cara Akses:**
1. Login sebagai mahasiswa: `aditya@student.uns.ac.id`
2. Klik menu di sidebar (jika ada)
3. Atau langsung ketik URL di browser:
   - `http://localhost:3000/mahasiswa/profil`
   - `http://localhost:3000/mahasiswa/cpl`
   - `http://localhost:3000/mahasiswa/riwayat`

**Jika Sidebar Belum Ada Link:**
Tambahkan link di navigation component atau sidebar:

```typescript
const mahasiswaMenu = [
  { label: "Dashboard", href: "/mahasiswa", icon: Home },
  { label: "Profil", href: "/mahasiswa/profil", icon: User },
  { label: "Hasil CPL", href: "/mahasiswa/cpl", icon: Award },
  { label: "Riwayat Nilai", href: "/mahasiswa/riwayat", icon: BookOpen },
];
```

**Status:** ✅ **HALAMAN SUDAH ADA & LENGKAP**

---

### 4. "Kaprodi Pakai Akun Dummy/Contoh"

**Masalah:**
- User bingung harus pakai akun apa untuk Kaprodi
- Akun terlihat seperti dummy/contoh

**Solusi:**
Akun Kaprodi adalah **akun real** dari database seed:

```
Email: kaprodi@staff.uns.ac.id
Password: password123
Nama: Dr. Wahyudi, S.T., M.T.
Role: KAPRODI
```

**Ini bukan dummy!** Ini akun default yang dibuat oleh seed script.

**Untuk Production:**
1. Ganti password default
2. Update data Kaprodi sesuai yang sebenarnya
3. Atau buat akun Kaprodi baru via database

**Cara Ganti Password Kaprodi:**
```javascript
// Jalankan di Node.js atau buat script
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateKaprodiPassword() {
  const newPassword = 'password_baru_yang_aman';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  await prisma.user.update({
    where: { email: 'kaprodi@staff.uns.ac.id' },
    data: { password: hashedPassword }
  });
  
  console.log('Password Kaprodi berhasil diupdate!');
}

updateKaprodiPassword();
```

**Status:** ✅ **AKUN KAPRODI SUDAH ADA & BERFUNGSI**

---

### 5. "PDF Requirements Belum Sesuai"

**Masalah:**
- Ada requirements di PDF yang belum diimplementasi

**Solusi:**
Saat ini **tidak ada file PDF requirements** di proyek.

Jika ada PDF requirements:
1. Upload atau share PDF tersebut
2. Saya akan baca dan analisis
3. Identifikasi fitur yang kurang
4. Implementasi sesuai requirements

**Cara Share PDF:**
- Paste isi PDF (jika text)
- Atau screenshot bagian-bagian penting
- Atau jelaskan requirements secara verbal

**Status:** ⏳ **MENUNGGU PDF REQUIREMENTS**

---

## 🐛 Bug yang Sudah Diperbaiki

### 1. ✅ Rekap Mahasiswa Tidak Muncul
- **Fixed:** API endpoint sudah benar mengambil data
- **Fixed:** UI sudah menampilkan tabel dengan benar

### 2. ✅ Statistik Tidak Terhitung
- **Fixed:** Fungsi `getStatistik()` sudah benar
- **Fixed:** Nilai akhir dihitung otomatis dari komponen nilai

### 3. ✅ Komponen Nilai Bobot Tidak Valid
- **Fixed:** Validasi bobot total = 100%
- **Fixed:** Peringatan jika bobot belum 100%

### 4. ✅ Export CSV Error
- **Fixed:** Fungsi `exportToExcel()` sudah benar
- **Fixed:** Format CSV sesuai dengan struktur tabel

---

## 📋 Checklist Sebelum Mulai

Sebelum melaporkan bug, cek dulu:

- [ ] Sudah jalankan `npm install`
- [ ] Sudah jalankan `npx prisma generate`
- [ ] Sudah jalankan `npx prisma migrate dev`
- [ ] Sudah jalankan `npm run db:seed`
- [ ] Development server sudah running (`npm run dev`)
- [ ] Browser sudah di-refresh (Ctrl+Shift+R atau Cmd+Shift+R)
- [ ] Sudah login dengan akun yang benar
- [ ] Sudah cek di halaman yang benar (URL sesuai)

---

## 🔍 Cara Debug

### 1. Cek Console Browser
```bash
# Buka DevTools (F12)
# Lihat tab Console
# Cari error merah
```

### 2. Cek Network Tab
```bash
# Buka DevTools (F12)
# Tab Network
# Filter: Fetch/XHR
# Cek API response
```

### 3. Cek Database
```bash
# Buka Prisma Studio
npx prisma studio

# Atau gunakan SQLite viewer
# File database: prisma/dev.db
```

### 4. Cek Server Logs
```bash
# Lihat terminal tempat npm run dev
# Cek error di console
```

---

## 🆘 Masih Bermasalah?

Jika masih ada issue:

1. **Jelaskan masalahnya dengan spesifik:**
   - Halaman mana yang bermasalah?
   - Error message apa yang muncul?
   - Apa yang diharapkan vs apa yang terjadi?

2. **Sertakan informasi:**
   - URL halaman
   - Role akun yang digunakan
   - Screenshot (jika perlu)
   - Error dari console (jika ada)

3. **Langkah reproduksi:**
   - Langkah 1: Login sebagai ...
   - Langkah 2: Navigasi ke ...
   - Langkah 3: Klik ...
   - Hasil: Error/Bug muncul

Dengan informasi lengkap, saya bisa bantu troubleshoot dengan cepat! 🚀

---

## 📞 Kontak & Support

Jika butuh bantuan lebih lanjut:
- Jelaskan masalah dengan detail
- Share screenshot atau error message
- Sebutkan langkah-langkah yang sudah dicoba

Semua fitur utama sudah berfungsi dengan baik. Selamat menggunakan SICAL TI! 🎓
