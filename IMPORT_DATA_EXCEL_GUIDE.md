# 📚 Panduan Import Data dari Excel - Data Pengampu

## Overview

Panduan ini menjelaskan cara mengimport data mata kuliah dan pengampu dari file Excel "Data Pengampu.xlsx" yang telah Anda berikan.

## 📊 Data yang Telah Disiapkan

### 1. Mata Kuliah (35 mata kuliah)
**File**: `sample-data/mata-kuliah-from-excel.csv`

Berisi daftar lengkap mata kuliah dari Excel dengan format:
```csv
kode,nama,sks,semester
08033122045,Kewirausahaan,2,5
08033142021,Pengukuran dan Perancangan Sistem Kerja,2,4
...
```

### 2. Data Pengampu (190+ assignments)
**File**: `sample-data/pengampu-from-excel.csv`

Berisi relasi dosen mengajar mata kuliah dengan format:
```csv
kode_mk,nama_mk,nama_dosen,kelas,tahun_ajaran,semester
08033122045,Kewirausahaan (2 SKS),JUM001 - Jumiyanto Widodo,A,2026/2027,Ganjil
...
```

## 🚀 Cara Import

### Step 1: Import Mata Kuliah

```bash
curl -X POST "http://localhost:3000/api/admin/import/mata-kuliah" \
  -F "file=@sample-data/mata-kuliah-from-excel.csv"
```

**Expected Result:**
- 35 mata kuliah ter-import
- Kode mata kuliah sesuai dengan Excel
- SKS dan semester sudah ter-set

### Step 2: Import Dosen (jika belum)

Pastikan semua dosen sudah ada di database. Buat file `dosen-from-excel.csv`:

```csv
name,email,nidn
Jumiyanto Widodo S.Sos. M.Si.,jum001@staff.uns.ac.id,JUM001
Fahmi Ulin Ni`Mah S. Pd., M. Pd.,fah003@staff.uns.ac.id,FAH003
...
```

Kemudian import:

```bash
curl -X POST "http://localhost:3000/api/admin/import/dosen" \
  -F "file=@dosen-from-excel.csv"
```

### Step 3: Import Pengampu

```bash
curl -X POST "http://localhost:3000/api/admin/import/pengampu?tahun_ajaran=2026/2027&semester=Ganjil" \
  -F "file=@sample-data/pengampu-from-excel.csv"
