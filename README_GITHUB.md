# 🎓 SICAL-TI UNS

**Sistem Informasi Perhitungan Capaian Pembelajaran Lulusan Teknik Industri UNS**

Platform terintegrasi untuk monitoring dan evaluasi Capaian Pembelajaran Lulusan (CPL) berbasis Outcome-Based Education (OBE) sesuai standar IABEE.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Role Pengguna](#-role-pengguna)
- [Dokumentasi](#-dokumentasi)
- [Screenshots](#-screenshots)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## ✨ Fitur Utama

### 🎯 Untuk Dosen
- ✅ **Mata Kuliah Ampu** - Lihat daftar mata kuliah yang diampu
- ✅ **Input Nilai** - CRUD komponen nilai & input nilai mahasiswa
- ✅ **Rekap Mahasiswa** - Statistik kelas & export CSV
- ✅ **Perhitungan Otomatis** - Nilai akhir & konversi huruf otomatis

### 📊 Untuk Kaprodi
- ✅ **Manajemen Admin** - Kelola admin prodi
- ✅ **Data Kurikulum** - Kelola CPL, PI, CPMK
- ✅ **Laporan CPL** - Monitoring capaian pembelajaran
- ✅ **Dashboard Analitik** - Visualisasi data dengan radar chart

### 👨‍🎓 Untuk Mahasiswa
- ✅ **Profil** - Lihat data pribadi & akademik
- ✅ **Hasil CPL** - Monitoring capaian pembelajaran
- ✅ **Riwayat Nilai** - Lihat nilai per mata kuliah
- ✅ **Download Laporan** - Export laporan CPL (PDF/CSV)

### 🔐 Keamanan
- ✅ **Role-Based Access Control** - 4 role (Kaprodi, Admin, Dosen, Mahasiswa)
- ✅ **Cookie-based Authentication** - Session management
- ✅ **Input Validation** - Validasi bobot 100%, nilai 0-100

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 16.2.6 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** Custom components (Card, Table, etc.)
- **Charts:** Chart.js + react-chartjs-2
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **API:** Next.js API Routes
- **Database:** SQLite (via Prisma ORM)
- **Authentication:** JWT + bcryptjs

### Development
- **Package Manager:** npm
- **Linting:** ESLint
- **Type Checking:** TypeScript

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm atau yarn

### Installation

```bash
# 1. Clone repository
git clone https://github.com/AdityaNajib/Apsi2026.git
cd Apsi2026

# 2. Install dependencies
npm install

# 3. Setup database
npx prisma migrate dev --name init
npm run db:seed

# 4. Run development server
npm run dev
```

### Access Application
```
http://localhost:3000
```

### Login Credentials

| Role      | Email                      | Password    |
|-----------|----------------------------|-------------|
| Dosen     | dosen@staff.uns.ac.id      | password123 |
| Mahasiswa | aditya@student.uns.ac.id   | password123 |
| Kaprodi   | kaprodi@staff.uns.ac.id    | password123 |
| Admin     | admin@staff.uns.ac.id      | password123 |

---

## 👥 Role Pengguna

### 1. Kaprodi (Ketua Program Studi)
- Manajemen admin prodi
- Approval kurikulum
- Monitoring CPL seluruh mahasiswa
- Generate laporan akreditasi

### 2. Admin Prodi
- Input data kurikulum (CPL, PI, CPMK)
- Import/export data
- Registrasi staff
- Generate laporan

### 3. Dosen
- Lihat mata kuliah yang diampu
- Kelola komponen nilai (UTS, UAS, Tugas, dll)
- Input nilai mahasiswa
- Lihat rekap & statistik kelas
- Export data nilai

### 4. Mahasiswa
- Lihat profil akademik
- Monitoring hasil CPL
- Lihat riwayat nilai
- Download laporan CPL

---

## 📚 Dokumentasi

### Dokumentasi Lengkap
- **START_HERE.md** - Quick start 30 detik
- **QUICK_START.md** - Panduan lengkap dengan screenshot
- **API_DOCUMENTATION.md** - API endpoints
- **SETUP_DATABASE.md** - Database setup & troubleshooting
- **DATA_MATA_KULIAH.md** - Detail data mata kuliah
- **DASHBOARD_DOSEN_UPDATE.md** - Update dashboard dosen
- **LANDING_PAGE_UPDATE.md** - Update landing page

### Database Schema
```
User → Dosen → Pengampu → Kelas → MataKuliah
                            ↓
                       KomponenNilai
                            ↓
                      NilaiMahasiswa
                            ↓
User → Mahasiswa → KRS → Kelas
```

### API Endpoints
```
GET  /api/dosen/mata-kuliah          # Get mata kuliah diampu
GET  /api/dosen/mahasiswa/[kelasId]  # Get mahasiswa by kelas
GET  /api/dosen/nilai                # Get nilai mahasiswa
POST /api/dosen/nilai                # Create/update nilai
GET  /api/dosen/komponen-nilai       # Get komponen nilai
POST /api/dosen/komponen-nilai       # Create komponen
GET  /api/dosen/rekap/[kelasId]      # Get rekap nilai
```

---

## 📸 Screenshots

### Landing Page
![Landing Page](docs/screenshots/landing.png)

### Dashboard Dosen
![Dashboard Dosen](docs/screenshots/dashboard-dosen.png)

### Input Nilai
![Input Nilai](docs/screenshots/input-nilai.png)

### Rekap Mahasiswa
![Rekap Mahasiswa](docs/screenshots/rekap.png)

---

## 📊 Database

### SQLite Database
- **File:** `prisma/dev.db`
- **Size:** ~150 KB
- **Records:** 150+ records

### Seed Data
```bash
npm run db:seed
```

**Data yang dibuat:**
- 13 users (1 Kaprodi, 1 Admin, 2 Dosen, 10 Mahasiswa)
- 4 mata kuliah
- 4 kelas
- 26 KRS records
- 3 komponen nilai (UTS, UAS, Tugas)
- 24 nilai mahasiswa

### View Database
```bash
npx prisma studio
# Open http://localhost:5555
```

---

## 🧪 Testing

### Run Tests
```bash
# Test API endpoints
node test-api.js

# Test database connection
node test-db-connection.js
```

### Manual Testing
1. Login sebagai dosen
2. Lihat mata kuliah ampu (4 mata kuliah)
3. Klik "Kelola Nilai" pada Sistem Basis Data
4. Lihat 8 mahasiswa dengan nilai lengkap
5. Edit nilai → Simpan
6. Lihat rekap mahasiswa
7. Export CSV

---

## 🔧 Development

### Project Structure
```
apsi2026/
├── app/
│   ├── (auth)/login/          # Login page
│   ├── (dashboard)/           # Dashboard layouts
│   │   ├── dosen/            # Dosen pages
│   │   ├── mahasiswa/        # Mahasiswa pages
│   │   ├── kaprodi/          # Kaprodi pages
│   │   └── admin/            # Admin pages
│   └── api/dosen/            # API routes
├── components/
│   ├── ui/                   # UI components
│   ├── layout/               # Layout components
│   └── charts/               # Chart components
├── lib/
│   ├── prisma.ts            # Prisma client
│   └── auth.ts              # Auth helper
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seeder
└── public/                  # Static files
```

### Available Scripts
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:seed      # Seed database
```

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Coding Standards
- Use TypeScript
- Follow ESLint rules
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation

---

## 📝 Lisensi

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Aditya Najib**
- GitHub: [@AdityaNajib](https://github.com/AdityaNajib)
- Email: aditya@student.uns.ac.id

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [Lucide Icons](https://lucide.dev/)

---

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Buka [Issues](https://github.com/AdityaNajib/Apsi2026/issues)
2. Baca dokumentasi di folder root
3. Hubungi maintainer

---

**Made with ❤️ for Teknik Industri UNS**

© 2026 SICAL-TI. All rights reserved.
