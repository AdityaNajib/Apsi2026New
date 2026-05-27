# 📚 Data Mata Kuliah Ampu - Dashboard Dosen

## ✅ DATABASE SUDAH DIUPDATE!

Dosen sekarang mengampu **4 mata kuliah** dengan total **26 mahasiswa**.

---

## 📊 **Mata Kuliah yang Diampu Dosen**

### 1️⃣ **TI2023 - Sistem Basis Data** ⭐
- **Kelas:** A
- **SKS:** 3
- **Semester:** 3
- **Mahasiswa:** 8 orang
- **Status:** ✅ **SUDAH ADA NILAI LENGKAP**
- **Komponen Nilai:**
  - UTS: 30%
  - UAS: 40%
  - Tugas: 30%
  - Total: 100% ✓

**Mahasiswa dengan Nilai:**
| NIM      | Nama            | UTS | UAS | Tugas | Akhir | Huruf |
|----------|-----------------|-----|-----|-------|-------|-------|
| I0323001 | Aditya Pratama  | 75  | 80  | 85    | 80.5  | A-    |
| I0323002 | Budi Santoso    | 80  | 85  | 90    | 85.5  | A     |
| I0323003 | Citra Dewi      | 70  | 75  | 80    | 75.5  | B+    |
| I0323004 | Dian Purnama    | 85  | 90  | 88    | 88.1  | A     |
| I0323005 | Eka Wijaya      | 78  | 82  | 86    | 82.4  | A-    |
| I0323006 | Fajar Ramadhan  | 82  | 88  | 84    | 85.2  | A     |
| I0323007 | Gita Savitri    | 76  | 80  | 82    | 79.6  | B+    |
| I0323008 | Hendra Kusuma   | 88  | 92  | 90    | 90.4  | A     |

---

### 2️⃣ **TI1014 - Algoritma Pemrograman**
- **Kelas:** B
- **SKS:** 4
- **Semester:** 1
- **Mahasiswa:** 7 orang
- **Status:** ⚠️ **BELUM ADA KOMPONEN NILAI**

**Mahasiswa Terdaftar:**
1. I0323001 - Aditya Pratama
2. I0323002 - Budi Santoso
3. I0323003 - Citra Dewi
4. I0323004 - Dian Purnama
5. I0323005 - Eka Wijaya
6. I0323006 - Fajar Ramadhan
7. I0323007 - Gita Savitri

**Action Required:**
```
1. Klik "Kelola Nilai"
2. Tambah Komponen Nilai (UTS, UAS, Tugas, dll)
3. Pastikan total bobot = 100%
4. Input nilai mahasiswa
```

---

### 3️⃣ **TI3055 - Kecerdasan Buatan**
- **Kelas:** A
- **SKS:** 3
- **Semester:** 5
- **Mahasiswa:** 6 orang
- **Status:** ⚠️ **BELUM ADA KOMPONEN NILAI**

**Mahasiswa Terdaftar:**
1. I0323001 - Aditya Pratama
2. I0323002 - Budi Santoso
3. I0323003 - Citra Dewi
4. I0323004 - Dian Purnama
5. I0323005 - Eka Wijaya
6. I0323006 - Fajar Ramadhan

**Action Required:**
```
1. Klik "Kelola Nilai"
2. Tambah Komponen Nilai
3. Input nilai mahasiswa
```

---

### 4️⃣ **TI4012 - Manajemen Proyek**
- **Kelas:** A
- **SKS:** 2
- **Semester:** 7
- **Mahasiswa:** 5 orang
- **Status:** ⚠️ **BELUM ADA KOMPONEN NILAI**

**Mahasiswa Terdaftar:**
1. I0323001 - Aditya Pratama
2. I0323002 - Budi Santoso
3. I0323003 - Citra Dewi
4. I0323004 - Dian Purnama
5. I0323005 - Eka Wijaya

**Action Required:**
```
1. Klik "Kelola Nilai"
2. Tambah Komponen Nilai
3. Input nilai mahasiswa
```

---

## 📈 **Statistik Dosen**

### Total Overview
- **Total Mata Kuliah:** 4
- **Total Mahasiswa:** 26 (8 + 7 + 6 + 5)
- **Total SKS:** 12 (3 + 4 + 3 + 2)
- **Semester Aktif:** Ganjil 2026/2027

### Status Penilaian
- ✅ **Selesai:** 1 kelas (Sistem Basis Data)
- ⚠️ **Belum Lengkap:** 3 kelas (perlu tambah komponen nilai)

---

## 🎯 **Testing Flow**

