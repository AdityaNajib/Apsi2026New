# 📊 Dashboard Kaprodi - Update Documentation

## ✅ Yang Sudah Dibuat

### 1. **Manajemen Admin** (`/kaprodi/manajemen-admin`)

Halaman untuk mengelola admin program studi dengan fitur CRUD lengkap.

**Fitur:**
- ✅ Lihat daftar admin dengan detail lengkap (nama, email, NIDN, NIP)
- ✅ Tambah admin baru dengan form modal
- ✅ Edit data admin existing
- ✅ Hapus admin
- ✅ Statistik total admin
- ✅ Tampilan card dengan avatar dan informasi lengkap

**API Endpoints:**
- `GET /api/kaprodi/admin` - Fetch all admins
- `POST /api/kaprodi/admin` - Create new admin
- `PUT /api/kaprodi/admin/[id]` - Update admin
- `DELETE /api/kaprodi/admin/[id]` - Delete admin

**Data di Database:**
- 2 Admin sudah tersedia:
  1. Budi Santoso, S.Kom. (admin@staff.uns.ac.id)
  2. Siti Aminah, S.T., M.Kom. (siti.admin@staff.uns.ac.id)

---

### 2. **Data Kurikulum** (`/kaprodi/data-kurikulum`)

Halaman untuk mengelola CPL, PI, dan CPMK dengan tab navigation.

**Fitur:**
- ✅ Tab navigation untuk CPL, PI, dan CPMK
- ✅ Statistik total untuk masing-masing kategori
- ✅ Tabel data dengan informasi lengkap
- ✅ Relasi antar data (CPL → PI → CPMK)
- ✅ Button edit dan delete untuk setiap item
- ✅ Filter dan search (UI ready, logic belum)

**API Endpoints:**
- `GET /api/kaprodi/kurikulum?type=cpl` - Fetch all CPL
- `GET /api/kaprodi/kurikulum?type=pi` - Fetch all PI
- `GET /api/kaprodi/kurikulum?type=cpmk` - Fetch all CPMK

**Data di Database:**
- **12 CPL** (sesuai standar IABEE):
  - CPL-01: Kemampuan menerapkan pengetahuan matematika, sains, dan prinsip rekayasa
  - CPL-02: Kemampuan merancang dan melakukan eksperimen
  - CPL-03: Kemampuan merancang sistem, komponen, atau proses
  - CPL-04: Kemampuan bekerja dalam tim multidisiplin
  - CPL-05: Kemampuan mengidentifikasi dan menyelesaikan masalah
  - CPL-06: Pemahaman tanggung jawab profesional dan etika
  - CPL-07: Kemampuan berkomunikasi secara efektif
  - CPL-08: Pemahaman dampak solusi rekayasa
  - CPL-09: Kemampuan belajar sepanjang hayat
  - CPL-10: Pengetahuan tentang isu kontemporer
  - CPL-11: Kemampuan menggunakan teknik dan peralatan modern
  - CPL-12: Kemampuan menerapkan prinsip manajemen proyek

- **8 PI** (Performance Indicators):
  - PI-01-01: Mampu mengidentifikasi, merumuskan, dan menganalisis masalah
  - PI-01-02: Mampu menerapkan metode matematika
  - PI-02-01: Mampu merancang eksperimen
  - PI-02-02: Mampu menganalisis dan menginterpretasi data
  - PI-03-01: Mampu merancang sistem informasi
  - PI-04-01: Mampu berkolaborasi dalam tim
  - PI-05-01: Mampu menyelesaikan masalah kompleks
  - PI-06-01: Memahami kode etik profesi

- **9 CPMK** (tersebar di 4 mata kuliah):
  - 3 CPMK untuk Sistem Basis Data (TI2023)
  - 2 CPMK untuk Algoritma Pemrograman (TI1014)
  - 2 CPMK untuk Kecerdasan Buatan (TI3055)
  - 2 CPMK untuk Manajemen Proyek (TI4012)

---

### 3. **Laporan CPL** (`/kaprodi/laporan-cpl`)

Halaman untuk monitoring capaian pembelajaran lulusan dengan visualisasi.

