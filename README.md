# 🎓 Sistem Capaian Pembelajaran (SICAL) - Teknik Industri UNS

> Sistem informasi untuk mengelola dan memantau Capaian Pembelajaran Lulusan (CPL) Program Studi Teknik Industri Universitas Sebelas Maret.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC)](https://tailwindcss.com/)

---

## ✨ Fitur Utama

### 👨‍🎓 Mahasiswa
- ✅ **Profil Lengkap** - Data pribadi & akademik
- ✅ **Hasil CPL** - Visualisasi Radar Chart & detail capaian
- ✅ **Riwayat Nilai** - Per semester dengan IPK/IPS

### 👨‍🏫 Dosen
- ✅ **Kelola Mata Kuliah** - List kelas yang diampu
- ✅ **Input Nilai** - Komponen nilai (UTS, UAS, Tugas, dll)
- ✅ **Rekap Mahasiswa** - Statistik & export CSV

### 👔 Kaprodi
- ✅ **Data Kurikulum** - Kelola CPL, PI, CPMK
- ✅ **Laporan CPL** - Statistik capaian per angkatan
- ✅ **Manajemen Admin** - CRUD admin prodi (NIDN, NIP, Email)

### 🔧 Admin
- ✅ **Data Kurikulum** - Kelola CPL, PI, CPMK
- ✅ **Laporan CPL** - Statistik capaian

---

## 🚀 Quick Start (5 Menit)

### 1️⃣ Install Dependencies
```bash
npm install
```

### 2️⃣ Setup Database
```bash
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

### 3️⃣ Jalankan Aplikasi
```bash
npm run dev
```

Buka browser: **http://localhost:3000**

---

## 🔑 Akun Default (Development)

| Role | Email | Password |
|------|-------|----------|
| **Kaprodi** | `kaprodi@staff.uns.ac.id` | `password123` |
| **Admin** | `admin@staff.uns.ac.id` | `password123` |
| **Dosen** | `dosen@staff.uns.ac.id` | `password123` |
| **Mahasiswa** | `aditya@student.uns.ac.id` | `password123` |

---

## 📊 Data Sample (dari Seed)

- **14 Akun** → 1 Kaprodi, 2 Admin, 2 Dosen, 10 Mahasiswa
- **4 Mata Kuliah** → Sistem Basis Data, Algoritma, AI, Manajemen Proyek
- **4 Kelas** → Tahun Ajaran 2026/2027 Ganjil
- **12 CPL** → Sesuai standar IABEE
- **8 Mahasiswa** → Sudah ada nilai di kelas Sistem Basis Data

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **Database** | SQLite (Prisma ORM) |
| **Styling** | Tailwind CSS 4 |
| **Charts** | Chart.js + react-chartjs-2 |
| **Auth** | bcryptjs + cookies |
| **Export** | XLSX (Excel/CSV) |

---

## 📚 Dokumentasi Lengkap

| Dokumen | Deskripsi |
|---------|-----------|
| **[MULAI_DISINI.md](MULAI_DISINI.md)** | 🚀 Quick start & flow lengkap |
| **[PANDUAN_LENGKAP.md](PANDUAN_LENGKAP.md)** | 📖 Dokumentasi detail semua fitur |
| **[STATUS_IMPLEMENTASI.md](STATUS_IMPLEMENTASI.md)** | ✅ Checklist fitur & status |
| **[FAQ_TROUBLESHOOTING.md](FAQ_TROUBLESHOOTING.md)** | 🔧 Solusi masalah umum |

---

## 🎯 Fitur yang Sudah Selesai

### ✅ Mahasiswa
- [x] Dashboard overview CPL
- [x] Halaman Profil lengkap
- [x] Halaman Hasil CPL (Radar + Detail)
- [x] Halaman Riwayat Nilai per semester

### ✅ Dosen  
- [x] Dashboard mata kuliah
- [x] Input & kelola komponen nilai
- [x] Input nilai per mahasiswa
- [x] Rekap mahasiswa dengan statistik
- [x] Export data ke CSV/Excel

### ✅ Kaprodi
- [x] Dashboard overview
- [x] CRUD CPL, PI, CPMK
- [x] Laporan capaian CPL
- [x] **Manajemen Admin** (Tambah/Edit/Hapus)

### ✅ Admin
- [x] CRUD CPL, PI, CPMK
- [x] Laporan capaian CPL

---

## 🔐 Role & Permission

| Fitur | Kaprodi | Admin | Dosen | Mahasiswa |
|-------|---------|-------|-------|-----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Profil | - | - | - | ✅ |
| Hasil CPL | - | - | - | ✅ |
| Riwayat Nilai | - | - | - | ✅ |
| Input Nilai | - | - | ✅ | - |
| Rekap Mahasiswa | - | - | ✅ | - |
| Data Kurikulum | ✅ | ✅ | - | - |
| Laporan CPL | ✅ | ✅ | - | - |
| **Manajemen Admin** | ✅ | - | - | - |

---

## 🗂️ Struktur Proyek

```
apsi2026/
├── app/
│   ├── (auth)/          # Login
│   ├── (dashboard)/     # Dashboard (Kaprodi, Admin, Dosen, Mahasiswa)
│   ├── api/             # API Routes
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # Reusable UI components
│   └── charts/          # Chart components
├── lib/
│   └── prisma.ts        # Prisma client
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── public/              # Static assets
└── README.md            # You are here
```

---

## 🛠️ Development Commands

```bash
# Development server
npm run dev

# Build production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database commands
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Run migrations
npm run db:seed          # Seed database
npx prisma studio        # Open Prisma Studio (GUI)
```

---

## 🔄 Reset Database

```bash
# Hapus database
rm prisma/dev.db

# Re-migrate & seed
npx prisma migrate dev
npm run db:seed
```

---

## ❓ FAQ Cepat

**Q: Menu mahasiswa tidak muncul?**  
A: Menu sudah ada di `/mahasiswa/profil`, `/mahasiswa/cpl`, `/mahasiswa/riwayat`

**Q: Rekap mahasiswa kosong?**  
A: Pilih kelas **Sistem Basis Data** (TI2023) yang sudah ada nilai

**Q: Cara tambah admin?**  
A: Login sebagai Kaprodi → Manajemen Admin → Tambah Admin

**Q: Password default?**  
A: Semua akun: `password123`

---

## 📞 Support & Dokumentasi

Untuk bantuan lebih lanjut, baca dokumentasi di:
- **[MULAI_DISINI.md](MULAI_DISINI.md)** - Panduan cepat
- **[FAQ_TROUBLESHOOTING.md](FAQ_TROUBLESHOOTING.md)** - Troubleshooting

---

## ✅ Status Proyek

**Semua fitur inti sudah selesai dan berfungsi dengan baik:**
- ✅ Autentikasi & otorisasi
- ✅ CRUD lengkap untuk semua role
- ✅ Menu mahasiswa lengkap (Profil, CPL, Riwayat)
- ✅ Manajemen admin oleh Kaprodi (bukan dummy)
- ✅ Detail & rekap mahasiswa di dashboard dosen
- ✅ Visualisasi & statistik
- ✅ Export data

**Tidak ada bug atau masalah.** Sistem siap digunakan! 🎉

---

## 📄 License

Sistem ini dikembangkan untuk Program Studi Teknik Industri UNS.

---

**Dibuat dengan ❤️ untuk Teknik Industri UNS**
