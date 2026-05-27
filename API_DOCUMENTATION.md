# 📡 API Documentation - Dashboard Dosen

## Base URL
```
http://localhost:3000/api/dosen
```

---

## 🔐 Authentication
Semua endpoint menggunakan **cookie-based authentication**:
- Cookie `userId` harus ada
- Cookie `role` harus `DOSEN`

---

## 📚 Endpoints

### 1. Get Mata Kuliah Diampu

**GET** `/api/dosen/mata-kuliah`

Mendapatkan daftar mata kuliah yang diampu oleh dosen yang sedang login.

#### Request
```http
GET /api/dosen/mata-kuliah HTTP/1.1
Cookie: userId=dosen-001; role=DOSEN
```

#### Response Success (200)
```json
[
  {
    "kelasId": "cls_123",
    "kode": "TI2023",
    "nama": "Sistem Basis Data",
    "namaKelas": "A",
    "sks": 3,
    "semester": 3,
    "tahunAjaran": "2026/2027",
    "semesterKelas": "Ganjil",
    "jumlahMahasiswa": 40,
    "komponenNilai": [
      {
        "id": "komp_1",
        "nama": "UTS",
        "bobot": 30
      },
      {
        "id": "komp_2",
        "nama": "UAS",
        "bobot": 40
      }
    ]
  }
]
```

#### Response Error (401)
```json
{
  "error": "Unauthorized"
}
```

---

### 2. Get Mahasiswa by Kelas

**GET** `/api/dosen/mahasiswa/[kelasId]`

Mendapatkan daftar mahasiswa yang terdaftar di kelas tertentu.

#### Request
```http
GET /api/dosen/mahasiswa/cls_123 HTTP/1.1
```

#### Response Success (200)
```json
{
  "mahasiswa": [
    {
      "id": "mhs_1",
      "nim": "I0323001",
      "nama": "Aditya Pratama",
      "angkatan": "2023",
      "status": "AKTIF"
    }
  ],
  "komponenNilai": [
    {
      "id": "komp_1",
      "nama": "UTS",
      "bobot": 30,
      "nilaiMahasiswa": []
    }
  ]
}
```

---

### 3. Get Nilai Mahasiswa

**GET** `/api/dosen/nilai?mahasiswaId={id}&komponenId={id}`

Mendapatkan nilai mahasiswa untuk komponen tertentu.

#### Request
```http
GET /api/dosen/nilai?mahasiswaId=mhs_1&komponenId=komp_1 HTTP/1.1
```

#### Response Success (200)
```json
{
  "id": "nilai_1",
  "mahasiswaId": "mhs_1",
  "komponenId": "komp_1",
  "nilai": 85
}
```

#### Response Not Found (200)
```json
null
```

---

### 4. Create/Update Nilai Mahasiswa

**POST** `/api/dosen/nilai`

Membuat atau mengupdate nilai mahasiswa.

#### Request
```http
POST /api/dosen/nilai HTTP/1.1
Content-Type: application/json

{
  "mahasiswaId": "mhs_1",
  "komponenId": "komp_1",
  "nilai": 85
}
```

#### Response Success (200)
```json
{
  "id": "nilai_1",
  "mahasiswaId": "mhs_1",
  "komponenId": "komp_1",
  "nilai": 85
}
```

#### Response Error (400)
```json
{
  "error": "Missing required fields"
}
```

---

### 5. Delete Nilai Mahasiswa

**DELETE** `/api/dosen/nilai?mahasiswaId={id}&komponenId={id}`

Menghapus nilai mahasiswa.

#### Request
```http
DELETE /api/dosen/nilai?mahasiswaId=mhs_1&komponenId=komp_1 HTTP/1.1
```

#### Response Success (200)
```json
{
  "success": true
}
```

---

### 6. Get Komponen Nilai by Kelas

**GET** `/api/dosen/komponen-nilai?kelasId={id}`

Mendapatkan daftar komponen nilai untuk kelas tertentu.

#### Request
```http
GET /api/dosen/komponen-nilai?kelasId=cls_123 HTTP/1.1
```

#### Response Success (200)
```json
[
  {
    "id": "komp_1",
    "nama": "UTS",
    "bobot": 30,
    "kelasId": "cls_123"
  },
  {
    "id": "komp_2",
    "nama": "UAS",
    "bobot": 40,
    "kelasId": "cls_123"
  }
]
```

---

### 7. Create Komponen Nilai

**POST** `/api/dosen/komponen-nilai`

Membuat komponen nilai baru.

#### Request
```http
POST /api/dosen/komponen-nilai HTTP/1.1
Content-Type: application/json

{
  "kelasId": "cls_123",
  "nama": "UTS",
  "bobot": 30
}
```

#### Response Success (200)
```json
{
  "id": "komp_1",
  "nama": "UTS",
  "bobot": 30,
  "kelasId": "cls_123"
}
```

---

### 8. Update Komponen Nilai

**PUT** `/api/dosen/komponen-nilai`

Mengupdate komponen nilai.

#### Request
```http
PUT /api/dosen/komponen-nilai HTTP/1.1
Content-Type: application/json

{
  "id": "komp_1",
  "nama": "UTS",
  "bobot": 35
}
```

#### Response Success (200)
```json
{
  "id": "komp_1",
  "nama": "UTS",
  "bobot": 35,
  "kelasId": "cls_123"
}
```

---

### 9. Delete Komponen Nilai

**DELETE** `/api/dosen/komponen-nilai?id={id}`

Menghapus komponen nilai.

#### Request
```http
DELETE /api/dosen/komponen-nilai?id=komp_1 HTTP/1.1
```

