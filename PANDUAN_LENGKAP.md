# 📘 Panduan Lengkap - Sistem Capaian Pembelajaran (SICAL) TI

## ✅ Fitur yang Sudah Ada

### 1. **Akun & Autentikasi**
Sudah tersedia 4 role akun:
- ✅ **KAPRODI** - Kepala Program Studi
- ✅ **ADMIN** - Admin Prodi yang dikelola oleh Kaprodi
- ✅ **DOSEN** - Dosen pengampu mata kuliah
- ✅ **MAHASISWA** - Mahasiswa program studi

### 2. **Dashboard Mahasiswa** ✅ LENGKAP
Menu yang tersedia:
- ✅ **Dashboard** (`/mahasiswa`) - Overview CPL, Radar Chart, Tabel Nilai CPL
- ✅ **Profil** (`/mahasiswa/profil`) - Data pribadi dan akademik lengkap
- ✅ **Hasil CPL** (`/mahasiswa/cpl`) - Detail capaian CPL dengan statistik
- ✅ **Riwayat Nilai** (`/mahasiswa/riwayat`) - Riwayat nilai per semester

### 3. **Dashboard Dosen** ✅
Menu yang tersedia:
- ✅ Dashboard overview mata kuliah diampu
- ✅ Mata Kuliah - List semua kelas yang diampu
- ✅ Input Nilai - Input nilai per komponen
- ✅ Rekap Mahasiswa - Rekap nilai dan statistik kelas

### 4. **Dashboard Kaprodi** ✅
Menu yang tersedia:
- ✅ Data Kurikulum - Kelola CPL, PI, CPMK
- ✅ Laporan CPL - Statistik dan visualisasi capaian CPL
- ✅ **Manajemen Admin** - CRUD admin prodi (NIDN, NIP, Email, Password)

### 5. **Dashboard Admin** ✅
Menu yang tersedia:
- ✅ Data Kurikulum - Kelola CPL, PI, CPMK
- ✅ Laporan CPL - Statistik dan visualisasi capaian CPL

---

## 🔑 Akun Default (dari Seed)

### Kaprodi
- **Email**: `wakhidjauhari@staff.uns.ac.id`
- **Password**: `password123`
- **Nama**: Dr. Wakhid Ahmad Jauhari, S.T., M.T.

### Admin
1. **Email**: `admin@staff.uns.ac.id`
   - **Password**: `password123`
   - **Nama**: Budi Santoso, S.Kom.

2. **Email**: `siti.admin@staff.uns.ac.id`
   - **Password**: `password123`
   - **Nama**: Siti Aminah, S.T., M.Kom.

### Dosen
1. **Email**: `dosen@staff.uns.ac.id`
   - **Password**: `password123`
   - **Nama**: Ir. Joko Widodo, M.T.
   - **NIDN**: 0612108901
   - **Mengampu**: 4 mata kuliah (Sistem Basis Data, Algoritma Pemrograman, Kecerdasan Buatan, Manajemen Proyek)

2. **Email**: `siti@staff.uns.ac.id`
   - **Password**: `password123`
   - **Nama**: Dr. Siti Nurhaliza, S.T., M.Eng.
   - **NIDN**: 0615109002

### Mahasiswa
- **Email**: `aditya@student.uns.ac.id`
- **Password**: `password123`
- **NIM**: I0323001
- **Nama**: Aditya Pratama

---

## 🚀 Cara Menjalankan Aplikasi

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate dev

# Seed data (buat akun default & data sample)
npm run db:seed
```

### 3. Jalankan Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di: `http://localhost:3000`

### 4. Login
- Buka browser: `http://localhost:3000/login`
- Gunakan salah satu akun di atas

---

## 🔄 Cara Kerja Manajemen Admin oleh Kaprodi

### Konsep:
- **Kaprodi** adalah superuser yang bisa mengelola **Admin Prodi**
- **Admin** yang dibuat oleh Kaprodi otomatis mendapat role `ADMIN` dan record di tabel `Dosen` (karena admin prodi biasanya juga dosen)
- Admin bisa mengelola data kurikulum dan melihat laporan CPL

### Langkah Kaprodi Menambah Admin:

1. **Login sebagai Kaprodi**
   - Email: `wakhidjauhari@staff.uns.ac.id`
   - Password: `password123`

2. **Buka Menu "Manajemen Admin"**
   - Navigasi: Dashboard Kaprodi → Manajemen Admin

3. **Klik "Tambah Admin"**
   - Isi form:
     - Nama Lengkap
     - Email (untuk login)
     - NIDN (Nomor Induk Dosen Nasional)
     - NIP (Nomor Induk Pegawai)
     - Password

4. **Admin Baru Sudah Terdaftar**
   - Admin bisa login menggunakan email dan password yang dibuat
   - Admin memiliki akses ke:
     - Data Kurikulum
     - Laporan CPL

