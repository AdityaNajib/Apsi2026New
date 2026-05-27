# 🚀 Quick Start - Dashboard Dosen SICAL-TI

## ⚡ Setup Cepat (5 Menit)

### 1️⃣ Install Dependencies
```bash
npm install
npm install -D tsx
```

### 2️⃣ Setup Database
```bash
# Pastikan MySQL sudah running di localhost:3306
# Buat database
node create-db.js

# Generate Prisma Client
npx prisma generate

# Run migration
npx prisma migrate dev --name init

# Seed data dummy
npm run db:seed
```

### 3️⃣ Run Development Server
```bash
npm run dev
```

### 4️⃣ Login & Test
1. Buka browser: `http://localhost:3000`
2. Klik "Masuk" atau langsung ke `/login`
3. Login sebagai **Dosen**:
   - Email: `dosen@staff.uns.ac.id`
   - Password: `password123`
4. Explore menu sidebar:
   - **Mata Kuliah Ampu** - Lihat daftar MK
   - **Input Nilai** - Kelola komponen & input nilai
   - **Rekap Mahasiswa** - Lihat statistik & export

---

## 📋 Fitur Dashboard Dosen

### ✅ Mata Kuliah Ampu
- Lihat semua mata kuliah yang diampu
- Statistik: Total MK, Mahasiswa, SKS
- Status komponen nilai
- Link ke input nilai

### ✅ Input Nilai
- **Kelola Komponen Nilai:**
  - Tambah/Edit/Hapus komponen (UTS, UAS, Tugas, dll)
  - Validasi bobot total = 100%
- **Input Nilai Mahasiswa:**
  - Input nilai per mahasiswa per komponen
  - Simpan individual atau batch
  - Auto-save ke database

### ✅ Rekap Mahasiswa
- Pilih mata kuliah
- Statistik: Rata-rata, Tertinggi, Terendah, Lulus
- Tabel rekap dengan nilai huruf
- Export ke CSV

---

## 🎯 Flow Penggunaan

```
1. Login Dosen
   ↓
2. Sidebar → Mata Kuliah Ampu
   ↓
3. Klik "Kelola Nilai" pada salah satu MK
   ↓
4. Tambah Komponen Nilai:
   - UTS (30%)
   - UAS (40%)
   - Tugas (30%)
   ↓
5. Input nilai mahasiswa
   ↓
6. Simpan Semua Nilai
   ↓
7. Sidebar → Rekap Mahasiswa
   ↓
8. Lihat statistik & Export CSV
```

---

## 🗄️ Data Dummy yang Dibuat

Setelah `npm run db:seed`, database akan berisi:

### Users
- 1 Kaprodi
- 1 Admin
- **2 Dosen** (Ir. Joko Widodo, Dr. Siti Nurhaliza)
- 10 Mahasiswa

### Mata Kuliah (4)
1. **TI2023** - Sistem Basis Data (3 SKS)
2. **TI1014** - Algoritma Pemrograman (4 SKS)
3. **TI3055** - Kecerdasan Buatan (3 SKS)
4. **TI4012** - Manajemen Proyek (2 SKS)

### Kelas
- 4 kelas dengan mahasiswa terdaftar
- **Kelas TI2023-A** sudah ada komponen nilai & sample nilai

### Nilai
- 8 mahasiswa di kelas Sistem Basis Data sudah punya nilai UTS, UAS, Tugas

---

## 🔐 Login Credentials

| Role      | Email                      | Password    |
|-----------|----------------------------|-------------|
| Dosen     | dosen@staff.uns.ac.id      | password123 |
| Dosen 2   | siti@staff.uns.ac.id       | password123 |
| Mahasiswa | aditya@student.uns.ac.id   | password123 |
| Kaprodi   | kaprodi@staff.uns.ac.id    | password123 |
| Admin     | admin@staff.uns.ac.id      | password123 |

---

## 🎨 Screenshot Flow