**Fitur:**
- ✅ Filter berdasarkan angkatan (2021-2024, All)
- ✅ Statistik summary (Total CPL, Tercapai, Belum Tercapai, Rata-rata Mahasiswa)
- ✅ Radar chart untuk visualisasi CPL
- ✅ Tabel detail capaian per CPL
- ✅ Status indicator (Tercapai/Perlu Perbaikan)
- ✅ Export to CSV button (UI ready)
- ✅ Export to PDF button (UI ready)

**API Endpoints:**
- `GET /api/kaprodi/laporan-cpl?angkatan=all` - Fetch laporan CPL
- `GET /api/kaprodi/laporan-cpl?angkatan=2023` - Filter by angkatan

**Perhitungan CPL:**
- Mengambil data dari: CPL → PI → CPMK → BobotCPMK → KomponenNilai → NilaiMahasiswa
- Menghitung rata-rata nilai per CPL
- Menghitung persentase tercapai (threshold: 70%)
- Mengelompokkan mahasiswa berdasarkan angkatan

---

## 📁 File Structure

```
app/
├── (dashboard)/
│   └── kaprodi/
│       ├── page.tsx                    # Dashboard overview (existing)
│       ├── manajemen-admin/
│       │   └── page.tsx               # ✅ NEW: Admin management
│       ├── data-kurikulum/
│       │   └── page.tsx               # ✅ NEW: Curriculum data
│       └── laporan-cpl/
│           └── page.tsx               # ✅ NEW: CPL report
└── api/
    └── kaprodi/
        ├── admin/
        │   ├── route.ts               # ✅ NEW: GET, POST admins
        │   └── [id]/
        │       └── route.ts           # ✅ NEW: PUT, DELETE admin
        ├── kurikulum/
        │   └── route.ts               # ✅ NEW: GET CPL/PI/CPMK
        └── laporan-cpl/
            └── route.ts               # ✅ NEW: GET laporan CPL
```

---

## 🔑 Login Credentials

### Kaprodi
```
Email: kaprodi@staff.uns.ac.id
Password: password123
```

**Akses:**
- Dashboard Overview
- Manajemen Admin (CRUD)
- Data Kurikulum (View CPL, PI, CPMK)
- Laporan CPL (View & Export)

---

## 🎨 Design System

### Colors
- Primary: `#4361ee` (Blue)
- Secondary: `#7c3aed` (Purple)
- Success: `#059669` (Green)
- Warning: `#d97706` (Orange)
- Danger: `#dc2626` (Red)
- Text Primary: `#1a1d2e`
- Text Secondary: `#94a3b8`

### Components
- Card dengan shadow dan rounded corners
- Gradient buttons
- Modal dengan backdrop
- Table dengan hover effects
- Status badges dengan color coding
- Avatar dengan initial letters

---

## 📊 Database Schema (Relevant Tables)

### User
```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String
  role      String   // KAPRODI, ADMIN, DOSEN, MAHASISWA
  dosen     Dosen?
}
```

### CPL (Capaian Pembelajaran Lulusan)
```prisma
model CPL {
  id        String   @id @default(cuid())
  kode      String   @unique
  deskripsi String
  pi        PI[]
}
```

### PI (Performance Indicator)
```prisma
model PI {
  id        String   @id @default(cuid())
  kode      String   @unique
  deskripsi String
  cpl       CPL      @relation(fields: [cplId], references: [id])
  cplId     String
  cpmk      CPMK[]
}
```

### CPMK (Capaian Pembelajaran Mata Kuliah)
```prisma
model CPMK {
  id        String   @id @default(cuid())
  kode      String
  deskripsi String
  pi        PI       @relation(fields: [piId], references: [id])
  piId      String
  mataKuliah MataKuliah @relation(fields: [mkId], references: [id])
  mkId      String
  bobotCpmk BobotCPMK[]
}
```

---

## 🚀 How to Test

### 1. Start Development Server
```bash
npm run dev
```

### 2. Login as Kaprodi
```
http://localhost:3000/login
Email: kaprodi@staff.uns.ac.id
Password: password123
```