#### Response Success (200)
```json
{
  "success": true
}
```

---

### 10. Get Rekap Nilai by Kelas

**GET** `/api/dosen/rekap/[kelasId]`

Mendapatkan rekap nilai mahasiswa untuk kelas tertentu.

#### Request
```http
GET /api/dosen/rekap/cls_123 HTTP/1.1
```

#### Response Success (200)
```json
{
  "kelas": {
    "id": "cls_123",
    "nama": "A",
    "mataKuliah": "Sistem Basis Data",
    "kode": "TI2023",
    "tahunAjaran": "2026/2027",
    "semester": "Ganjil"
  },
  "komponenNilai": [
    {
      "id": "komp_1",
      "nama": "UTS",
      "bobot": 30
    },
    {
      "id": "komp_2",
      "nama": "UAS",
      "bobot": 40
    },
    {
      "id": "komp_3",
      "nama": "Tugas",
      "bobot": 30
    }
  ],
  "rekap": [
    {
      "mahasiswaId": "mhs_1",
      "nim": "I0323001",
      "nama": "Aditya Pratama",
      "angkatan": "2023",
      "nilaiKomponen": [
        {
          "komponenId": "komp_1",
          "komponenNama": "UTS",
          "nilai": 75
        },
        {
          "komponenId": "komp_2",
          "komponenNama": "UAS",
          "nilai": 80
        },
        {
          "komponenId": "komp_3",
          "komponenNama": "Tugas",
          "nilai": 85
        }
      ],
      "nilaiAkhir": 80.5,
      "nilaiHuruf": "A-"
    }
  ]
}
```

---

## 📊 Konversi Nilai Huruf

Rumus yang digunakan di endpoint rekap:

```javascript
function getNilaiHuruf(nilai: number): string {
  if (nilai >= 85) return 'A';
  if (nilai >= 80) return 'A-';
  if (nilai >= 75) return 'B+';
  if (nilai >= 70) return 'B';
  if (nilai >= 65) return 'B-';
  if (nilai >= 60) return 'C+';
  if (nilai >= 55) return 'C';
  if (nilai >= 50) return 'C-';
  if (nilai >= 45) return 'D';
  return 'E';
}
```

---

## 🧮 Perhitungan Nilai Akhir

Nilai akhir dihitung dengan **weighted average**:

```
Nilai Akhir = Σ (Nilai Komponen × Bobot Komponen / 100)
```

**Contoh:**
- UTS: 75 (bobot 30%)
- UAS: 80 (bobot 40%)
- Tugas: 85 (bobot 30%)

```
Nilai Akhir = (75 × 0.3) + (80 × 0.4) + (85 × 0.3)
            = 22.5 + 32 + 25.5
            = 80
```

---

## 🔒 Error Codes

| Code | Message                  | Deskripsi                          |
|------|--------------------------|-------------------------------------|
| 400  | Missing required fields  | Parameter request tidak lengkap     |
| 400  | Missing parameters       | Query parameter tidak ada           |
| 401  | Unauthorized             | Cookie userId tidak ada             |
| 404  | Not found                | Resource tidak ditemukan            |
| 500  | Internal server error    | Error server                        |

---

## 🧪 Testing dengan cURL

### Get Mata Kuliah
```bash
curl -X GET http://localhost:3000/api/dosen/mata-kuliah \
  -H "Cookie: userId=dosen-001; role=DOSEN"
```

### Create Komponen Nilai
```bash
curl -X POST http://localhost:3000/api/dosen/komponen-nilai \
  -H "Content-Type: application/json" \
  -d '{
    "kelasId": "cls_123",
    "nama": "UTS",
    "bobot": 30
  }'
```

### Input Nilai
```bash
curl -X POST http://localhost:3000/api/dosen/nilai \
  -H "Content-Type: application/json" \
  -d '{
    "mahasiswaId": "mhs_1",
    "komponenId": "komp_1",
    "nilai": 85
  }'
```

### Get Rekap
```bash
curl -X GET http://localhost:3000/api/dosen/rekap/cls_123
```

---

## 🔄 Flow Diagram

```
┌─────────────┐
│   Login     │
│   Dosen     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│ GET /api/dosen/mata-kuliah          │
│ → List mata kuliah yang diampu      │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ GET /api/dosen/mahasiswa/[kelasId]  │
│ → List mahasiswa di kelas           │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ POST /api/dosen/komponen-nilai      │
│ → Buat komponen (UTS, UAS, Tugas)   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ POST /api/dosen/nilai               │
│ → Input nilai mahasiswa             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│ GET /api/dosen/rekap/[kelasId]      │
│ → Lihat rekap & statistik           │
└─────────────────────────────────────┘
```

---

## 📝 Notes

1. **Cookie Authentication**: Semua request harus include cookie `userId` dan `role`
2. **Bobot Validation**: Frontend melakukan validasi total bobot = 100%
3. **Nilai Range**: Nilai harus 0-100
4. **Cascade Delete**: Menghapus komponen nilai akan menghapus semua nilai mahasiswa terkait
5. **Auto-calculate**: Nilai akhir dihitung otomatis di backend

---

## 🚀 Postman Collection

Import collection ini ke Postman untuk testing:

```json
{
  "info": {
    "name": "SICAL-TI Dosen API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get Mata Kuliah",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/dosen/mata-kuliah"
      }
    },
    {
      "name": "Create Komponen Nilai",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/api/dosen/komponen-nilai",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"kelasId\": \"cls_123\",\n  \"nama\": \"UTS\",\n  \"bobot\": 30\n}"
        }
      }
    }
  ]
}
```

---

**Happy Coding! 🎉**
