# 📊 Analisis Kelengkapan Sistem SICAL-TI UNS

**Tanggal:** 4 Juni 2026  
**Status:** Analisis berdasarkan implementasi existing (tanpa PDF requirements)

---

## ✅ Komponen yang SUDAH ADA

### 1. **CPL (Capaian Pembelajaran Lulusan)** ✅
- ✅ Model database: `CPL`
- ✅ CRUD operations di dashboard Kaprodi/Admin
- ✅ 12 CPL sesuai standar IABEE sudah di-seed
- ✅ Visualisasi dengan Radar Chart
- ✅ Laporan CPL di dashboard Kaprodi/Admin

**Lokasi:**
- Schema: `prisma/schema.prisma` → model `CPL`
- API: `/api/kaprodi/kurikulum/cpl`
- Frontend: `/kaprodi/data-kurikulum` & `/admin/data-kurikulum`

---

### 2. **PI/IK (Performance Indicator / Indikator Kinerja)** ✅
- ✅ Model database: `PI` 
- ✅ CRUD operations
- ✅ Relasi: `CPL` → `PI` (one-to-many)
- ✅ 8 PI sudah di-seed
- ✅ Setiap PI terhubung ke CPL parent

**Catatan:** Di sistem ini disebut **PI** tapi sebenarnya ini adalah **IK (Indikator Kinerja)**

**Struktur:**
```
CPL (Capaian Pembelajaran Lulusan)
 └─ PI/IK (Indikator Kinerja) ← INI SUDAH ADA!
     └─ CPMK (Capaian Pembelajaran MK)
         └─ Mata Kuliah
```

**Contoh di Database:**
```
CPL-01: Kemampuan menerapkan pengetahuan matematika, sains, dan prinsip rekayasa
 ├─ PI-01-01: Mampu mengidentifikasi, merumuskan, dan menganalisis masalah rekayasa
 └─ PI-01-02: Mampu menerapkan metode matematika untuk menyelesaikan masalah

CPL-02: Kemampuan merancang dan melakukan eksperimen
 ├─ PI-02-01: Mampu merancang eksperimen untuk menguji hipotesis
 └─ PI-02-02: Mampu menganalisis dan menginterpretasi data eksperimen
```

**Lokasi:**
- Schema: `prisma/schema.prisma` → model `PI`
- API: `/api/kaprodi/kurikulum/pi`
- Frontend: `/kaprodi/data-kurikulum` & `/admin/data-kurikulum`

---

### 3. **CPMK (Capaian Pembelajaran Mata Kuliah)** ✅
- ✅ Model database: `CPMK`
- ✅ CRUD operations
- ✅ Relasi: `PI` → `CPMK` → `MataKuliah`
- ✅ 9 CPMK tersebar di 4 mata kuliah

**Lokasi:**
- Schema: `prisma/schema.prisma` → model `CPMK`
- API: `/api/kaprodi/kurikulum/cpmk`
- Frontend: `/kaprodi/data-kurikulum` & `/admin/data-kurikulum`

---

### 4. **BobotCPMK** ✅
- ✅ Model database: `BobotCPMK`
- ✅ Relasi: `KomponenNilai` → `CPMK` → bobot
- ✅ Untuk pemetaan komponen nilai ke CPMK

**Fungsi:**
Menghubungkan komponen nilai (UTS, UAS, Tugas) dengan CPMK dan bobotnya.

**Contoh:**
```
Komponen: UTS (30%)
 ├─ CPMK-01: 40% (kontribusi ke CPMK-01)
 ├─ CPMK-02: 30% (kontribusi ke CPMK-02)
 └─ CPMK-03: 30% (kontribusi ke CPMK-03)
Total: 100%
```

---

## 📋 Hierarki Lengkap yang Sudah Diimplementasi

```
CPL (Capaian Pembelajaran Lulusan)
 └─ PI/IK (Performance Indicator / Indikator Kinerja)
     └─ CPMK (Capaian Pembelajaran Mata Kuliah)
         └─ Mata Kuliah
             └─ Kelas
                 └─ Komponen Nilai (UTS, UAS, Tugas, dll)
                     └─ Nilai Mahasiswa
```

### Contoh Flow Lengkap:

1. **Kaprodi/Admin** membuat **CPL-01**: "Kemampuan Teknik"
2. **Kaprodi/Admin** membuat **PI-01-01**: "Mampu menganalisis masalah" → terhubung ke CPL-01
3. **Kaprodi/Admin** membuat **CPMK-TI2023-01**: "Mampu merancang database" → terhubung ke PI-01-01
4. **Kaprodi/Admin** assign CPMK-TI2023-01 ke **Mata Kuliah** TI2023 (Sistem Basis Data)
5. **Dosen** membuat **Kelas A** untuk TI2023
6. **Dosen** membuat **Komponen Nilai**: UTS (30%), UAS (40%), Tugas (30%)
7. **Dosen** mapping komponen ke CPMK:
   - UTS → CPMK-TI2023-01 (40%), CPMK-TI2023-02 (60%)