### 3. Navigate to Pages
- **Manajemen Admin:** http://localhost:3000/kaprodi/manajemen-admin
- **Data Kurikulum:** http://localhost:3000/kaprodi/data-kurikulum
- **Laporan CPL:** http://localhost:3000/kaprodi/laporan-cpl

### 4. Test API Endpoints
```bash
# Get all admins
curl http://localhost:3000/api/kaprodi/admin

# Get CPL data
curl http://localhost:3000/api/kaprodi/kurikulum?type=cpl

# Get PI data
curl http://localhost:3000/api/kaprodi/kurikulum?type=pi

# Get CPMK data
curl http://localhost:3000/api/kaprodi/kurikulum?type=cpmk

# Get laporan CPL
curl http://localhost:3000/api/kaprodi/laporan-cpl?angkatan=all
```

---

## ✅ Testing Checklist

### Manajemen Admin
- [x] Lihat daftar admin
- [x] Tambah admin baru
- [x] Edit admin existing
- [x] Hapus admin
- [x] Validasi email unique
- [x] Password hashing

### Data Kurikulum
- [x] Tab navigation (CPL, PI, CPMK)
- [x] Lihat data CPL dengan jumlah PI
- [x] Lihat data PI dengan CPL reference
- [x] Lihat data CPMK dengan MK dan PI reference
- [x] Statistik total untuk setiap kategori

### Laporan CPL
- [x] Filter by angkatan
- [x] Statistik summary
- [x] Radar chart visualization
- [x] Tabel detail capaian
- [x] Status indicator (Tercapai/Perlu Perbaikan)

---

## 🔄 Next Steps (Optional Enhancements)

### Manajemen Admin
- [ ] Pagination untuk daftar admin
- [ ] Search dan filter admin
- [ ] Bulk actions (delete multiple)
- [ ] Email notification saat admin dibuat

### Data Kurikulum
- [ ] Implementasi CRUD untuk CPL, PI, CPMK
- [ ] Import/export data kurikulum (Excel/CSV)
- [ ] Validasi relasi (CPL harus punya PI, dll)
- [ ] Drag & drop untuk reorder

### Laporan CPL
- [ ] Implementasi export CSV
- [ ] Implementasi export PDF
- [ ] Grafik trend CPL per semester
- [ ] Comparison antar angkatan
- [ ] Drill-down detail per mahasiswa

---

## 📝 Notes

1. **Data CPL saat ini masih 0** karena belum ada BobotCPMK yang menghubungkan KomponenNilai dengan CPMK. Untuk mengisi data CPL yang realistis, perlu:
   - Buat BobotCPMK untuk setiap KomponenNilai
   - Hubungkan dengan CPMK yang sesuai
   - Pastikan total bobot per CPMK = 100%

2. **Export functionality** (CSV/PDF) sudah ada button-nya tapi belum diimplementasikan. Perlu library tambahan:
   - CSV: `papaparse` atau native JavaScript
   - PDF: `jspdf` atau `pdfmake`

3. **Authentication** belum diimplementasikan di API routes. Saat ini semua endpoint bisa diakses tanpa login. Untuk production, perlu:
   - Middleware untuk check authentication
   - Role-based access control
   - Session management

4. **Validation** di form masih basic (required only). Bisa ditambahkan:
   - Email format validation
   - NIDN/NIP format validation
   - Password strength validation
   - Duplicate check sebelum submit

---

## 🎉 Summary

✅ **3 halaman baru** untuk dashboard Kaprodi sudah dibuat dan berfungsi
✅ **6 API endpoints** untuk CRUD admin dan fetch data kurikulum
✅ **Database seeded** dengan 12 CPL, 8 PI, 9 CPMK, dan 2 admin
✅ **UI/UX konsisten** dengan design system yang ada
✅ **Responsive** dan mobile-friendly

**Total files created:** 7 files
- 3 pages (manajemen-admin, data-kurikulum, laporan-cpl)
- 4 API routes (admin, admin/[id], kurikulum, laporan-cpl)

**Database updated:**
- 12 CPL records
- 8 PI records
- 9 CPMK records
- 2 Admin users with Dosen profile

---

**Happy Coding! 🚀**