### API Endpoint yang Digunakan:

#### GET `/api/kaprodi/admin`
- Mengambil semua admin prodi
- Response: `[{ id, name, email, nidn, nip, createdAt }]`

#### POST `/api/kaprodi/admin`
- Membuat admin baru
- Body: `{ name, email, nidn, nip, password }`
- Otomatis:
  - Membuat `User` dengan role `ADMIN`
  - Hash password menggunakan `bcryptjs`
  - Membuat record di tabel `Dosen` dengan `nidn` dan `nip`

#### PUT `/api/kaprodi/admin/[id]`
- Update data admin
- Body: `{ name, email, nidn, nip, password? }` (password opsional)

#### DELETE `/api/kaprodi/admin/[id]`
- Hapus admin

---

## 📊 Data yang Sudah Tersedia (dari Seed)

### Mata Kuliah (4):
1. **TI2023** - Sistem Basis Data (3 SKS, Semester 3)
2. **TI1014** - Algoritma Pemrograman (4 SKS, Semester 1)
3. **TI3055** - Kecerdasan Buatan (3 SKS, Semester 5)
4. **TI4012** - Manajemen Proyek (2 SKS, Semester 7)

### Kelas (4):
- Semua kelas diampu oleh Dosen 1 (dosen@staff.uns.ac.id)
- Tahun Ajaran: 2026/2027
- Semester: Ganjil

### Mahasiswa (10):
- Angkatan 2023
- NIM: I0323001 - I0323010
- Enrolled di berbagai kelas

### CPL (12):
- CPL-01 sampai CPL-12 sesuai standar IABEE
- Mencakup: Kemampuan Teknik, Komunikasi, Etika, Manajemen Proyek, dll.

### PI (8):
- Performance Indicators untuk CPL

### CPMK (9):
- Tersebar di 4 mata kuliah

### Nilai Mahasiswa:
- Kelas 1 (Sistem Basis Data) sudah ada nilai untuk 8 mahasiswa
- Komponen: UTS (30%), UAS (40%), Tugas (30%)

---

## 🗄️ Struktur Database

### Model Utama:

```prisma
User {
  id, name, email, password, role
  mahasiswa?, dosen?
}

Mahasiswa {
  id, nim, angkatan, status
  user, krs[], nilaiMahasiswa[]
}

Dosen {
  id, nidn, nip
  user, pengampu[]
}

MataKuliah {
  id, kode, nama, sks, semester
  kelas[], cpmk[]
}

Kelas {
  id, nama, tahun_ajaran, semester
  mataKuliah, pengampu[], krs[], komponenNilai[]
}

KomponenNilai {
  id, nama, bobot
  kelas, bobotCpmk[], nilaiMahasiswa[]
}

NilaiMahasiswa {
  id, nilai
  mahasiswa, komponen
}

CPL -> PI -> CPMK (hierarchy)
```

---

## 🔐 Role & Permission

| Role | Akses Menu |
|------|-----------|
| **KAPRODI** | Dashboard, Data Kurikulum, Laporan CPL, **Manajemen Admin** |
| **ADMIN** | Dashboard, Data Kurikulum, Laporan CPL |
| **DOSEN** | Dashboard, Mata Kuliah, Input Nilai, Rekap Mahasiswa |
| **MAHASISWA** | Dashboard, Profil, Hasil CPL, Riwayat Nilai |

---

## 🛠️ Troubleshooting

### Database tidak terbaca
```bash
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

### Login gagal
- Pastikan sudah menjalankan seed: `npm run db:seed`
- Cek email dan password sesuai dengan akun default di atas
- Password default semua akun: `password123`

### Port 3000 sudah digunakan
```bash
# Jalankan di port lain
npm run dev -- -p 3001
```

---

## 📝 Catatan Penting

1. **Tidak ada PDF Requirements** di proyek ini - fitur dibuat berdasarkan kebutuhan standar sistem CPL
2. **Admin vs Kaprodi**: 
   - Kaprodi = 1 akun khusus untuk kepala prodi
   - Admin = Bisa banyak, dikelola oleh Kaprodi
3. **Seed Data**: Jangan lupa jalankan `npm run db:seed` setiap kali reset database
4. **Database**: Menggunakan SQLite (file: `prisma/dev.db`)

---

## 📞 Informasi Tambahan

Jika ada pertanyaan atau butuh bantuan, sistem ini sudah dilengkapi dengan:
- ✅ Autentikasi lengkap (bcrypt + JWT via cookies)
- ✅ API endpoints untuk semua operasi CRUD
- ✅ UI/UX modern dengan Tailwind CSS
- ✅ Charts menggunakan Chart.js & react-chartjs-2
- ✅ Export data ke CSV/Excel

Semua fitur sudah terintegrasi dan siap digunakan! 🎉
