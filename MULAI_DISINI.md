# 🚀 MULAI DI SINI — SICAL-TI UNS

> Sistem Informasi Capaian Pembelajaran Lulusan — Program Studi Teknik Industri UNS

---

## ⚡ Cara Menjalankan Website

```powershell
cd "D:\Kuliah\Sem 6\Analisis dan Perancangan Sistem Informasi\Tubes\apsi2026\apsi2026"
npm run dev
```

Buka browser: **http://localhost:3000**

---

## 🔑 Akun Login (password semua: `password123`)

| Role | Email | Akses |
|------|-------|-------|
| **Kaprodi** | `wakhidjauhari@kaprodi.uns.ac.id` | Full — termasuk manajemen admin |
| **Penjaminan Mutu** | `ratna@jamu.uns.ac.id` | Sama dengan Kaprodi |
| **Admin** | `budi@admin.uns.ac.id` | Manajemen kelas, pengguna, nilai |
| **Dosen** | `joko.widodo@staff.uns.ac.id` | Input nilai mata kuliah yang diampu |
| **Mahasiswa** | `aditya@student.uns.ac.id` | Lihat CPL & riwayat nilai sendiri |

### Domain Email per Role

| Role | Domain |
|------|--------|
| Kaprodi | `@kaprodi.uns.ac.id` |
| Penjaminan Mutu | `@jamu.uns.ac.id` |
| Admin Prodi | `@admin.uns.ac.id` |
| Dosen | `@staff.uns.ac.id` |
| Mahasiswa | `@student.uns.ac.id` |

---

## 🗄️ Setup Database (pertama kali)

```powershell
# 1. Install dependencies
npm install

# 2. Reset & setup database
npx prisma migrate reset --force

# 3. Jalankan server
npm run dev
```

---

## 📋 Fitur per Role

### 🟣 Kaprodi & Penjaminan Mutu (hak akses sama)
- **Dashboard** — statistik CPL real dari database
- **Data Kurikulum** — CRUD CPL, PI, CPMK
- **Laporan CPL** — download Excel/CSV dan Print/PDF, filter per angkatan
- **Manajemen Admin** — tambah/edit/hapus akun admin (Kaprodi saja)

### 🔵 Admin Prodi
- **Manajemen Pengguna** — tambah/edit/hapus dosen & mahasiswa, import CSV massal
- **Manajemen Kelas** — buat kelas manual atau **import CSV** (sekaligus assign dosen), **import mahasiswa ke kelas via CSV**, enroll/unenroll satu per satu
- **Mata Kuliah** — tambah/edit/hapus, **import CSV** (mode skip atau update), template 24 MK TI UNS tersedia
- **Input Nilai** — bantu input nilai mahasiswa per kelas, **import CSV nilai**
- **Data Kurikulum** — CRUD CPL, PI, CPMK
- **Laporan CPL** — download laporan

### 🟡 Dosen
- **Dashboard** — statistik mata kuliah yang diampu
- **Sidebar dinamis** — menu per mata kuliah berdasarkan pengampuan
- **Komponen penilaian fleksibel** — tiap kelas bisa beda komponen (UTS/UAS/Tugas/Kuis/dll)
- **Input Nilai** — kelola komponen penilaian & input nilai, **import CSV nilai**, batch save satu klik
- **Rekap Nilai** — lihat rekap nilai akhir + huruf mutu, export CSV

### � Mahasiswa
- **Dashboard** — profil & ringkasan CPL personal
- **Hasil CPL** — progress bar, status tercapai/belum, download PDF
- **Riwayat Nilai** — nilai per semester, IPS & IPK otomatis
- **Profil** — data diri dari database

---

## 📁 Struktur Penting

```
prisma/
  seed.ts          ← Edit data dosen & mahasiswa di sini
  schema.prisma    ← Struktur database
  dev.db           ← File database SQLite

app/
  (auth)/login/    ← Halaman login (1 pintu)
  (dashboard)/
    admin/         ← Semua halaman admin
    kaprodi/       ← Semua halaman kaprodi
    jamu/          ← Semua halaman penjaminan mutu
    dosen/         ← Semua halaman dosen
    mahasiswa/     ← Semua halaman mahasiswa
  api/             ← Semua API endpoints

components/
  dashboard/       ← Shared components (KurikulumContent, LaporanCPLContent)
  layout/          ← DashboardShell, Sidebar, Navbar
  ui/              ← Card, CSVUploader, dll
```

---

## ✏️ Cara Edit Data Awal (Dosen & Mahasiswa)

Buka file `prisma/seed.ts` dan edit bagian yang diberi komentar:

```typescript
// ✏️  EDIT DATA DOSEN DI SINI
const dosenData = [
  {
    name: 'Nama Dosen',
    email: 'nama@staff.uns.ac.id',
    nidn: '0612108901',
  },
  // tambah lebih banyak...
];

// ✏️  EDIT DATA MAHASISWA DI SINI
const mahasiswaData = [
  { nim: 'I0323001', name: 'Nama Mahasiswa', email: 'nama@student.uns.ac.id', angkatan: '2023' },
  // tambah lebih banyak...
];
```

Setelah edit, jalankan: `npm run db:seed`

> ⚠️ `db:seed` menghapus semua data dan isi ulang dari awal.

---

## 🛠️ Perintah Berguna

```powershell
npm run dev          # Jalankan server development
npm run db:seed      # Reset & isi ulang data dummy
npx prisma studio    # Buka GUI database di browser (localhost:5555)
npx prisma migrate reset --force  # Reset total database
```

---

## 🐛 Troubleshooting

| Masalah | Solusi |
|---------|--------|
| `npm not recognized` | Install Node.js dari https://nodejs.org |
| `database is locked` | Tutup Prisma Studio & server dev dulu, lalu coba lagi |
| Login gagal | Pastikan email sesuai domain, password `password123` |
| Halaman 404 | Pastikan server jalan di port 3000 |
| Error "nip constraint" | Jalankan `npx prisma migrate reset --force` |
