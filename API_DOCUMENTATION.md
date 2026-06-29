# 📡 API Documentation — SICAL-TI UNS

Base URL: `http://localhost:3000/api`

> Semua endpoint sensitif belum memiliki middleware auth tersendiri — proteksi dilakukan di level layout dashboard via cookie check.

---

## Auth

### POST `/api/auth/login`
Login pengguna. Role dideteksi otomatis dari domain email.

**Body:** `{ email, password }`

**Response:** `{ success, user: { id, name, email, role }, redirectPath }`

| Domain | Role |
|--------|------|
| `@kaprodi.uns.ac.id` | KAPRODI |
| `@jamu.uns.ac.id` | JAMU |
| `@admin.uns.ac.id` | ADMIN |
| `@staff.uns.ac.id` | DOSEN |
| `@student.uns.ac.id` | MAHASISWA |

### POST `/api/auth/logout`
Hapus semua auth cookies. Response: `{ success: true }`

---

## Mahasiswa

### GET `/api/mahasiswa/profile`
Profil mahasiswa yang sedang login (by `userId` cookie).

### GET `/api/mahasiswa/cpl`
Hasil perhitungan CPL mahasiswa yang sedang login.

### GET `/api/mahasiswa/riwayat`
Riwayat nilai per semester dengan IPS dan IPK otomatis.

---

## Dosen

### GET `/api/dosen/mata-kuliah`
Daftar mata kuliah + kelas yang diampu dosen yang sedang login.

### GET `/api/dosen/mahasiswa/[kelasId]`
Daftar mahasiswa + komponen nilai dalam satu kelas.

### GET `/api/dosen/nilai-batch?kelasId=`
Semua nilai dalam satu kelas, satu request (fix N+1).  
Response: `{ [mahasiswaId]: { [komponenId]: nilai } }`

### POST `/api/dosen/nilai-batch`
Batch upsert semua nilai sekaligus.  
**Body:** `{ items: [{ mahasiswaId, komponenId, nilai }] }`

### GET `/api/dosen/nilai?mahasiswaId=&komponenId=`
Nilai satu mahasiswa untuk satu komponen.

### POST `/api/dosen/nilai`
Upsert nilai satu record. **Body:** `{ mahasiswaId, komponenId, nilai (0-100) }`

### GET `/api/dosen/komponen-nilai?kelasId=`
Daftar komponen nilai satu kelas.

### POST `/api/dosen/komponen-nilai`
Tambah komponen. **Body:** `{ kelasId, nama, bobot }`

### PUT `/api/dosen/komponen-nilai`
Update komponen. **Body:** `{ id, nama, bobot }`

### DELETE `/api/dosen/komponen-nilai?id=`
Hapus komponen (cascade: hapus semua nilai & bobot CPMK terkait).

### GET `/api/dosen/rekap/[kelasId]`
Rekap nilai akhir + huruf mutu semua mahasiswa di kelas.

---

## Admin — Kelas

### GET `/api/admin/kelas`
Semua kelas beserta dosen pengampu, jumlah mahasiswa, dan komponen nilai.

### POST `/api/admin/kelas`
Buat kelas. **Body:** `{ mkId, nama, tahunAjaran, semester }`

### DELETE `/api/admin/kelas?id=`
Hapus kelas (cascade: nilai, KRS, pengampu, komponen).

### POST `/api/admin/kelas/pengampu`
Assign dosen ke kelas. **Body:** `{ kelasId, dosenId }`

### DELETE `/api/admin/kelas/pengampu?id=`
Lepas dosen dari kelas (`id` = pengampuId).

### GET `/api/admin/kelas/mahasiswa?kelasId=`
Daftar mahasiswa dalam kelas tertentu.

---

## Admin — Import Data

### POST `/api/admin/import/dosen`
Import data dosen dari CSV.

**Form-data:** `file` (CSV file)

**Format CSV:** `name,email,nidn`

**Response:** `{ successCount, errorCount, results[] }`

### POST `/api/admin/import/mahasiswa`
Import data mahasiswa dari CSV.

**Form-data:** `file` (CSV file)

**Response:** `{ successCount, errorCount, results[] }`

### POST `/api/admin/import/mata-kuliah`
Import data mata kuliah dari CSV.

**Form-data:** `file` (CSV file)

**Query params:** `?mode=skip|update` (default: skip)

