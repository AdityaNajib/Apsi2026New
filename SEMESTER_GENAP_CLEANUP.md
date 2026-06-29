# Laporan: Cleanup Kelas Semester Ganjil

**Tanggal**: 16 Juni 2026  
**Tujuan**: Menghapus semua kelas untuk mata kuliah semester ganjil, agar hanya semester genap yang memiliki kelas aktif

---

## 📋 Requirement

> "untuk matkul yang terisi hanya semester genap, 2025 sem 2 2024 sem 4 2023 sem 6 dst"

**Interpretasi**:
- Mata kuliah tetap ada untuk semua semester (1-8)
- Kelas hanya dibuka untuk semester **GENAP** (2, 4, 6, 8)
- Kelas semester **GANJIL** (1, 3, 5, 7) dihapus

**Alasan**: 
- Angkatan 2025 → Semester 2 (genap)
- Angkatan 2024 → Semester 4 (genap)
- Angkatan 2023 → Semester 6 (genap)
- Angkatan 2022 → Semester 8 (genap)

---

## 🔍 Kondisi SEBELUM Cleanup

| Semester | Jumlah MK | Jumlah Kelas | Status |
|----------|-----------|--------------|--------|
| 1 (Ganjil) | 16 MK | 48 kelas | ❌ Akan dihapus |
| 2 (Genap) | 18 MK | 54 kelas | ✅ Dipertahankan |
| 3 (Ganjil) | 10 MK | 30 kelas | ❌ Akan dihapus |
| 4 (Genap) | 7 MK | 21 kelas | ✅ Dipertahankan |
| 5 (Ganjil) | 18 MK | 54 kelas | ❌ Akan dihapus |
| 6 (Genap) | 47 MK | 141 kelas | ✅ Dipertahankan |
| 7 (Ganjil) | 3 MK | 9 kelas | ❌ Akan dihapus |
| 8 (Genap) | 3 MK | 9 kelas | ✅ Dipertahankan |

**Total**: 122 MK, 366 kelas

---

## 🗑️ Proses Penghapusan

### Kelas yang Dihapus
- **Total kelas dihapus**: 141 kelas (semester ganjil: 1, 3, 5, 7)
- **Mata kuliah affected**: 47 MK

### Cascade Delete
Untuk menjaga integritas database, relasi berikut juga dihapus:

1. **BobotCPMK**: 0 record
2. **NilaiMahasiswa**: 1 record
3. **KomponenNilai**: 5 record
4. **KRS**: 754 record (mahasiswa yang terdaftar di kelas semester ganjil)
5. **Pengampu**: 20 record (dosen pengampu kelas semester ganjil)
6. **Kelas**: 141 record

---

## ✅ Kondisi SETELAH Cleanup

| Semester | Jumlah MK | Jumlah Kelas | Status |
|----------|-----------|--------------|--------|
| 1 (Ganjil) | 16 MK | **0 kelas** | ❌ TIDAK ADA KELAS |
| 2 (Genap) | 18 MK | **54 kelas** | ✅ ADA KELAS |
| 3 (Ganjil) | 10 MK | **0 kelas** | ❌ TIDAK ADA KELAS |
| 4 (Genap) | 7 MK | **21 kelas** | ✅ ADA KELAS |
| 5 (Ganjil) | 18 MK | **0 kelas** | ❌ TIDAK ADA KELAS |
| 6 (Genap) | 47 MK | **141 kelas** | ✅ ADA KELAS |
| 7 (Ganjil) | 3 MK | **0 kelas** | ❌ TIDAK ADA KELAS |
| 8 (Genap) | 3 MK | **9 kelas** | ✅ ADA KELAS |

---

## 📊 Statistik Akhir

### Database Summary
- **Total Mata Kuliah**: 122 MK (tetap, tidak ada yang dihapus)
- **MK dengan Kelas**: 75 MK (semester genap: 2, 4, 6, 8)
- **MK tanpa Kelas**: 47 MK (semester ganjil: 1, 3, 5, 7)
- **Total Kelas Aktif**: 225 kelas (turun dari 366)
- **Total KRS**: 1,754 record (turun dari 2,508)
- **Total Pengampu**: 14 dosen (turun dari 34)
- **Mahasiswa Aktif**: 200 mahasiswa

### Breakdown Kelas per Semester Genap
- **Semester 2**: 18 MK × 3 kelas = 54 kelas
- **Semester 4**: 7 MK × 3 kelas = 21 kelas
- **Semester 6**: 47 MK × 3 kelas = 141 kelas
- **Semester 8**: 3 MK × 3 kelas = 9 kelas
- **Total**: 225 kelas

---

## 🎯 Hasil Verifikasi

✅ **BERHASIL**: Kelas hanya ada di semester GENAP (2, 4, 6, 8)  
✅ **KONSISTEN**: Semua mata kuliah semester genap memiliki 3 kelas (A, B, C)  
✅ **SESUAI**: Angkatan 2025→Sem 2, 2024→Sem 4, 2023→Sem 6, 2022→Sem 8  
✅ **DATA INTEGRITY**: Tidak ada foreign key violation, cascade delete berjalan sempurna

---

## 📝 Catatan

1. **Mata kuliah tidak dihapus**: Semua 122 mata kuliah tetap ada di database, hanya kelas-nya yang dihapus untuk semester ganjil
2. **KRS mahasiswa**: 754 KRS untuk kelas semester ganjil telah dihapus
3. **Pengampu dosen**: 20 pengampu untuk kelas semester ganjil telah dihapus
4. **Komponen nilai**: 5 komponen nilai untuk kelas semester ganjil telah dihapus
5. **Data nilai**: 1 nilai mahasiswa yang terkait telah dihapus

---

## 🔧 Script yang Digunakan

- `scripts/check-semester-distribution.mjs` - Untuk mengecek distribusi awal
- `scripts/delete-kelas-semester-ganjil.mjs` - Untuk menghapus kelas semester ganjil

---

**Status**: ✅ SELESAI  
**Impact**: Database sekarang hanya memiliki kelas untuk semester genap sesuai dengan angkatan mahasiswa aktif
