-- AlterTable: Add team teaching tracking to NilaiMahasiswa
-- This allows tracking which dosen last updated the nilai for team teaching scenarios

-- Add lastUpdatedBy column (nullable, default empty string for existing data)
ALTER TABLE NilaiMahasiswa ADD COLUMN lastUpdatedBy TEXT;

-- Add updatedAt column with default to current timestamp
ALTER TABLE NilaiMahasiswa ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to set updatedAt to current time
UPDATE NilaiMahasiswa SET updatedAt = CURRENT_TIMESTAMP WHERE updatedAt IS NULL;