**Format CSV:** `kode,nama,sks,semester`

**Response:** `{ successCount, updatedCount, skipCount, errorCount, results[] }`

### POST `/api/admin/import/kelas`
Import data kelas beserta dosen pengampu dari CSV.

**Form-data:** `file` (CSV file)

**Format CSV:** `kode_mk,nama_kelas,tahun_ajaran,semester,nidn_dosen`

**Note:** `nidn_dosen` bisa multiple (pisahkan dengan `|`)

**Response:** `{ successCount, skipCount, errorCount, results[] }`

### POST `/api/admin/import/pengampu`
Import data pengampu (dosen mengajar mata kuliah + kelas) dari CSV.

**Form-data:** `file` (CSV file)

**Query params:** 
- `?tahun_ajaran=2026/2027` (optional, default: 2026/2027)
- `?semester=Ganjil` (optional, default: Ganjil)

**Format CSV:** `kode_mk,nama_mk,nama_dosen,kelas,tahun_ajaran,semester`

**Format nama_dosen:** `NIDN - Nama Lengkap` (contoh: "JUM001 - Jumiyanto Widodo S.Sos. M.Si.")

**Fitur:**
- Auto-create mata kuliah jika belum ada
- Auto-create kelas jika belum ada
- Extract SKS dari nama mata kuliah (format: "Nama (X SKS)")
- Extract NIDN dari nama dosen
- Skip jika dosen sudah mengampu kelas tersebut

**Response:** 
```json
{
  "successCount": 150,
  "skipCount": 20,
  "warningCount": 5,
  "errorCount": 3,
  "results": [],
  "summary": {
    "total": 178,
    "processed": 175,
    "failed": 3
  }
}
```

**Dokumentasi lengkap:** Lihat `IMPORT_PENGAMPU_GUIDE.md`

### POST `/api/admin/import/kelas-mahasiswa`
Import data mahasiswa ke kelas (KRS) dari CSV.

**Form-data:** `file` (CSV file)

**Response:** `{ successCount, errorCount, results[] }`

### POST `/api/admin/import/nilai`
Import data nilai dari CSV.

**Form-data:** `file` (CSV file)

**Response:** `{ successCount, errorCount, results[] }`
Daftar mahasiswa di kelas.

### POST `/api/admin/kelas/mahasiswa`
Enroll mahasiswa. **Body:** `{ kelasId, mahasiswaId }`

### DELETE `/api/admin/kelas/mahasiswa?krsId=`
Unenroll mahasiswa (cascade: hapus nilai di kelas tersebut).

---

## Admin — Mata Kuliah

### GET `/api/admin/mata-kuliah`
Semua mata kuliah dengan `_count.kelas` dan `_count.cpmk`.

### POST `/api/admin/mata-kuliah`
Tambah MK. **Body:** `{ kode, nama, sks, semester }`

### PUT `/api/admin/mata-kuliah`
Update MK. **Body:** `{ id, kode?, nama?, sks?, semester? }`

### DELETE `/api/admin/mata-kuliah?id=`
Hapus MK. Gagal jika masih ada kelas yang menggunakannya.

---

## Admin — Nilai

### GET `/api/admin/nilai?kelasId=`
Semua nilai mahasiswa di kelas (untuk halaman input nilai admin).

### POST `/api/admin/nilai`
Upsert nilai. **Body:** `{ mahasiswaId, komponenId, nilai (0-100) }`

---

## Admin — Pengguna

### GET `/api/admin/pengguna/dosen`
Semua dosen.

### POST `/api/admin/pengguna/dosen`
Tambah dosen. **Body:** `{ name, email, nidn }`

### PUT `/api/admin/pengguna/dosen`
Update dosen. **Body:** `{ dosenId, name?, email?, nidn? }`

### DELETE `/api/admin/pengguna/dosen?dosenId=`
Hapus dosen (cascade: pengampu).

### GET `/api/admin/pengguna/mahasiswa?angkatan=`
Semua mahasiswa, bisa filter per angkatan.

### POST `/api/admin/pengguna/mahasiswa`
Tambah mahasiswa (atomic transaction). **Body:** `{ name, email, nim, angkatan }`

### PUT `/api/admin/pengguna/mahasiswa`
Update mahasiswa. **Body:** `{ mahasiswaId, name?, email?, nim?, angkatan?, status? }`

