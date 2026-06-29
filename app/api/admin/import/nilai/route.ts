import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseUploadedFile } from '@/lib/parseUpload';

// POST: import nilai from file Excel/CSV for a specific kelas
// Format kolom: nim,<nama_komponen1>,<nama_komponen2>,...
// Contoh: nim,UTS,UAS,Tugas
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

    // Load kelas data (mahasiswa + komponen)
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
        results.push({ row: rowNum, status: 'error', message: `NIM ${nim} tidak ditemukan di kelas ini` });
        continue;
      }

      let savedCount = 0;
      let skippedCount = 0;
      let errorMsg = '';

      for (const [key, val] of Object.entries(row)) {
        if (key === 'nim') continue;
        const komponenId = namaKomponenToId.get(key.toLowerCase());
        if (!komponenId) {
          // Kolom tidak dikenal, catat sebagai warning
          if (!errorMsg) errorMsg = `Kolom '${key}' tidak ditemukan di komponen nilai`;
          continue;
        }

        // Check if value is empty
        if (!val || val.trim() === '') {
          skippedCount++;
          continue; // skip empty values
        }

        const nilai = parseFloat(val);
        if (isNaN(nilai)) {
          if (!errorMsg) errorMsg = `Nilai '${key}' = '${val}' bukan angka valid`;
          continue;
        }

        if (nilai < 0 || nilai > 100) {
          if (!errorMsg) errorMsg = `Nilai ${key} = ${val} di luar range 0-100`;
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
        } catch (e) {
          errorMsg = `Gagal simpan nilai ${key}`;
        }
      }

      if (savedCount > 0) {
        const msg = `${savedCount} nilai disimpan`;
        const extra: string[] = [];
        if (skippedCount > 0) extra.push(`${skippedCount} kosong`);
        if (errorMsg) extra.push(errorMsg);
        
        results.push({
          row: rowNum,
          status: 'success',
          message: extra.length > 0 ? `${msg} (${extra.join(', ')})` : msg,
          nim,
        });
      } else {
        results.push({
          row: rowNum,
          status: 'error',
          message: errorMsg || (skippedCount > 0 ? `Semua nilai kosong (${skippedCount} kolom)` : 'Tidak ada nilai yang valid'),
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
    console.error('Error importing nilai:', error);
    return NextResponse.json({ error: 'Gagal memproses file Excel/CSV' }, { status: 500 });
  }
}
