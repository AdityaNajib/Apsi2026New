# Setup Dashboard Dosen - SICAL-TI UNS

## 🎯 Fitur yang Sudah Dibuat

### 1. **Mata Kuliah Ampu** (`/dosen/matakuliah`)
- Lihat daftar mata kuliah yang diampu
- Statistik: Total MK, Total Mahasiswa, Semester Aktif, Total SKS
- Status komponen nilai per mata kuliah
- Link ke halaman input nilai

### 2. **Input Nilai** (`/dosen/nilai`)
- **CRUD Komponen Nilai:**
  - Tambah komponen (UTS, UAS, Tugas, dll)
  - Edit komponen
  - Hapus komponen
  - Validasi total bobot harus 100%
- **Input Nilai Mahasiswa:**
  - Tabel input nilai per mahasiswa per komponen
  - Simpan per mahasiswa atau simpan semua sekaligus
  - Nilai range 0-100

### 3. **Rekap Mahasiswa** (`/dosen/rekap`)
- Pilih mata kuliah dari dropdown
- **Statistik Kelas:**
  - Rata-rata kelas
  - Nilai tertinggi
  - Nilai terendah
  - Jumlah mahasiswa lulus
- **Tabel Rekap:**
  - Nilai per komponen
  - Nilai akhir (weighted average)
  - Konversi nilai huruf (A, B+, B, C+, C, D, E)
- **Export CSV** untuk laporan

---

## 🚀 Cara Setup Database

### 1. Install Dependencies
```bash
npm install
npm install -D tsx
```

### 2. Setup Database MySQL
Pastikan MySQL sudah running di `localhost:3306`

```bash
# Create database
node create-db.js
```

### 3. Run Prisma Migration
```bash
npx prisma migrate dev --name init
```

### 4. Seed Database dengan Data Dummy
```bash
npm run db:seed
```

**Data yang akan dibuat:**
- 1 Kaprodi
- 1 Admin
- 2 Dosen
- 10 Mahasiswa
- 4 Mata Kuliah
- 4 Kelas
- Komponen Nilai (UTS, UAS, Tugas) untuk 1 kelas
- Sample nilai untuk 8 mahasiswa
- CPL, PI, CPMK

---

## 🔑 Login Credentials

### Dosen
- **Email:** `dosen@staff.uns.ac.id`
- **Password:** `password123`

### Mahasiswa (untuk testing)
- **Email:** `aditya@student.uns.ac.id`
- **Password:** `password123`

---

## 📂 Struktur File yang Dibuat

```
d:\apsi2026\
├── lib/
│   ├── prisma.ts                          # Prisma client singleton
│   └── auth.ts                            # Auth helper
├── app/
│   ├── api/
│   │   └── dosen/
│   │       ├── mata-kuliah/
│   │       │   └── route.ts               # GET mata kuliah diampu
│   │       ├── mahasiswa/
│   │       │   └── [kelasId]/
│   │       │       └── route.ts           # GET mahasiswa by kelas
│   │       ├── nilai/
│   │       │   └── route.ts               # GET, POST, DELETE nilai
│   │       ├── komponen-nilai/
│   │       │   └── route.ts               # CRUD komponen nilai
│   │       └── rekap/
│   │           └── [kelasId]/
│   │               └── route.ts           # GET rekap nilai
│   └── (dashboard)/
│       └── dosen/
│           ├── matakuliah/
│           │   └── page.tsx               # Halaman Mata Kuliah Ampu
│           ├── nilai/
│           │   └── page.tsx               # Halaman Input Nilai
│           └── rekap/
│               └── page.tsx               # Halaman Rekap Mahasiswa
└── prisma/
    └── seed.ts                            # Database seeder
```

---

## 🎨 Fitur UI/UX

### Mata Kuliah Ampu
- ✅ Card statistik dengan icon
- ✅ Tabel responsive dengan status komponen
- ✅ Button "Kelola Nilai" dengan hover effect

### Input Nilai
- ✅ Modal untuk CRUD komponen nilai
- ✅ Validasi bobot total 100%
- ✅ Input field untuk setiap mahasiswa per komponen
- ✅ Sticky header dan kolom NIM/Nama
- ✅ Button simpan per row atau simpan semua

### Rekap Mahasiswa
- ✅ Dropdown selector mata kuliah
- ✅ Card statistik kelas
- ✅ Tabel rekap dengan nilai huruf berwarna
- ✅ Export ke CSV

---

## 🔄 Flow Penggunaan

### 1. Dosen Login
```
Login → Dashboard Dosen → Sidebar Menu
```

### 2. Kelola Komponen Nilai
```
Mata Kuliah Ampu → Kelola Nilai → Tambah Komponen (UTS 30%, UAS 40%, Tugas 30%)
```

### 3. Input Nilai Mahasiswa
```
Input nilai per mahasiswa → Simpan
```

### 4. Lihat Rekap
```
Rekap Mahasiswa → Pilih MK → Lihat statistik & tabel → Export CSV
```

---

## 📊 Konversi Nilai Huruf

| Nilai Angka | Nilai Huruf |
|-------------|-------------|
| 85 - 100    | A           |
| 80 - 84     | A-          |
| 75 - 79     | B+          |
| 70 - 74     | B           |
| 65 - 69     | B-          |
| 60 - 64     | C+          |
| 55 - 59     | C           |
| 50 - 54     | C-          |
| 45 - 49     | D           |
| 0 - 44      | E           |

---

## 🐛 Troubleshooting

### Error: "Prisma Client not found"
```bash
npx prisma generate
```

### Error: "Database connection failed"
- Pastikan MySQL running
- Cek `.env` file: `DATABASE_URL="mysql://root:@localhost:3306/sical_ti"`

### Error: "Cannot find module 'tsx'"
```bash
npm install -D tsx
```

### Data tidak muncul
```bash
# Re-seed database
npm run db:seed
```

---

## 🎯 Next Steps (Opsional)

1. **Tambah validasi:**
   - Cek apakah dosen berhak akses kelas tertentu
   - Validasi range nilai 0-100

2. **Tambah fitur:**
   - Bulk import nilai dari Excel
   - Export PDF dengan template
   - Grafik distribusi nilai

3. **Integrasi CPL:**
   - Mapping CPMK ke komponen nilai
   - Auto-calculate CPL dari nilai mahasiswa

---

## ✅ Testing Checklist

- [ ] Login sebagai dosen
- [ ] Lihat daftar mata kuliah di "Mata Kuliah Ampu"
- [ ] Klik "Kelola Nilai" pada salah satu mata kuliah
- [ ] Tambah komponen nilai (UTS, UAS, Tugas)
- [ ] Pastikan total bobot = 100%
- [ ] Input nilai untuk beberapa mahasiswa
- [ ] Klik "Simpan Semua Nilai"
- [ ] Buka "Rekap Mahasiswa"
- [ ] Pilih mata kuliah dari dropdown
- [ ] Lihat statistik dan tabel rekap
- [ ] Klik "Export CSV"

---

## 📞 Support

Jika ada error atau pertanyaan, cek:
1. Console browser (F12) untuk error frontend
2. Terminal server untuk error backend
3. Prisma Studio: `npx prisma studio` untuk cek data database

---

**Happy Coding! 🚀**
