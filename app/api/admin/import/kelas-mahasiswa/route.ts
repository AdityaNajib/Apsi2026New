import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseUploadedFile } from '@/lib/parseUpload';

/**
 * POST: Enroll mahasiswa ke kelas via CSV
 * Form: file (CSV), kelasId
 *
 * Format CSV:
 *   nim
 *   I0323001
 *   I0323002
 *
 * Hanya kolom "nim" yang dibutuhkan.
 * Mahasiswa yang sudah terdaftar di kelas tersebut akan di-skip.
 * Mahasiswa yang tidak terdaftar di sistem akan dilaporkan error.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const kelasId = formData.get('kelasId') as string | null;

    if (!file) return NextResponse.json({ error: 'File Excel/CSV wajib diupload' }, { status: 400 });
    if (!kelasId) return NextResponse.json({ error: 'kelasId wajib' }, { status: 400 });

    const fname = file.name.toLowerCase();
    if (!fname.endsWith('.csv') && !fname.endsWith('.xlsx') && !fname.endsWith('.xls')) {
      return NextResponse.json({ error: 'Format file tidak didukung. Gunakan .csv, .xlsx, atau .xls' }, { status: 400 });
    }

    // Pastikan kelas ada
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: { mataKuliah: true },
    });
    if (!kelas) return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });

    const rows = await parseUploadedFile(file);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'File Excel/CSV kosong atau format tidak valid' }, { status: 400 });
    }

    // Mahasiswa yang sudah terdaftar di kelas ini
    const existingKrs = await prisma.kRS.findMany({
      where: { kelasId },
      select: { mahasiswaId: true },
    });
    const enrolledIds = new Set(existingKrs.map((k) => k.mahasiswaId));

    const results: {
      row: number;
      status: 'success' | 'skip' | 'error';
      message: string;
      nim?: string;
    }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nim = (row['nim'] || '').trim();
      const rowNum = i + 2;

      if (!nim) {
        results.push({ row: rowNum, status: 'error', message: 'Kolom NIM kosong' });
        continue;
      }

      const mahasiswa = await prisma.mahasiswa.findUnique({
        where: { nim },
        select: { id: true, nim: true },
      });

      if (!mahasiswa) {
        results.push({ row: rowNum, status: 'error', message: `NIM ${nim} tidak ditemukan di sistem`, nim });
        continue;
      }

      if (enrolledIds.has(mahasiswa.id)) {
        results.push({ row: rowNum, status: 'skip', message: `NIM ${nim} sudah terdaftar di kelas ini`, nim });
        continue;
      }

      try {
        await prisma.kRS.create({ data: { kelasId, mahasiswaId: mahasiswa.id } });
        enrolledIds.add(mahasiswa.id); // prevent duplicate in same file
        results.push({ row: rowNum, status: 'success', message: 'Berhasil didaftarkan', nim });
      } catch (e) {
        results.push({ row: rowNum, status: 'error', message: 'Gagal mendaftarkan ke database', nim });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const skipCount = results.filter((r) => r.status === 'skip').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return NextResponse.json({
      successCount,
      skipCount,
      errorCount,
      results,
      kelasInfo: {
        nama: kelas.nama,
        mataKuliah: kelas.mataKuliah.nama,
        kode: kelas.mataKuliah.kode,
      },
    });
  } catch (error) {
    console.error('Error importing mahasiswa ke kelas:', error);
    return NextResponse.json({ error: 'Gagal memproses file Excel/CSV' }, { status: 500 });
  }
}