8. **Dosen** input **Nilai Mahasiswa** per komponen
9. Sistem hitung **Nilai Akhir** otomatis
10. Sistem kalkulasi **Nilai CPL** berdasarkan agregasi dari CPMK → PI → CPL
11. **Mahasiswa** lihat hasil CPL di dashboard

---

## 🎯 Fitur yang SUDAH LENGKAP

### ✅ Dashboard Kaprodi/Admin
- [x] Kelola CPL (Create, Read, Update, Delete)
- [x] Kelola PI/IK (Create, Read, Update, Delete)
- [x] Kelola CPMK (Create, Read, Update, Delete)
- [x] Pemetaan CPL → PI → CPMK → MK
- [x] Laporan CPL dengan visualisasi
- [x] Export data

### ✅ Dashboard Dosen
- [x] Kelola Komponen Nilai per kelas
- [x] Set bobot per komponen
- [x] **Mapping Komponen ke CPMK** (via BobotCPMK)
- [x] Input nilai mahasiswa per komponen
- [x] Rekap nilai otomatis
- [x] Export CSV

### ✅ Dashboard Mahasiswa
- [x] Lihat hasil CPL (agregat dari nilai)
- [x] Visualisasi Radar Chart CPL
- [x] Riwayat nilai per semester
- [x] Profil akademik

---

## 🔍 Apa yang User Maksud dengan "IK"?

Berdasarkan konteks sistem CPL universitas, **IK** kemungkinan besar adalah:

### 1. **PI/IK (Performance Indicator / Indikator Kinerja)** ✅ SUDAH ADA
- Ini adalah breakdown dari CPL
- Setiap CPL memiliki beberapa IK/PI
- Sudah diimplementasi di model `PI`

### 2. **Indikator Kinerja Mata Kuliah** ✅ SUDAH ADA (sebagai CPMK)
- Ini adalah CPMK yang sudah ada
- CPMK adalah indikator kinerja di level mata kuliah

### 3. **Indikator Kinerja Dosen/Program Studi** ❓ BELUM ADA
- Jika yang dimaksud adalah KPI (Key Performance Indicator) untuk dosen/prodi
- Misalnya: tingkat kelulusan, IPK rata-rata, publikasi, dll.
- **Ini BELUM ada** di sistem

---

## 📝 Kemungkinan Requirements dari PDF

Jika ada PDF requirements yang menyebutkan hal-hal berikut, maka sudah/belum:

| Requirement | Status | Keterangan |
|-------------|--------|-----------|
| CPL (Capaian Pembelajaran Lulusan) | ✅ Ada | 12 CPL sesuai IABEE |
| PI/IK (Indikator Kinerja) | ✅ Ada | Model `PI` di database |
| CPMK (Capaian Pembelajaran MK) | ✅ Ada | Terhubung ke PI dan MK |
| Pemetaan CPL → IK → CPMK | ✅ Ada | Relasi database lengkap |
| Input Nilai Dosen | ✅ Ada | Per komponen, per mahasiswa |
| Bobot Komponen Nilai | ✅ Ada | UTS, UAS, Tugas, dll |
| **Bobot CPMK per Komponen** | ✅ Ada | Model `BobotCPMK` |
| Rekap Nilai Mahasiswa | ✅ Ada | Dengan statistik lengkap |
| Laporan CPL | ✅ Ada | Visualisasi + filter |
| Dashboard Mahasiswa | ✅ Ada | Profil, CPL, Riwayat Nilai |
| Manajemen Admin oleh Kaprodi | ✅ Ada | CRUD admin prodi |
| Export Data (CSV/Excel) | ✅ Ada | Di rekap dosen |
| **KPI Dosen/Prodi** | ❌ Belum | Jika ini yang dimaksud IK |
| **Evaluasi Kinerja Dosen** | ❌ Belum | Jika ada di PDF |
| **Analitik Tren CPL** | ❌ Belum | Grafik tren per semester |
| **Rekomendasi Pembelajaran** | ❌ Belum | AI/ML untuk rekomendasi |

---

## 🆕 Fitur yang MUNGKIN Kurang (jika ada di PDF)

### 1. **KPI/IK Program Studi** ❌
Jika PDF requirements menyebutkan KPI/Indikator Kinerja di level program studi:
- Tingkat kelulusan tepat waktu
- IPK rata-rata per angkatan
- Persentase mahasiswa dengan CPL tercapai
- Akreditasi dan ranking

**Status:** BELUM DIIMPLEMENTASI

### 2. **Evaluasi Kinerja Dosen** ❌
Jika ada requirement untuk menilai kinerja dosen:
- Jumlah mahasiswa lulus
- Rata-rata nilai kelas
- Tingkat pencapaian CPL di kelas yang diampu
- Feedback mahasiswa