```

**Expected Result:**
- 190+ relasi pengampu dibuat
- Kelas otomatis dibuat (A, B, C untuk setiap mata kuliah)
- Dosen ter-assign ke kelas yang sesuai

## 📋 Daftar Mata Kuliah yang Akan Diimport

| Kode | Nama | SKS | Semester |
|------|------|-----|----------|
| 08033122045 | Kewirausahaan | 2 | 5 |
| 08033142021 | Pengukuran dan Perancangan Sistem Kerja | 2 | 4 |
| 08033142025 | Perilaku Organisasi | 2 | 4 |
| 08033142027 | Manajemen Pemasaran | 2 | 4 |
| 08033241012 | Praktikum Fisika | 2 | 2 |
| 08033242013 | Material Teknik | 2 | 2 |
| 08033242014 | Mekanika Teknik | 2 | 2 |
| 08033242016 | Pengantar Pengembangan Produk | 2 | 2 |
| 08033242017 | Analisis dan Pengendalian Biaya | 2 | 2 |
| 08033242018 | Proses Manufaktur I | 2 | 2 |
| 08033242034 | Perancangan Fasilitas | 2 | 2 |
| 08033242036 | Praktikum Perancangan Teknik Industri II | 2 | 2 |
| 08033242037 | Pancasila | 2 | 2 |
| 08033242049 | Perancangan Eksperimen | 2 | 2 |
| 08033242050 | Pengendalian dan Penjaminan Mutu | 3 | 2 |
| 08033242052 | Analisis dan Perancangan Sistem Informasi | 2 | 2 |
| 08033242053 | Metodologi Penelitian | 2 | 2 |
| 08033242054 | Praktikum Perancangan Teknik Industri IV | 2 | 2 |
| 08033242056 | Bahasa Indonesia | 2 | 2 |
| 08033243010 | Kalkulus II | 3 | 2 |
| 08033243011 | Fisika II | 3 | 2 |
| 08033243029 | Matematika Optimasi | 3 | 3 |
| 08033243030 | Statistika | 3 | 3 |
| 08033243031 | Riset Operasi I | 3 | 3 |
| 08033243048 | Simulasi Sistem | 3 | 4 |
| 08033243051 | Perancangan dan Manajemen Organisasi Industri | 3 | 5 |
| 08033244032 | Perencanaan dan Pengendalian Produksi | 4 | 4 |
| 08033353002 | Teori Persediaan | 3 | 5 |
| 08033353006 | Pengambilan Keputusan Kriteria Majemuk | 3 | 5 |
| 08033353008 | Manufaktur Cerdas | 3 | 5 |
| 08033353016 | Aplikasi Ergonomi Industri | 3 | 5 |
| 08033353023 | Analisis Komparasi Kuantitatif | 3 | 5 |
| 08033353042 | Manajemen Rantai Pasok yang Berkelanjutan | 3 | 5 |
| 08033353046 | Manufaktur Komposit Alam | 3 | 5 |
| 08033353049 | Rekayasa Balik dan Manufaktur Aditif | 3 | 5 |

**Total: 35 Mata Kuliah**

## 🎯 Fitur Pembatasan Akses Dosen

### Sistem Access Control

Setelah import, sistem akan membatasi akses dosen berdasarkan data pengampu:

**✅ Dosen HANYA bisa:**
- Melihat mata kuliah yang dia ampu
- Input nilai untuk kelas yang dia ajar
- Melihat daftar mahasiswa di kelasnya

**❌ Dosen TIDAK bisa:**
- Melihat mata kuliah yang tidak dia ampu
- Input nilai untuk kelas yang bukan tanggungjawabnya
- Akses data kelas lain

### Contoh Akses Dosen

#### Dosen: JUM001 (Jumiyanto Widodo)
**Bisa akses:**
- 08033122045 - Kewirausahaan Kelas A

**Tidak bisa akses:**
- 08033122045 - Kewirausahaan Kelas B (diampu FAH003)
- Mata kuliah lainnya

#### Dosen: EKO006 (Eko Pujiyanto)
**Bisa akses:**
- 08033243010 - Kalkulus II (Kelas A, B, C)
- 08033243029 - Matematika Optimasi (Kelas A, B, C)
- 08033242049 - Perancangan Eksperimen (Kelas A, B, C)

## 🔒 Implementasi Authorization

### Di API Level

File yang perlu dimodifikasi untuk enforce authorization:

1. **`/api/dosen/mata-kuliah`** - Filter hanya MK yang diampu
2. **`/api/dosen/nilai`** - Validasi dosen bisa akses kelas
3. **`/api/dosen/mahasiswa/[kelasId]`** - Validasi ownership

### Di UI Level

File yang perlu dimodifikasi:

1. **Sidebar Dosen** - Hanya tampilkan MK yang diampu
2. **Halaman Input Nilai** - Dropdown hanya kelas yang diajar
3. **Dashboard Dosen** - Statistik hanya kelasnya

## 📝 Cara Implementasi (Next Steps)

### 1. Update API `/api/dosen/mata-kuliah`

```typescript
// Hanya return mata kuliah yang dosen ampu
export async function GET(request: NextRequest) {
  const userId = getUserIdFromCookie();
  
  const dosen = await prisma.dosen.findUnique({
    where: { userId },
    include: {
      pengampu: {
        include: {
          kelas: {
            include: { mataKuliah: true }
          }
        }
      }
    }
  });
  
  // Return only courses they teach
  const courses = dosen.pengampu.map(p => p.kelas.mataKuliah);
  return NextResponse.json(courses);
}
```

### 2. Update Middleware Authorization

Tambahkan check di setiap endpoint dosen:

```typescript
async function isDosenAuthorizedForKelas(userId: string, kelasId: string) {
  const pengampu = await prisma.pengampu.findFirst({
    where: {
      kelasId,
      dosen: { userId }
    }
  });
  
  return !!pengampu;
}
```

### 3. Update UI - Filter Dropdown

```typescript
// Di halaman input nilai
const allowedKelas = await fetch('/api/dosen/mata-kuliah');
// Dropdown hanya tampilkan kelas dari allowedKelas
```

## ✅ Verification Checklist

Setelah import, verify:

- [ ] 35 mata kuliah ter-import dengan benar
- [ ] 190+ relasi pengampu dibuat
- [ ] Kelas A, B, C ter-create untuk setiap MK
- [ ] Dosen bisa login dan lihat mata kuliahnya
- [ ] Dosen TIDAK bisa lihat MK yang tidak diampu
- [ ] Input nilai hanya untuk kelas yang diajar

## 🐛 Troubleshooting

### Issue: "Dosen tidak ditemukan"
**Solution**: Import dosen terlebih dahulu sebelum pengampu

### Issue: "Mata kuliah tidak ditemukan"
**Solution**: Import mata kuliah terlebih dahulu

### Issue: "Dosen bisa lihat semua mata kuliah"
**Solution**: Implementasi authorization filter di API

## 📊 Expected Database State

Setelah import lengkap:

```
MataKuliah: 35 records
Kelas: ~100 records (A, B, C untuk setiap MK)
Pengampu: ~190 records
Dosen: (sesuai jumlah dosen unique di Excel)
```

## 🎉 Result

Setelah import berhasil:

✅ Semua mata kuliah dari Excel ter-import  
✅ Dosen ter-assign ke kelas sesuai Excel  
✅ Sistem siap untuk input nilai  
✅ Authorization by pengampu ready  

---

**Next**: Implementasi authorization di API dan UI untuk enforce access control! 🔒
