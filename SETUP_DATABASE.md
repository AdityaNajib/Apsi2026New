# 🗄️ Setup Database - SICAL-TI

## ⚠️ Error: MySQL Connection Failed

Jika Anda mendapat error seperti ini:
```
Access denied for user 'root'@'localhost'
```

Ada 2 solusi:

---

## ✅ **SOLUSI 1: Gunakan SQLite (RECOMMENDED - Paling Mudah)**

SQLite tidak perlu install server terpisah, langsung bisa dipakai!

### 1. Update `prisma/schema.prisma`

Ganti bagian `datasource db`:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

### 2. Update `.env`

```env
DATABASE_URL="file:./dev.db"
```

### 3. Run Migration & Seed

```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Done! Run Server

```bash
npm run dev
```

---

## ✅ **SOLUSI 2: Fix MySQL Password**

### Cara 1: Reset MySQL Root Password (Windows)

1. **Stop MySQL Service**
   ```
   Buka Services (Win + R → services.msc)
   Cari "MySQL" → Klik kanan → Stop
   ```

2. **Start MySQL tanpa password check**
   ```bash
   # Buka CMD as Administrator
   cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
   mysqld --skip-grant-tables
   ```

3. **Buka CMD baru, reset password**
   ```bash
   mysql -u root
   ```
   
   Di MySQL prompt:
   ```sql
   FLUSH PRIVILEGES;
   ALTER USER 'root'@'localhost' IDENTIFIED BY '';
   FLUSH PRIVILEGES;
   EXIT;
   ```

4. **Restart MySQL Service**
   ```
   Services → MySQL → Start
   ```

5. **Update `.env`**
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/sical_ti"
   ```

6. **Test Connection**
   ```bash
   node test-db-connection.js
   ```

### Cara 2: Buat User Baru

```bash
# Login ke MySQL (jika bisa)
mysql -u root -p

# Buat user baru
CREATE USER 'sical'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON *.* TO 'sical'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Update `.env`:
```env
DATABASE_URL="mysql://sical:password123@localhost:3306/sical_ti"
```

### Cara 3: Install XAMPP (Paling Mudah untuk Windows)

1. **Download XAMPP**: https://www.apachefriends.org/
2. **Install & Start MySQL** dari XAMPP Control Panel
3. **Default credentials:**
   - User: `root`
   - Password: (kosong)
4. **Update `.env`:**
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/sical_ti"
   ```

---

## 🚀 **Setelah Database Terkoneksi**

```bash
# 1. Create database
node create-db.js

# 2. Generate Prisma Client
npx prisma generate

# 3. Run migration
npx prisma migrate dev --name init

# 4. Seed data dummy
npm run db:seed

# 5. Run server
npm run dev
```

---

## 🔍 **Cek Status Database**

### Lihat Data dengan Prisma Studio
```bash
npx prisma studio
```

Akan buka browser di `http://localhost:5555` untuk explore database.

### Test Connection
```bash
node test-db-connection.js
```

---

## 📊 **Data yang Akan Dibuat (Seeding)**

Setelah `npm run db:seed`:

### Users (13)
- 1 Kaprodi: `kaprodi@staff.uns.ac.id`
- 1 Admin: `admin@staff.uns.ac.id`
- 2 Dosen: `dosen@staff.uns.ac.id`, `siti@staff.uns.ac.id`
- 10 Mahasiswa: `aditya@student.uns.ac.id`, dll

### Mata Kuliah (4)
1. TI2023 - Sistem Basis Data (3 SKS)
2. TI1014 - Algoritma Pemrograman (4 SKS)
3. TI3055 - Kecerdasan Buatan (3 SKS)
4. TI4012 - Manajemen Proyek (2 SKS)

### Kelas (4)
- Setiap mata kuliah punya 1 kelas
- Total 21 mahasiswa terdaftar (KRS)

### Komponen Nilai
- Kelas Sistem Basis Data:
  - UTS (30%)
  - UAS (40%)
  - Tugas (30%)

### Nilai Mahasiswa
- 8 mahasiswa di kelas Sistem Basis Data sudah punya nilai lengkap

---

## 🐛 **Troubleshooting**

### Error: "Can't reach database server"
- Pastikan MySQL/XAMPP running
- Cek port 3306 tidak dipakai aplikasi lain
- Test: `telnet localhost 3306`

### Error: "Database does not exist"
```bash
node create-db.js
```

### Error: "Prisma Client not generated"
```bash
npx prisma generate
```

### Error: "Migration failed"
```bash
# Reset database
npx prisma migrate reset
npx prisma migrate dev --name init
```

### Ingin mulai dari awal
```bash
# Hapus semua data
npx prisma migrate reset

# Re-seed
npm run db:seed
```

---

## 💡 **Rekomendasi**

Untuk development lokal, saya **sangat merekomendasikan SQLite** karena:
- ✅ Tidak perlu install server terpisah
- ✅ Tidak perlu konfigurasi password
- ✅ File database portable (bisa di-copy)
- ✅ Cukup untuk development & testing
- ✅ Prisma support penuh

Untuk production, baru gunakan MySQL/PostgreSQL.

---

## 📞 **Masih Error?**

Jika masih error, kirim screenshot error message dan saya akan bantu troubleshoot!

**Happy Coding! 🚀**