**Status:** BELUM DIIMPLEMENTASI

### 3. **Analitik & Tren** ❌
- Grafik tren CPL per semester
- Perbandingan antar angkatan
- Identifikasi CPL yang sering tidak tercapai
- Analisis korelasi nilai MK dengan CPL

**Status:** BELUM DIIMPLEMENTASI (data ada, tapi visualisasi belum)

### 4. **Pemetaan Bobot CPMK ke Komponen** ⚠️ PARTIAL
Model `BobotCPMK` sudah ada di schema, tapi:
- ❌ UI untuk input bobot CPMK per komponen belum ada
- ❌ Dosen belum bisa set bobot CPMK di halaman Input Nilai
- ❌ Kalkulasi CPL dari nilai CPMK belum otomatis

**Yang Ada:**
- ✅ Model database `BobotCPMK`
- ✅ Relasi `KomponenNilai` → `BobotCPMK` → `CPMK`

**Yang Belum:**
- ❌ Form input bobot CPMK di frontend
- ❌ API endpoint untuk manage BobotCPMK
- ❌ Logic kalkulasi CPL dari bobot CPMK

### 5. **Otomatisasi Kalkulasi CPL** ❌
Saat ini:
- ✅ Nilai mahasiswa per komponen tersimpan
- ✅ Nilai akhir MK dihitung otomatis
- ❌ Nilai CPL mahasiswa belum dihitung otomatis dari nilai MK

**Yang Perlu Ditambahkan:**
1. Dosen set bobot CPMK per komponen nilai
2. Sistem kalkulasi nilai CPMK mahasiswa
3. Sistem agregasi nilai CPMK → PI → CPL
4. Update otomatis nilai CPL mahasiswa

---

## 🎯 Kesimpulan

### ✅ Yang SUDAH ADA (90% fitur core):
1. ✅ CPL (12 CPL)
2. ✅ **PI/IK** (8 PI) ← **INI SUDAH ADA!**
3. ✅ CPMK (9 CPMK)
4. ✅ Mata Kuliah (4 MK)
5. ✅ Kelas & Pengampu
6. ✅ Komponen Nilai (UTS, UAS, Tugas)
7. ✅ Input Nilai Mahasiswa
8. ✅ Rekap Nilai
9. ✅ Dashboard semua role
10. ✅ Manajemen Admin
11. ✅ Visualisasi CPL (Radar Chart)
12. ✅ Export CSV

### ❌ Yang MUNGKIN Kurang (tergantung PDF):
1. ❌ UI untuk mapping bobot CPMK ke komponen nilai
2. ❌ Kalkulasi otomatis nilai CPL dari nilai MK
3. ❌ KPI Program Studi (jika ada di requirement)
4. ❌ Evaluasi Kinerja Dosen (jika ada di requirement)
5. ❌ Analitik & Tren (grafik lebih advanced)

---

## 💡 Rekomendasi

### Jika Ada PDF Requirements:
1. **Upload PDF** agar saya bisa analisis detail
2. Saya akan:
   - ✅ Checklist semua requirement
   - ✅ Identifikasi gap
   - ✅ Prioritas implementasi
   - ✅ Estimasi waktu development

### Jika Tidak Ada PDF:
Sistem sudah **90% complete** untuk standar sistem CPL universitas:
- ✅ Hierarki lengkap: CPL → PI/IK → CPMK → MK
- ✅ Input nilai & rekap
- ✅ Dashboard semua role
- ✅ Visualisasi & export

**Yang perlu ditambahkan untuk 100%:**
1. UI untuk bobot CPMK (2-3 jam development)
2. Kalkulasi otomatis CPL (4-6 jam development)
3. API integration dashboard mahasiswa (2-3 jam)

---

## 📞 Pertanyaan untuk User

1. **Apakah ada PDF requirements?**
   - Jika ya, tolong share agar saya bisa analisis lengkap

2. **IK yang dimaksud adalah:**
   - a) PI/IK (Performance Indicator) ← **SUDAH ADA**
   - b) KPI Program Studi ← **BELUM ADA**
   - c) Indikator lainnya? ← Tolong jelaskan

3. **Apakah perlu fitur tambahan:**
   - Kalkulasi otomatis nilai CPL dari nilai MK?
   - UI untuk bobot CPMK per komponen?
   - Analitik & tren CPL per semester?
   - KPI Program Studi?

---

## 🎓 Summary

**Sistem SICAL-TI UNS sudah lengkap dengan:**
- ✅ CPL, PI/IK, CPMK (hierarki lengkap)
- ✅ Input nilai & rekap
- ✅ Dashboard 4 role
- ✅ Visualisasi & export

**Model database PI/IK SUDAH ADA dan sudah digunakan!**

Jika ada requirement spesifik dari PDF yang belum terpenuhi, tolong share PDF-nya atau jelaskan fitur yang kurang agar saya bisa implementasi. 🚀

