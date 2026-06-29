-- Add bilingual and audit fields
-- This migration adds deskripsi_en, nama_en, and audit trail fields

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

-- CPL: Add new fields with defaults
CREATE TABLE "new_CPL" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "deskripsi_en" TEXT NOT NULL DEFAULT '',
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_CPL" ("deskripsi", "id", "kode") SELECT "deskripsi", "id", "kode" FROM "CPL";
DROP TABLE "CPL";
ALTER TABLE "new_CPL" RENAME TO "CPL";
CREATE UNIQUE INDEX "CPL_kode_key" ON "CPL"("kode");

-- CPMK: Add new fields with defaults
CREATE TABLE "new_CPMK" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "piId" TEXT NOT NULL,
    "mkId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CPMK_piId_fkey" FOREIGN KEY ("piId") REFERENCES "PI" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CPMK_mkId_fkey" FOREIGN KEY ("mkId") REFERENCES "MataKuliah" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CPMK" ("deskripsi", "id", "kode", "mkId", "piId") SELECT "deskripsi", "id", "kode", "mkId", "piId" FROM "CPMK";
DROP TABLE "CPMK";
ALTER TABLE "new_CPMK" RENAME TO "CPMK";

-- MataKuliah: Add nama_en with default
CREATE TABLE "new_MataKuliah" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nama_en" TEXT NOT NULL DEFAULT '',
    "sks" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL
);
INSERT INTO "new_MataKuliah" ("id", "kode", "nama", "semester", "sks") SELECT "id", "kode", "nama", "semester", "sks" FROM "MataKuliah";
DROP TABLE "MataKuliah";
ALTER TABLE "new_MataKuliah" RENAME TO "MataKuliah";
CREATE UNIQUE INDEX "MataKuliah_kode_key" ON "MataKuliah"("kode");

-- PI: Add new fields with defaults
CREATE TABLE "new_PI" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kode" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "cplId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL DEFAULT 'system',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PI_cplId_fkey" FOREIGN KEY ("cplId") REFERENCES "CPL" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PI" ("cplId", "deskripsi", "id", "kode") SELECT "cplId", "deskripsi", "id", "kode" FROM "PI";
DROP TABLE "PI";
ALTER TABLE "new_PI" RENAME TO "PI";
CREATE UNIQUE INDEX "PI_kode_key" ON "PI"("kode");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