### Test 1: Lihat Semua Mata Kuliah
```
1. Login: dosen@staff.uns.ac.id / password123
2. Sidebar → Mata Kuliah Ampu
3. Lihat tabel 4 mata kuliah
4. Cek statistik di atas tabel:
   - Total MK: 4
   - Total Mahasiswa: 26
   - Total SKS: 12
```

### Test 2: Input Nilai (Sistem Basis Data)
```
1. Klik "Kelola Nilai" pada TI2023
2. Lihat komponen: UTS 30%, UAS 40%, Tugas 30%
3. Lihat tabel 8 mahasiswa dengan nilai
4. Edit nilai mahasiswa
5. Klik "Simpan Semua Nilai"
```

### Test 3: Tambah Komponen (Algoritma Pemrograman)
```
1. Klik "Kelola Nilai" pada TI1014
2. Klik "Tambah Komponen"
3. Tambah:
   - UTS: 30%
   - UAS: 40%
   - Tugas: 20%
   - Quiz: 10%
4. Total: 100% ✓
5. Input nilai untuk 7 mahasiswa
```

### Test 4: Lihat Rekap
```
1. Sidebar → Rekap Mahasiswa
2. Pilih "TI2023 - Sistem Basis Data"
3. Lihat statistik:
   - Rata-rata: ~82
   - Tertinggi: 90.4
   - Terendah: 75.5
   - Lulus: 8/8
4. Export CSV
```

---

## 🗄️ **Verifikasi Database**

### Cek dengan Prisma Studio
```bash
npx prisma studio
```

**Tabel yang Perlu Dicek:**
1. **Pengampu** → 4 records (dosen-001 mengampu 4 kelas)
2. **Kelas** → 4 records
3. **KRS** → 26 records (mahasiswa enrolled)
4. **KomponenNilai** → 3 records (hanya untuk kelas 1)
5. **NilaiMahasiswa** → 24 records (8 mhs × 3 komponen)

---

## 🔑 **Login Info**

### Dosen
- **Email:** dosen@staff.uns.ac.id
- **Password:** password123
- **Mengampu:** 4 mata kuliah (26 mahasiswa)

### Mahasiswa (untuk testing)
- **Email:** aditya@student.uns.ac.id
- **Password:** password123
- **Terdaftar di:** 4 kelas

---

## 📋 **Checklist Verifikasi**

- [ ] Login sebagai dosen berhasil
- [ ] Dashboard menampilkan 4 stat cards
- [ ] Mata Kuliah Ampu menampilkan 4 mata kuliah
- [ ] Total mahasiswa: 26
- [ ] Total SKS: 12
- [ ] Klik "Kelola Nilai" pada TI2023 → muncul 8 mahasiswa
- [ ] Klik "Kelola Nilai" pada TI1014 → muncul 7 mahasiswa
- [ ] Klik "Kelola Nilai" pada TI3055 → muncul 6 mahasiswa
- [ ] Klik "Kelola Nilai" pada TI4012 → muncul 5 mahasiswa
- [ ] Rekap Mahasiswa → pilih TI2023 → muncul statistik

---

## 🎨 **Screenshot Expected**

### Mata Kuliah Ampu
```
┌─────────────────────────────────────────────────┐
│ Mata Kuliah Diampu — Semester Ganjil 2026       │
├─────────────────────────────────────────────────┤
│ Kode  │ Nama MK              │ Mhs │ Status     │
├─────────────────────────────────────────────────┤
│ TI2023│ Sistem Basis Data    │  8  │ Siap Input │
│ TI1014│ Algoritma Pemrograman│  7  │ Belum Ada  │
│ TI3055│ Kecerdasan Buatan    │  6  │ Belum Ada  │
│ TI4012│ Manajemen Proyek     │  5  │ Belum Ada  │
└─────────────────────────────────────────────────┘
```

---

## 🚀 **Next Steps**

### Untuk Mata Kuliah Lain (TI1014, TI3055, TI4012):

1. **Tambah Komponen Nilai**
   ```
   Contoh untuk TI1014 (Algoritma):
   - UTS: 30%
   - UAS: 40%
   - Tugas: 20%
   - Quiz: 10%
   ```

2. **Input Nilai Mahasiswa**
   ```
   Input nilai 0-100 untuk setiap komponen
   ```

3. **Lihat Rekap**
   ```
   Cek statistik dan export CSV
   ```

---

## ✅ **Selesai!**

Database sudah terisi lengkap dengan:
- ✅ 4 mata kuliah diampu oleh dosen
- ✅ 26 mahasiswa terdaftar
- ✅ 1 mata kuliah sudah ada nilai lengkap
- ✅ 3 mata kuliah siap untuk input nilai

**Silakan test semua fitur! 🎉**
