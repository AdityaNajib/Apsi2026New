import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseUploadedFile } from '@/lib/parseUpload';

// POST: import nilai dari file Excel/CSV untuk kelas yang diampu dosen
// Form: file (CSV/Excel), kelasId
// Format kolom: nim,<nama_komponen1>,<nama_komponen2>,...
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

    // Load kelas + komponen + mahasiswa
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        komponenNilai: true,
        krs: {
          include: { mahasiswa: true },
        },
      },
    });
    if (!kelas) return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });

    const rows = await parseUploadedFile(file);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'File Excel/CSV kosong atau format tidak valid' }, { status: 400 });
    }

    // Build lookup maps
    const nimToMhsId = new Map<string, string>();
    kelas.krs.forEach((k) => { nimToMhsId.set(k.mahasiswa.nim, k.mahasiswa.id); });

    const namaKomponenToId = new Map<string, string>();
    kelas.komponenNilai.forEach((k) => { namaKomponenToId.set(k.nama.toLowerCase(), k.id); });

    const results: { row: number; status: 'success' | 'error'; message: string; nim?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const nim = row['nim'];
      const rowNum = i + 2;

      if (!nim) {
        results.push({ row: rowNum, status: 'error', message: 'Kolom NIM kosong' });
        continue;
      }

      const mahasiswaId = nimToMhsId.get(nim);
      if (!mahasiswaId) {
        results.push({ row: rowNum, status: 'error', message: `NIM ${nim} tidak ditemukan di kelas ini`, nim });
        continue;
      }

      let savedCount = 0;
      let errorMsg = '';

      for (const [key, val] of Object.entries(row)) {
        if (key === 'nim') continue;
        const komponenId = namaKomponenToId.get(key.toLowerCase());
        if (!komponenId) continue; // skip kolom tidak dikenal

        if (!val || val === '') continue; // skip kosong

        const nilai = parseFloat(val);
        if (isNaN(nilai)) {
          errorMsg = `Nilai "${key}" bukan angka`;
          continue;
        }

        if (nilai < 0 || nilai > 100) {
          errorMsg = `Nilai ${key}=${val} di luar range 0-100`;
          continue;
        }

        try {
          const existing = await prisma.nilaiMahasiswa.findFirst({
            where: { mahasiswaId, komponenId },
          });
          if (existing) {
            await prisma.nilaiMahasiswa.update({
              where: { id: existing.id },
              data: { nilai },
            });
          } else {
            await prisma.nilaiMahasiswa.create({
              data: { mahasiswaId, komponenId, nilai },
            });
          }
          savedCount++;
        } catch {
          errorMsg = `Gagal simpan nilai ${key}`;
        }
      }

      if (savedCount > 0) {
        results.push({
          row: rowNum,
          status: 'success',
          message: `${savedCount} nilai disimpan${errorMsg ? ` (${errorMsg})` : ''}`,
          nim,
        });
      } else {
        results.push({
          row: rowNum,
          status: 'error',
          message: errorMsg || 'Tidak ada nilai valid yang bisa disimpan',
          nim,
        });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return NextResponse.json({
      successCount,
      errorCount,
      results,
      komponenTersedia: kelas.komponenNilai.map((k) => k.nama),
    });
  } catch (error) {
    console.error('Error importing nilai dosen:', error);
    return NextResponse.json({ error: 'Gagal memproses file Excel/CSV' }, { status: 500 });
  }
}
