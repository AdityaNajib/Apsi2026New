import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseUploadedFile } from '@/lib/parseUpload';

/**
 * POST: Import mata kuliah dari CSV
 *
 * Format CSV:
 *   kode, nama, sks, semester, nama_en (optional)
 *
 * - kode     : kode unik MK, huruf kapital (e.g. IE3201)
 * - nama     : nama lengkap mata kuliah (Indonesia)
 * - sks      : jumlah SKS (1-6)
 * - semester : semester di kurikulum (1-8)
 * - nama_en  : nama dalam bahasa Inggris (optional)
 *
 * Perilaku:
 * - Kode baru → INSERT
 * - Kode sudah ada + mode=update → UPDATE nama/sks/semester/nama_en
 * - Kode sudah ada + mode=skip (default) → SKIP dengan keterangan
 *
 * Query param: ?mode=skip|update  (default: skip)
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') ?? 'skip'; // 'skip' | 'update'

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'File Excel/CSV wajib diupload' }, { status: 400 });

    const fname = file.name.toLowerCase();
    if (!fname.endsWith('.csv') && !fname.endsWith('.xlsx') && !fname.endsWith('.xls')) {
      return NextResponse.json({ error: 'Format file tidak didukung. Gunakan .csv, .xlsx, atau .xls' }, { status: 400 });
    }

    const rows = await parseUploadedFile(file);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'File Excel/CSV kosong atau format tidak valid' }, { status: 400 });
    }

    // Preload semua kode MK yang sudah ada
    const existing = await prisma.mataKuliah.findMany({ select: { id: true, kode: true } });
    const existingByKode = new Map(existing.map((m) => [m.kode.toLowerCase(), m.id]));

    const results: {
      row: number;
      status: 'success' | 'updated' | 'skip' | 'error';
      message: string;
      kode?: string;
      nama?: string;
    }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const kode = (row['kode'] || '').trim().toUpperCase();
      const nama = (row['nama'] || '').trim();
      const nama_en = (row['nama_en'] || '').trim();
      const sksRaw = (row['sks'] || '').trim();
      const semesterRaw = (row['semester'] || '').trim();

      // Validasi kelengkapan
      if (!kode || !nama || !sksRaw || !semesterRaw) {
        results.push({ row: rowNum, status: 'error', message: 'Kolom kode / nama / sks / semester tidak lengkap', kode });
        continue;
      }

      const sks = parseInt(sksRaw, 10);
      const semester = parseInt(semesterRaw, 10);

      if (isNaN(sks) || sks < 1 || sks > 6) {
        results.push({ row: rowNum, status: 'error', message: `SKS tidak valid: "${sksRaw}". Harus angka 1-6`, kode });
        continue;
      }

      if (isNaN(semester) || semester < 1 || semester > 8) {
        results.push({ row: rowNum, status: 'error', message: `Semester tidak valid: "${semesterRaw}". Harus angka 1-8`, kode });
        continue;
      }

      const existingId = existingByKode.get(kode.toLowerCase());

      if (existingId) {
        if (mode === 'update') {
          await prisma.mataKuliah.update({
            where: { id: existingId },
            data: { nama, nama_en: nama_en || undefined, sks, semester },
          });
          results.push({ row: rowNum, status: 'updated', message: 'Data diperbarui', kode, nama });
        } else {
          results.push({ row: rowNum, status: 'skip', message: `Kode ${kode} sudah ada, dilewati`, kode, nama });
        }
      } else {
        await prisma.mataKuliah.create({ data: { kode, nama, nama_en: nama_en || undefined, sks, semester } });
        existingByKode.set(kode.toLowerCase(), 'new'); // prevent duplicate in same file
        results.push({ row: rowNum, status: 'success', message: 'Berhasil ditambahkan', kode, nama });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const updatedCount = results.filter((r) => r.status === 'updated').length;
    const skipCount = results.filter((r) => r.status === 'skip').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return NextResponse.json({ successCount, updatedCount, skipCount, errorCount, results });
  } catch (error) {
    console.error('Error importing mata kuliah:', error);
    return NextResponse.json({ error: 'Gagal memproses file Excel/CSV' }, { status: 500 });
  }
}