### 1. Mata Kuliah Ampu
```
┌─────────────────────────────────────────┐
│ Dashboard Dosen                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │  4  │ │ 156 │ │  2  │ │  2  │       │
│ │ MK  │ │ Mhs │ │Wait │ │Done │       │
│ └─────┘ └─────┘ └─────┘ └─────┘       │
│                                         │
│ Mata Kuliah Diampu — Semester Ganjil   │
│ ┌───────────────────────────────────┐  │
│ │ TI2023 | Sistem Basis Data | 3 SKS│  │
│ │ 40 mhs | Siap Input Nilai         │  │
│ │ [Kelola Nilai] ←──────────────────┤  │
│ └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 2. Input Nilai
```
┌─────────────────────────────────────────┐
│ Input Nilai Mahasiswa                   │
│                                         │
│ Komponen Penilaian                      │
│ ┌─────┐ ┌─────┐ ┌─────┐               │
│ │ UTS │ │ UAS │ │Tugas│               │
│ │ 30% │ │ 40% │ │ 30% │               │
│ └─────┘ └─────┘ └─────┘               │
│ Total: 100% ✓                          │
│                                         │
│ Daftar Nilai Mahasiswa                  │
│ ┌─────────────────────────────────┐    │
│ │ NIM    │ Nama  │ UTS│UAS│Tugas │    │
│ │ I0323001│Aditya│ 75│ 80│ 85  │    │
│ │ I0323002│Budi  │ 80│ 85│ 90  │    │
│ └─────────────────────────────────┘    │
│ [Simpan Semua Nilai]                   │
└─────────────────────────────────────────┘
```

### 3. Rekap Mahasiswa
```
┌─────────────────────────────────────────┐
│ Rekap Nilai Mahasiswa                   │
│                                         │
│ Pilih MK: [TI2023 - Sistem Basis Data] │
│                                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │80.5 │ │ 92  │ │ 70  │ │ 8/8 │       │
│ │Avg  │ │Max  │ │Min  │ │Lulus│       │
│ └─────┘ └─────┘ └─────┘ └─────┘       │
│                                         │
│ Rincian Nilai                           │
│ ┌─────────────────────────────────┐    │
│ │NIM│Nama│UTS│UAS│Tugas│Akhir│Huruf│  │
│ │001│Adit│75 │80 │85   │80.5 │ A- │  │
│ │002│Budi│80 │85 │90   │85.5 │ A  │  │
│ └─────────────────────────────────┘    │
│ [Export CSV]                           │
└─────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### ❌ Error: "Prisma Client not found"
```bash
npx prisma generate
```

### ❌ Error: "Database connection failed"
1. Pastikan MySQL running
2. Cek `.env`: `DATABASE_URL="mysql://root:@localhost:3306/sical_ti"`
3. Test connection: `npx prisma db push`

### ❌ Error: "Cannot find module 'tsx'"
```bash
npm install -D tsx
```

### ❌ Data tidak muncul di dashboard
```bash
# Re-seed database
npm run db:seed
```

### ❌ Error saat seed: "Foreign key constraint"
```bash
# Reset database
npx prisma migrate reset
npm run db:seed
```

### ❌ Port 3000 sudah digunakan
```bash
# Gunakan port lain
npm run dev -- -p 3001
```

---

## 📊 Database Schema (Simplified)

```
User (id, name, email, password, role)
  ↓
Dosen (id, nidn, nip, userId)
  ↓
Pengampu (id, dosenId, kelasId)
  ↓
Kelas (id, nama, tahun_ajaran, semester, mkId)
  ↓
MataKuliah (id, kode, nama, sks, semester)

Kelas → KomponenNilai (id, nama, bobot, kelasId)
Kelas → KRS (id, mahasiswaId, kelasId)
  ↓
Mahasiswa (id, nim, angkatan, userId)
  ↓
NilaiMahasiswa (id, mahasiswaId, komponenId, nilai)
```

---

## 🎯 Testing Checklist

- [ ] ✅ Login sebagai dosen berhasil
- [ ] ✅ Dashboard menampilkan 4 stat cards
- [ ] ✅ Tabel mata kuliah muncul dengan data
- [ ] ✅ Klik "Kelola Nilai" redirect ke halaman input nilai
- [ ] ✅ Bisa tambah komponen nilai (UTS, UAS, Tugas)
- [ ] ✅ Total bobot validasi 100%
- [ ] ✅ Input nilai mahasiswa berfungsi
- [ ] ✅ Simpan nilai berhasil
- [ ] ✅ Rekap mahasiswa menampilkan statistik
- [ ] ✅ Tabel rekap menampilkan nilai akhir & huruf
- [ ] ✅ Export CSV berhasil download

---

## 🚀 Next Features (Opsional)

1. **Bulk Import Nilai**
   - Upload Excel untuk import nilai batch
   - Template Excel download

2. **Export PDF**
   - Generate PDF dengan template resmi
   - Include logo & tanda tangan

3. **Grafik Distribusi**
   - Bar chart distribusi nilai huruf
   - Line chart trend nilai per komponen

4. **Notifikasi**
   - Alert jika ada mahasiswa nilai < 55
   - Reminder deadline input nilai

5. **Integrasi CPL**
   - Auto-calculate CPL dari nilai CPMK
   - Dashboard CPL per mahasiswa

---

## 📞 Support

Jika masih ada error:
1. Cek console browser (F12)
2. Cek terminal server
3. Buka Prisma Studio: `npx prisma studio`
4. Lihat log database

---

## 🎉 Selamat!

Dashboard Dosen sudah siap digunakan dengan fitur CRUD lengkap:
- ✅ Create: Tambah komponen nilai
- ✅ Read: Lihat mata kuliah, mahasiswa, rekap
- ✅ Update: Edit komponen & nilai
- ✅ Delete: Hapus komponen nilai

**Happy Teaching! 📚**
