# 🔧 Troubleshooting - Input Nilai Stuck di Loading

## 🐛 Masalah: Halaman Input Nilai Hanya Loading

### ✅ **SUDAH DIPERBAIKI!**

Saya sudah menambahkan:
1. ✅ Error handling yang lebih baik
2. ✅ Pesan error jika kelasId tidak ada
3. ✅ Redirect ke Mata Kuliah Ampu jika tidak ada kelasId
4. ✅ Array validation untuk mencegah error

---

## 🎯 **Cara Mengakses Input Nilai yang BENAR:**

### ❌ SALAH - Akses Langsung
```
http://localhost:3000/dosen/nilai
```
**Hasil:** Stuck di loading atau error "Kelas Tidak Dipilih"

### ✅ BENAR - Dari Mata Kuliah Ampu
```
1. Login dosen
2. Sidebar → Mata Kuliah Ampu
3. Klik "Kelola Nilai" pada salah satu mata kuliah
4. Otomatis redirect ke: /dosen/nilai?kelasId=xxx
```

---

## 🔍 **Cara Debug Jika Masih Loading:**

### 1. Cek Browser Console
```
1. Buka halaman Input Nilai
2. Tekan F12 (Developer Tools)
3. Tab "Console"
4. Lihat error message (warna merah)
```

**Error yang Mungkin Muncul:**
- `404 Not Found` → API endpoint tidak ditemukan
- `500 Internal Server Error` → Error di backend
- `TypeError: Cannot read property` → Data tidak sesuai format

### 2. Cek Network Tab
```
1. F12 → Tab "Network"
2. Refresh halaman
3. Lihat request ke API:
   - /api/dosen/mahasiswa/[kelasId]
   - /api/dosen/nilai
   - /api/dosen/komponen-nilai
4. Klik request → Tab "Response"
5. Lihat response data
```

### 3. Cek Terminal Server
```
Lihat terminal tempat npm run dev jalan
Cari error message berwarna merah
```

---

## 🧪 **Test API Endpoint Manual:**

### Test 1: Cek Mata Kuliah
```bash
# Buka browser, paste URL ini:
http://localhost:3000/api/dosen/mata-kuliah
```

**Expected Response:**
```json
[
  {
    "kelasId": "cls_xxx",
    "kode": "TI2023",
    "nama": "Sistem Basis Data",
    ...
  }
]
```

### Test 2: Cek Mahasiswa (ganti cls_xxx dengan kelasId dari Test 1)
```bash
http://localhost:3000/api/dosen/mahasiswa/cls_xxx
```

**Expected Response:**
```json
{
  "mahasiswa": [...],
  "komponenNilai": [...]
}
```

### Test 3: Run Test Script
```bash
node test-api.js
```

---

## 🔧 **Solusi Berdasarkan Error:**

### Error: "Kelas Tidak Dipilih"
**Penyebab:** Tidak ada `kelasId` di URL

**Solusi:**
```
1. Jangan akses /dosen/nilai langsung
2. Akses dari Mata Kuliah Ampu
3. Klik "Kelola Nilai"
```

### Error: "404 Not Found"
**Penyebab:** API endpoint tidak ditemukan

**Solusi:**
```bash
# Pastikan file API ada:
ls app/api/dosen/mahasiswa/[kelasId]/route.ts

# Restart server:
# Ctrl+C di terminal
npm run dev
```

### Error: "500 Internal Server Error"
**Penyebab:** Error di backend (database, Prisma, dll)

**Solusi:**
```bash
# Cek database
npx prisma studio

# Regenerate Prisma Client
npx prisma generate

# Restart server
npm run dev
```

### Error: "Cannot read property 'map' of undefined"
**Penyebab:** Data dari API tidak sesuai format

**Solusi:**
✅ Sudah diperbaiki dengan array validation

### Stuck di Loading Terus
**Penyebab:** Request API tidak selesai

**Solusi:**
```
1. Cek Network tab di browser
2. Lihat request mana yang pending
3. Cek terminal server untuk error
4. Restart server
```

---

## 📋 **Checklist Debugging:**

- [ ] Server running (`npm run dev`)
- [ ] Database ada data (`npx prisma studio`)
- [ ] Login sebagai dosen
- [ ] Akses dari Mata Kuliah Ampu (bukan langsung ke /dosen/nilai)
- [ ] Klik "Kelola Nilai" pada mata kuliah
- [ ] URL ada `?kelasId=xxx`
- [ ] Browser console tidak ada error
- [ ] Network tab semua request status 200

---

## 🎯 **Flow yang Benar:**

```
1. Login Dosen
   ↓
2. Dashboard Dosen
   ↓
3. Sidebar → Mata Kuliah Ampu
   ↓
4. Lihat tabel mata kuliah
   ↓
5. Klik "Kelola Nilai" pada TI2023 (Sistem Basis Data)
   ↓
6. Redirect ke: /dosen/nilai?kelasId=cls_xxx
   ↓
7. Halaman Input Nilai muncul dengan:
   - Komponen Nilai (UTS, UAS, Tugas)
   - Tabel 8 mahasiswa dengan nilai
```

---

## 🔍 **Cek Data di Database:**

```bash
# Buka Prisma Studio
npx prisma studio

# Cek tabel:
1. Kelas → Lihat kelasId
2. KRS → Lihat mahasiswa yang terdaftar
3. KomponenNilai → Lihat komponen nilai
4. NilaiMahasiswa → Lihat nilai yang sudah ada
```

---

## 🚀 **Quick Fix:**

Jika masih stuck, coba ini:

```bash
# 1. Stop server (Ctrl+C)

# 2. Clear cache
rm -rf .next

# 3. Regenerate Prisma
npx prisma generate

# 4. Restart server
npm run dev

# 5. Hard refresh browser
Ctrl+Shift+R (Windows)
Cmd+Shift+R (Mac)
```

---

## 📞 **Masih Error?**

Kirim screenshot:
1. Browser console (F12 → Console tab)
2. Network tab (F12 → Network tab)
3. Terminal server
4. URL yang diakses

Saya akan bantu troubleshoot lebih lanjut!

---

## ✅ **Verifikasi Berhasil:**

Jika berhasil, Anda akan melihat:
- ✅ Komponen Nilai (UTS 30%, UAS 40%, Tugas 30%)
- ✅ Tabel 8 mahasiswa dengan nilai
- ✅ Button "Tambah Komponen"
- ✅ Button "Simpan Semua Nilai"

**Happy Debugging! 🐛**
