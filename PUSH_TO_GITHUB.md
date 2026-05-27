# 🚀 PUSH TO GITHUB - Quick Guide

## ✅ STATUS: READY TO PUSH!

Git sudah dikonfigurasi dan siap untuk di-push ke GitHub.

---

## 📋 **3 LANGKAH MUDAH:**

### 1️⃣ **Buat Repository di GitHub**

**Buka browser:**
```
https://github.com/new
```

**Isi form:**
- Repository name: `Apsi2026`
- Description: `Sistem Informasi Perhitungan Capaian Pembelajaran Lulusan Teknik Industri UNS`
- Public atau Private (pilih sesuai kebutuhan)
- ❌ **JANGAN centang** "Initialize this repository with a README"

**Klik:** `Create repository`

---

### 2️⃣ **Push ke GitHub**

**Jalankan command ini di terminal:**

```bash
git push -u origin main
```

**Jika diminta login:**
- Username: `AdityaNajib`
- Password: **[Personal Access Token]** (bukan password biasa)

---

### 3️⃣ **Buat Personal Access Token (Jika Belum Punya)**

**Jika belum punya token:**

1. Buka: https://github.com/settings/tokens
2. Klik: `Generate new token` → `Generate new token (classic)`
3. Isi:
   - Note: `SICAL-TI UNS`
   - Expiration: `90 days`
   - Scopes: ✅ Centang `repo`
4. Klik: `Generate token`
5. **COPY TOKEN** (hanya muncul sekali!)
6. Paste sebagai password saat push

---

## 🎯 **Setelah Push Berhasil:**

### Verify Repository
```
https://github.com/AdityaNajib/Apsi2026
```

### Clone URL
```bash
git clone https://github.com/AdityaNajib/Apsi2026.git
```

---

## 📊 **Yang Akan Di-push:**

### ✅ Source Code
- 46 files
- 9,662 lines of code
- TypeScript, CSS, JavaScript

### ✅ Documentation
- 12 markdown files
- Complete guides & API docs

### ❌ Ignored (tidak di-push)
- node_modules/
- .next/
- .env
- *.db (database files)

---

## 🔧 **Troubleshooting:**

### Error: "Authentication failed"
**Solusi:** Gunakan Personal Access Token (bukan password)

### Error: "Repository not found"
**Solusi:** Pastikan repository sudah dibuat di GitHub

### Error: "Permission denied"
**Solusi:** Cek username & token sudah benar

---

## 📞 **Need Help?**

Baca dokumentasi lengkap di:
- `GITHUB_SETUP.md` - Setup guide lengkap
- `README_GITHUB.md` - Main README

---

## ✅ **Checklist:**

- [x] Git initialized
- [x] Git config (adityanajib356@gmail.com)
- [x] Files committed
- [x] Remote origin added
- [ ] Repository created on GitHub
- [ ] Pushed to GitHub
- [ ] Verified on browser

---

**Happy Coding! 🚀**
