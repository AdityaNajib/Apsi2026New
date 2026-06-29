-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Mahasiswa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nim" TEXT NOT NULL,
    "angkatan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "userId" TEXT NOT NULL,
    CONSTRAINT "Mahasiswa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Dosen" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nidn" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Dosen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MataKuliah" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Kelas" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "tahun_ajaran" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "mkId" TEXT NOT NULL,
    CONSTRAINT "Kelas_mkId_fkey" FOREIGN KEY ("mkId") REFERENCES "MataKuliah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Pengampu" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kelasId" TEXT NOT NULL,
    "dosenId" TEXT NOT NULL,
    CONSTRAINT "Pengampu_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Pengampu_dosenId_fkey" FOREIGN KEY ("dosenId") REFERENCES "Dosen" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CPL" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "PI" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "cplId" TEXT NOT NULL,
    CONSTRAINT "PI_cplId_fkey" FOREIGN KEY ("cplId") REFERENCES "CPL" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CPMK" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "piId" TEXT NOT NULL,
    "mkId" TEXT NOT NULL,
    CONSTRAINT "CPMK_piId_fkey" FOREIGN KEY ("piId") REFERENCES "PI" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CPMK_mkId_fkey" FOREIGN KEY ("mkId") REFERENCES "MataKuliah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KomponenNilai" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nama" TEXT NOT NULL,
    "bobot" REAL NOT NULL,
    "kelasId" TEXT NOT NULL,
    CONSTRAINT "KomponenNilai_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BobotCPMK" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "komponenId" TEXT NOT NULL,
    "cpmkId" TEXT NOT NULL,
    "bobot" REAL NOT NULL,
    CONSTRAINT "BobotCPMK_komponenId_fkey" FOREIGN KEY ("komponenId") REFERENCES "KomponenNilai" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BobotCPMK_cpmkId_fkey" FOREIGN KEY ("cpmkId") REFERENCES "CPMK" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NilaiMahasiswa" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mahasiswaId" TEXT NOT NULL,
    "komponenId" TEXT NOT NULL,
    "nilai" REAL NOT NULL,
    CONSTRAINT "NilaiMahasiswa_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "Mahasiswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "NilaiMahasiswa_komponenId_fkey" FOREIGN KEY ("komponenId") REFERENCES "KomponenNilai" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "KRS" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mahasiswaId" TEXT NOT NULL,
    "kelasId" TEXT NOT NULL,
    CONSTRAINT "KRS_mahasiswaId_fkey" FOREIGN KEY ("mahasiswaId") REFERENCES "Mahasiswa" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "KRS_kelasId_fkey" FOREIGN KEY ("kelasId") REFERENCES "Kelas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Mahasiswa_nim_key" ON "Mahasiswa"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "Mahasiswa_userId_key" ON "Mahasiswa"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_nidn_key" ON "Dosen"("nidn");

-- CreateIndex
CREATE UNIQUE INDEX "Dosen_userId_key" ON "Dosen"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MataKuliah_kode_key" ON "MataKuliah"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "CPL_kode_key" ON "CPL"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "PI_kode_key" ON "PI"("kode");
