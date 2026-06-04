# 🎓 SICAL-TI UNS - Sistem Capaian Pembelajaran Lulusan

**Sistem Informasi Capaian Pembelajaran Lulusan**  
**Program Studi Teknik Industri - Universitas Sebelas Maret**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Deskripsi

SICAL-TI UNS adalah sistem manajemen capaian pembelajaran lulusan (CPL) yang dirancang khusus untuk Program Studi Teknik Industri UNS. Sistem ini membantu dalam:

- 📊 Monitoring dan evaluasi capaian pembelajaran mahasiswa
- 📝 Manajemen kurikulum (CPL, PI/IK, CPMK)
- 🎯 Input dan rekap nilai mahasiswa
- 📈 Visualisasi capaian CPL dengan grafik
- 📄 Export laporan dalam format CSV/Excel

---

## ✨ Fitur Utama

### 🔐 Multi-Role Dashboard

#### 1. **Dashboard Kaprodi**
- Manajemen Admin Prodi (CRUD)
- Kelola Kurikulum (CPL, PI/IK, CPMK)
- Laporan Capaian CPL
- Visualisasi & Analitik

#### 2. **Dashboard Admin**
- Kelola Data Kurikulum
- Lihat Laporan CPL
- Export Data

#### 3. **Dashboard Dosen**
- Daftar Mata Kuliah yang Diampu
- Input Nilai Mahasiswa per Komponen
- Rekap Nilai dengan Statistik
- Export CSV

#### 4. **Dashboard Mahasiswa**
- Profil Akademik Lengkap
- Hasil Capaian CPL (Radar Chart)
- Riwayat Nilai per Semester
- Progress Pembelajaran

---

## 🏗️ Teknologi

### Frontend
- **Next.js 15** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Recharts** - Data Visualization
- **Lucide React** - Icons

### Backend
- **Next.js API Routes** - Backend API
- **Prisma ORM** - Database Management
- **SQLite** - Database (Development)
- **bcryptjs** - Password Hashing

### Tools
- **ESLint** - Code Linting
- **Prettier** - Code Formatting
- **Git** - Version Control

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ dan npm
- Git

### Installation

```bash
# Clone repository
git clone https://github.com/AdityaNajib/Apsi2026New.git
cd Apsi2026New

# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Seed database dengan data sample
npm run db:seed

# Jalankan development server
npm run dev
```

Aplikasi akan berjalan di: **http://localhost:3000**

---

## 🔑 Akun Default

### Kaprodi
```
Email: wakhidjauhari@staff.uns.ac.id
Password: password123
Nama: Dr. Wakhid Ahmad Jauhari, S.T., M.T.
```

### Dosen
```
Email: dosen@staff.uns.ac.id
Password: password123
Nama: Ir. Joko Widodo, M.T.
```

### Mahasiswa
```
Email: aditya@student.uns.ac.id
Password: password123
NIM: I0323001
Nama: Aditya Pratama
```

### Admin
```
Email: admin@staff.uns.ac.id
Password: password123
Nama: Budi Santoso, S.Kom.
```

---

## 📊 Hierarki Kurikulum

Sistem mengimplementasi hierarki lengkap sesuai standar OBE (Outcome-Based Education):

```
CPL (Capaian Pembelajaran Lulusan)
 └─ PI/IK (Performance Indicator / Indikator Kinerja)
     └─ CPMK (Capaian Pembelajaran Mata Kuliah)
         └─ Mata Kuliah
             └─ Kelas
                 └─ Komponen Nilai (UTS, UAS, Tugas)
                     └─ Nilai Mahasiswa
```

### Data yang Tersedia
- **12 CPL** sesuai standar IABEE
- **8 PI/IK** (Performance Indicators)
- **9 CPMK** tersebar di 4 mata kuliah
- **4 Mata Kuliah** dengan 4 kelas aktif
- **10 Mahasiswa** sample data
- **Nilai lengkap** untuk 1 kelas

---

## 📁 Struktur Proyek

```
apsi2026/
├── app/
│   ├── (auth)/
│   │   └── login/              # Halaman login
│   ├── (dashboard)/
│   │   ├── kaprodi/            # Dashboard Kaprodi
│   │   ├── admin/              # Dashboard Admin
│   │   ├── dosen/              # Dashboard Dosen
│   │   └── mahasiswa/          # Dashboard Mahasiswa
│   ├── api/
│   │   ├── auth/               # API Authentication
│   │   ├── dosen/              # API Dosen
│   │   └── kaprodi/            # API Kaprodi
│   └── layout.tsx              # Root layout
├── components/
│   ├── charts/                 # Chart components
│   ├── layout/                 # Layout components (Sidebar, Navbar)
│   └── ui/                     # UI components (Card, Table)
├── lib/
│   ├── auth.ts                 # Auth utilities
│   └── prisma.ts               # Prisma client
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Seed script
│   └── dev.db                  # SQLite database
└── public/                     # Static assets
```