### DELETE `/api/admin/pengguna/mahasiswa?mahasiswaId=`
Hapus mahasiswa (cascade: nilai & KRS).

---

## Admin — Options (Dropdown)

### GET `/api/admin/options?type=mk`
Semua mata kuliah.

### GET `/api/admin/options?type=dosen`
Semua dosen.

### GET `/api/admin/options?type=mahasiswa`
Semua mahasiswa.

### GET `/api/admin/options?type=mahasiswa-not-in-kelas&kelasId=`
Mahasiswa yang belum terdaftar di kelas tertentu.

---

## Admin — Import CSV

Semua endpoint import menggunakan `FormData` (bukan JSON).

### POST `/api/admin/import/dosen`
Import dosen baru.  
**Form:** `file`  
**CSV format:** `name, email, nidn`

### POST `/api/admin/import/mahasiswa`
Import mahasiswa baru (validasi domain `@student.uns.ac.id`).  
**Form:** `file`  
**CSV format:** `name, email, nim, angkatan`

### POST `/api/admin/import/nilai`
Import nilai untuk satu kelas.  
**Form:** `file`, `kelasId`  
**CSV format:** `nim, <nama_komponen1>, <nama_komponen2>, ...`  
Nama komponen harus sama persis dengan yang sudah dibuat di kelas.

### POST `/api/admin/import/kelas`
Import banyak kelas sekaligus + assign dosen pengampu.  
**Form:** `file`  
**CSV format:** `kode_mk, nama_kelas, tahun_ajaran, semester, nidn_dosen`  
- `nidn_dosen` boleh kosong; multi-dosen pisah dengan `|`
- Kelas yang sudah ada tidak dibuat ulang, tapi dosen baru tetap ditambahkan

### POST `/api/admin/import/kelas-mahasiswa`
Enroll mahasiswa ke kelas via CSV (mahasiswa harus sudah ada di sistem).  
**Form:** `file`, `kelasId`  
**CSV format:** `nim`

### POST `/api/admin/import/mata-kuliah?mode=skip|update`
Import daftar mata kuliah.  
**Form:** `file`  
**CSV format:** `kode, nama, sks, semester`  
**Query param:** `mode=skip` (default, kode lama dilewati) atau `mode=update` (kode lama diperbarui)

---

## Dosen — Import CSV

### POST `/api/dosen/import/nilai`
Import nilai untuk kelas yang diampu dosen.  
**Form:** `file`, `kelasId`  
**CSV format:** sama dengan `/api/admin/import/nilai`

---

## Kaprodi

### GET `/api/kaprodi/laporan-cpl?angkatan=`
Laporan ketercapaian CPL. Filter: `all | 2022 | 2023 | 2024 | 2025`

### GET `/api/kaprodi/laporan-cpl/export?format=csv&angkatan=`
Download laporan CPL sebagai file CSV (Excel-compatible, BOM UTF-8).

### GET `/api/kaprodi/kurikulum?type=cpl|pi|cpmk`
Data kurikulum sesuai tipe.

### POST `/api/kaprodi/kurikulum/cpl`
Tambah CPL. **Body:** `{ kode, deskripsi }`

### PUT `/api/kaprodi/kurikulum/cpl`
Update CPL.

### DELETE `/api/kaprodi/kurikulum/cpl?id=`
Hapus CPL.

### POST `/api/kaprodi/kurikulum/pi`
Tambah PI. **Body:** `{ kode, deskripsi, cplId }`

### PUT `/api/kaprodi/kurikulum/pi` / DELETE `?id=`
Update / hapus PI.

### POST `/api/kaprodi/kurikulum/cpmk`
Tambah CPMK. **Body:** `{ kode, deskripsi, piId, mkId }`

### PUT `/api/kaprodi/kurikulum/cpmk` / DELETE `?id=`
Update / hapus CPMK.

### GET `/api/kaprodi/kurikulum/options?type=cpl|pi|mk`
Dropdown data untuk form kurikulum.

### GET `/api/kaprodi/admin`
Daftar admin prodi.

### POST `/api/kaprodi/admin`
Tambah admin. **Body:** `{ name, email, nidn, password }`

### PUT `/api/kaprodi/admin/[id]`
Update admin.

### DELETE `/api/kaprodi/admin/[id]`
Hapus admin.
