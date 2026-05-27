# 🚀 GitHub Setup Guide - SICAL-TI UNS

## ✅ Git Sudah Dikonfigurasi!

Repository lokal sudah siap untuk di-push ke GitHub.

---

## 📋 **Langkah Selanjutnya:**

### 1. **Buat Repository di GitHub**

1. Buka browser: https://github.com/new
2. Login dengan akun: **adityanajib356@gmail.com**
3. Isi form:
   - **Repository name:** `Apsi2026`
   - **Description:** `Sistem Informasi Perhitungan Capaian Pembelajaran Lulusan Teknik Industri UNS`
   - **Visibility:** Public (atau Private jika ingin private)
   - **❌ JANGAN centang:** "Initialize this repository with a README"
4. Klik **"Create repository"**

---

### 2. **Push ke GitHub**

Setelah repository dibuat, jalankan command ini:

```bash
# Push ke GitHub
git push -u origin main
```

**Jika diminta login:**
- Username: `AdityaNajib`
- Password: Gunakan **Personal Access Token** (bukan password biasa)

---

### 3. **Cara Membuat Personal Access Token (PAT)**

Jika belum punya token:

1. Buka: https://github.com/settings/tokens
2. Klik **"Generate new token"** → **"Generate new token (classic)"**
3. Isi:
   - **Note:** `SICAL-TI UNS`
   - **Expiration:** 90 days (atau sesuai kebutuhan)
   - **Select scopes:** Centang `repo` (full control)
4. Klik **"Generate token"**
5. **COPY TOKEN** (hanya muncul sekali!)
6. Gunakan token ini sebagai password saat push

---

### 4. **Alternative: Push dengan SSH**

Jika ingin menggunakan SSH (lebih aman):

```bash
# 1. Generate SSH key (jika belum punya)
ssh-keygen -t ed25519 -C "adityanajib356@gmail.com"

# 2. Copy public key
cat ~/.ssh/id_ed25519.pub

# 3. Add ke GitHub:
# https://github.com/settings/keys
# Klik "New SSH key" → Paste public key

# 4. Change remote URL
git remote set-url origin git@github.com:AdityaNajib/Apsi2026.git

# 5. Push
git push -u origin main
```

---

## 📊 **Status Saat Ini:**

### ✅ Yang Sudah Dilakukan:
- [x] Git initialized
- [x] Git config (username & email)
- [x] Files added to staging
- [x] Initial commit created
- [x] Branch renamed to `main`
- [x] Remote origin added

### ⏳ Yang Perlu Dilakukan:
- [ ] Buat repository di GitHub
- [ ] Push ke GitHub
- [ ] Verify di browser

---

## 📁 **Files yang Akan Di-push:**

### Source Code (46 files)
```
✅ app/ - Next.js pages & API routes
✅ components/ - Reusable components
✅ lib/ - Utilities (Prisma, Auth)
✅ prisma/ - Database schema & migrations
✅ public/ - Static assets
✅ Configuration files (package.json, tsconfig.json, etc.)
```

### Documentation (12 files)
```
✅ README_GITHUB.md - Main README
✅ START_HERE.md - Quick start
✅ QUICK_START.md - Detailed guide
✅ API_DOCUMENTATION.md - API docs
✅ SETUP_DATABASE.md - Database setup
✅ DATA_MATA_KULIAH.md - Data details
✅ DASHBOARD_DOSEN_UPDATE.md - Dashboard docs
✅ LANDING_PAGE_UPDATE.md - Landing page docs
✅ TROUBLESHOOTING_INPUT_NILAI.md - Troubleshooting
✅ SETUP_DOSEN.md - Dosen setup
✅ SUMMARY_FINAL.md - Summary
✅ README_FINAL.md - Final readme
```

### Ignored Files (.gitignore)
```
❌ node_modules/ - Dependencies
❌ .next/ - Build output
❌ .env - Environment variables
❌ *.db - Database files
❌ test-*.js - Test files
```

---

## 🔧 **Troubleshooting:**

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/AdityaNajib/Apsi2026.git
```

### Error: "failed to push some refs"
```bash
# Pull first (jika ada conflict)
git pull origin main --allow-unrelated-histories

# Then push
git push -u origin main
```

### Error: "Authentication failed"
```bash
# Gunakan Personal Access Token sebagai password
# BUKAN password GitHub biasa
```

### Error: "Permission denied (publickey)"
```bash
# Setup SSH key (lihat section SSH di atas)
```

---

## 📝 **Git Commands Reference:**

### Basic Commands
```bash
# Check status
git status

# Add files
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main

# Pull
git pull origin main
```

### Branch Management
```bash
# Create new branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# Merge branch
git merge feature/new-feature
```

### View History
```bash
# View commits
git log --oneline

# View changes
git diff
```

---

## 🎯 **Next Steps After Push:**

### 1. **Verify Repository**
```
https://github.com/AdityaNajib/Apsi2026
```

### 2. **Update README**
Rename `README_GITHUB.md` to `README.md`:
```bash
git mv README_GITHUB.md README.md
git commit -m "Update README"
git push
```

### 3. **Add Topics (Tags)**
Di GitHub repository settings, tambahkan topics:
- `nextjs`
- `typescript`
- `prisma`
- `education`
- `cpl`
- `obe`
- `iabee`

### 4. **Setup GitHub Pages (Optional)**
Untuk deploy landing page:
1. Settings → Pages
2. Source: Deploy from branch
3. Branch: main → /docs
4. Save

### 5. **Add Collaborators (Optional)**
Settings → Collaborators → Add people

---

## 📊 **Repository Stats:**

```
Total Files: 46
Total Lines: 9,662
Languages:
  - TypeScript: 70%
  - CSS: 15%
  - JavaScript: 10%
  - Other: 5%
```

---

## 🎉 **Selesai!**

Setelah push berhasil, repository Anda akan tersedia di:
```
https://github.com/AdityaNajib/Apsi2026
```

**Clone URL:**
```bash
# HTTPS
git clone https://github.com/AdityaNajib/Apsi2026.git

# SSH
git clone git@github.com:AdityaNajib/Apsi2026.git
```

---

## 📞 **Need Help?**

Jika ada masalah saat push:
1. Cek error message di terminal
2. Baca section Troubleshooting di atas
3. Pastikan repository sudah dibuat di GitHub
4. Pastikan menggunakan Personal Access Token (bukan password)

**Happy Coding! 🚀**
