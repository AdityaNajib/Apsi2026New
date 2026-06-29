# 🔑 Kredensial Akun — SICAL-TI UNS

> Semua akun menggunakan password default: **`password123`**

---

## Akun Default (dari Seed)

### Kaprodi
- **Email:** `wakhidjauhari@kaprodi.uns.ac.id`
- **Password:** `password123`
- **Role:** KAPRODI
- **Akses:** Full — CRUD kurikulum, laporan CPL, manajemen admin

### Penjaminan Mutu
- **Email:** `ratna@jamu.uns.ac.id`
- **Password:** `password123`
- **Role:** JAMU
- **Akses:** Sama dengan Kaprodi (CRUD CPL/PI/CPMK, laporan, download)

### Admin Prodi
- **Email:** `budi@admin.uns.ac.id`
- **Password:** `password123`
- **Role:** ADMIN
- **Akses:** Manajemen pengguna, kelas, mata kuliah, input nilai

### Dosen 1
- **Email:** `joko.widodo@staff.uns.ac.id`
- **Password:** `password123`
- **Role:** DOSEN
- **NIDN:** 0612108901
- **Mengampu:** Sistem Basis Data, Algoritma Pemrograman, Kecerdasan Buatan, Manajemen Proyek

### Dosen 2
- **Email:** `siti.nurhaliza@staff.uns.ac.id`
- **Password:** `password123`
- **Role:** DOSEN
- **NIDN:** 0615109002

### Mahasiswa (10 akun)
| NIM | Nama | Email |
|-----|------|-------|
| I0323001 | Aditya Pratama | `aditya@student.uns.ac.id` |
| I0323002 | Budi Santoso | `budi@student.uns.ac.id` |
| I0323003 | Citra Dewi | `citra@student.uns.ac.id` |
| I0323004 | Dian Purnama | `dian@student.uns.ac.id` |
| I0323005 | Eka Wijaya | `eka@student.uns.ac.id` |
| I0323006 | Fajar Ramadhan | `fajar@student.uns.ac.id` |
| I0323007 | Gita Savitri | `gita@student.uns.ac.id` |
| I0323008 | Hendra Kusuma | `hendra@student.uns.ac.id` |
| I0323009 | Indah Permata | `indah@student.uns.ac.id` |
| I0323010 | Joko Susilo | `joko@student.uns.ac.id` |

---

## Aturan Domain Email

Login otomatis mendeteksi role dari domain email:

| Domain | Role |
|--------|------|
| `@kaprodi.uns.ac.id` | Kaprodi |
| `@jamu.uns.ac.id` | Penjaminan Mutu |
| `@admin.uns.ac.id` | Admin Prodi |
| `@staff.uns.ac.id` | Dosen (atau Admin dengan role ADMIN) |
| `@student.uns.ac.id` | Mahasiswa |

---

## Reset Password / Data

Untuk reset semua data ke kondisi awal:

```powershell
cd "D:\Kuliah\Sem 6\Analisis dan Perancangan Sistem Informasi\Tubes\apsi2026\apsi2026"
npx prisma migrate reset --force
```

Semua akun kembali ke default dengan password `password123`.

> Panduan lengkap edit data awal ada di [`MULAI_DISINI.md`](./MULAI_DISINI.md).