---

## 🗄️ Database Schema

### Models Utama

- **User** - Akun pengguna (Kaprodi, Admin, Dosen, Mahasiswa)
- **Mahasiswa** - Data mahasiswa
- **Dosen** - Data dosen
- **MataKuliah** - Data mata kuliah
- **Kelas** - Kelas per semester
- **CPL** - Capaian Pembelajaran Lulusan
- **PI** - Performance Indicator (Indikator Kinerja)
- **CPMK** - Capaian Pembelajaran Mata Kuliah
- **KomponenNilai** - Komponen penilaian (UTS, UAS, Tugas)
- **NilaiMahasiswa** - Nilai mahasiswa per komponen
- **BobotCPMK** - Bobot CPMK per komponen nilai

---

## 🎨 Screenshots

### Dashboard Mahasiswa
![Dashboard Mahasiswa](docs/screenshots/mahasiswa-dashboard.png)
- Visualisasi CPL dengan Radar Chart
- Tabel rincian nilai CPL
- Profil akademik lengkap

### Dashboard Dosen
![Dashboard Dosen](docs/screenshots/dosen-dashboard.png)
- List mata kuliah yang diampu
- Input nilai per komponen
- Rekap nilai dengan statistik

### Dashboard Kaprodi
![Dashboard Kaprodi](docs/screenshots/kaprodi-dashboard.png)
- Manajemen admin prodi
- Kelola kurikulum (CPL, PI, CPMK)
- Laporan capaian pembelajaran

---

## 📚 Dokumentasi

Dokumentasi lengkap tersedia di folder root:

- **[MULAI_DISINI.md](./MULAI_DISINI.md)** - Panduan quick start
- **[PANDUAN_LENGKAP.md](./PANDUAN_LENGKAP.md)** - Dokumentasi lengkap
- **[KREDENSIAL_AKUN.md](./KREDENSIAL_AKUN.md)** - Daftar akun & password
- **[SYSTEM_STATUS.md](./SYSTEM_STATUS.md)** - Status implementasi
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - API reference

---

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Manual Testing
1. Login dengan akun default
2. Test setiap fitur per role
3. Verifikasi CRUD operations
4. Check responsive design
5. Test export functionality

---

## 🚢 Deployment

### Build Production
```bash
npm run build
npm start
```

### Environment Variables
Buat file `.env` di root:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="production"
```

### Deploy to Vercel
```bash
vercel --prod
```

---

## 🤝 Contributing

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 Changelog

### Version 1.0.0 (Juni 2026)
- ✅ Dashboard 4 role (Kaprodi, Admin, Dosen, Mahasiswa)
- ✅ Manajemen kurikulum lengkap (CPL, PI/IK, CPMK)
- ✅ Input & rekap nilai mahasiswa
- ✅ Visualisasi CPL dengan Radar Chart
- ✅ Export data CSV/Excel
- ✅ Autentikasi & otorisasi lengkap
- ✅ Responsive design
- ✅ Real-time calculation nilai akhir

---

## 👥 Tim Pengembang

**Program Studi Teknik Industri UNS**

- **Kaprodi:** Dr. Wakhid Ahmad Jauhari, S.T., M.T.
- **Developer:** Aditya Najib
- **Academic Advisor:** TI UNS Faculty

---

## 📞 Kontak & Support

- **Email:** wakhidjauhari@staff.uns.ac.id
- **Website:** [ti.uns.ac.id](https://ti.uns.ac.id)
- **GitHub Issues:** [Report Bug](https://github.com/AdityaNajib/Apsi2026New/issues)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Next.js Team untuk framework yang amazing
- Prisma Team untuk ORM yang powerful
- Tailwind CSS untuk utility-first CSS
- UNS Teknik Industri untuk support & requirements
- Semua kontributor yang telah membantu project ini

---

## 🌟 Star History

Jika project ini bermanfaat, jangan lupa kasih ⭐️!

[![Star History Chart](https://api.star-history.com/svg?repos=AdityaNajib/Apsi2026New&type=Date)](https://star-history.com/#AdityaNajib/Apsi2026New&Date)

---

**Made with ❤️ for Teknik Industri UNS**

