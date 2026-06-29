import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseUploadedFile } from '@/lib/parseUpload';

/**
 * Extract NIDN from dosen name field
 * Format: "NIDN - Nama Dosen" atau "Kode - Nama Dosen"
 * Contoh: "JUM001 - Jumiyanto Widodo S.Sos. M.Si."
 */
function extractNIDNFromName(namaDosen: string): { nidn: string; namaLengkap: string } | null {
  const match = namaDosen.match(/^([A-Z0-9]+)\s*-\s*(.+)$/);
  if (!match) return null;
  return { nidn: match[1].trim(), namaLengkap: match[2].trim() };
}

/**
 * POST: Import data pengampu dari CSV
 *
 * Format CSV:
 *   kode_mk, nama_mk, nama_dosen, kelas, tahun_ajaran, semester
 *
 * - kode_mk       : kode mata kuliah (e.g. 08033122045)
 * - nama_mk       : nama mata kuliah lengkap dengan SKS (e.g. "Kewirausahaan (2 SKS)")
 * - nama_dosen    : format "NIDN - Nama Dosen" (e.g. "JUM001 - Jumiyanto Widodo S.Sos. M.Si.")
 * - kelas         : nama kelas (e.g. A, B, C)
 * - tahun_ajaran  : tahun ajaran (e.g. 2026/2027) - optional, akan gunakan default jika kosong
 * - semester      : Ganjil atau Genap - optional, akan gunakan default jika kosong
 *
 * Jika tahun_ajaran dan semester tidak ada di CSV, bisa diatur via query param:
 * ?tahun_ajaran=2026/2027&semester=Ganjil
 *
 * Sistem akan:
 * 1. Mencari/membuat mata kuliah berdasarkan kode_mk
 * 2. Mencari/membuat kelas berdasarkan kode_mk + kelas + tahun_ajaran + semester
 * 3. Mencari dosen berdasarkan NIDN dari nama_dosen
 * 4. Membuat relasi pengampu antara dosen dan kelas
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const defaultTahunAjaran = searchParams.get('tahun_ajaran') ?? '2026/2027';
    const defaultSemester = searchParams.get('semester') ?? 'Ganjil';

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'File Excel/CSV wajib diupload' }, { status: 400 });
    }

    const fname = file.name.toLowerCase();
    if (!fname.endsWith('.csv') && !fname.endsWith('.xlsx') && !fname.endsWith('.xls')) {
      return NextResponse.json({ error: 'Format file tidak didukung. Gunakan .csv, .xlsx, atau .xls' }, { status: 400 });
    }

    const rows = await parseUploadedFile(file);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'File Excel/CSV kosong atau format tidak valid' }, { status: 400 });
    }

    // Preload data untuk efisiensi
    const [allMk, allDosen] = await Promise.all([
      prisma.mataKuliah.findMany({ select: { id: true, kode: true, nama: true, sks: true, semester: true } }),
      prisma.dosen.findMany({ include: { user: { select: { name: true } } } }),
    ]);

    const mkByKode = new Map(allMk.map((m) => [m.kode.toLowerCase(), m]));
    const dosenByNidn = new Map(allDosen.map((d) => [d.nidn.toLowerCase(), d]));

    const results: {
      row: number;
      status: 'success' | 'skip' | 'error' | 'warning';
      message: string;
      details?: string;
    }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const kodeMk = (row['kode_mk'] || row['kode mk'] || row['kode'] || '').trim();
      const namaMk = (row['nama_mk'] || row['nama mk'] || row['nama'] || '').trim();
      const namaDosen = (row['nama_dosen'] || row['nama dosen'] || row['dosen'] || '').trim();
      const namaKelas = (row['kelas'] || '').trim();
      const tahunAjaran = (row['tahun_ajaran'] || row['tahun ajaran'] || '').trim() || defaultTahunAjaran;
      const semester = (row['semester'] || '').trim() || defaultSemester;

      // Validasi data wajib
      if (!kodeMk || !namaDosen || !namaKelas) {
        results.push({
          row: rowNum,
          status: 'error',
          message: 'Kolom kode_mk, nama_dosen, dan kelas wajib diisi',
        });
        continue;
      }

      // Validasi semester
      if (!['ganjil', 'genap'].includes(semester.toLowerCase())) {
        results.push({
          row: rowNum,
          status: 'error',
          message: `Semester tidak valid: "${semester}". Harus "Ganjil" atau "Genap"`,
        });
        continue;
      }

      // Extract NIDN dari nama dosen
      const dosenInfo = extractNIDNFromName(namaDosen);
      if (!dosenInfo) {
        results.push({
          row: rowNum,
          status: 'error',
          message: `Format nama dosen tidak valid: "${namaDosen}". Format harus "NIDN - Nama Dosen"`,
        });
        continue;
      }

      // Cari dosen
      const dosen = dosenByNidn.get(dosenInfo.nidn.toLowerCase());
      if (!dosen) {
        results.push({
          row: rowNum,
          status: 'error',
          message: `Dosen dengan NIDN "${dosenInfo.nidn}" tidak ditemukan di database`,
          details: `Nama: ${dosenInfo.namaLengkap}`,
        });
        continue;
      }

      // Cari atau buat mata kuliah
      let mk = mkByKode.get(kodeMk.toLowerCase());
      if (!mk) {
        // Extract SKS dari nama mata kuliah jika ada format "(X SKS)"
        const sksMatch = namaMk.match(/\((\d+)\s*SKS\)/i);
        const sks = sksMatch ? parseInt(sksMatch[1], 10) : 2; // default 2 SKS
        
        // Nama tanpa SKS
        const namaClean = namaMk.replace(/\s*\(\d+\s*SKS\)\s*/i, '').trim();
        
        try {
          mk = await prisma.mataKuliah.create({
            data: {
              kode: kodeMk,
              nama: namaClean || kodeMk,
              sks: sks,
              semester: 1, // default semester 1, bisa diupdate manual
            },
          });
          mkByKode.set(kodeMk.toLowerCase(), mk);
          results.push({
            row: rowNum,
            status: 'warning',
            message: `Mata kuliah baru dibuat: ${kodeMk} - ${namaClean}`,
          });
        } catch (error) {
          results.push({
            row: rowNum,
            status: 'error',
            message: `Gagal membuat mata kuliah: ${kodeMk}`,
          });
          continue;
        }
      }

      // Cari atau buat kelas
      const semesterNormalized = semester.charAt(0).toUpperCase() + semester.slice(1).toLowerCase();
      
      let kelas = await prisma.kelas.findFirst({
        where: {
          mkId: mk.id,
          nama: namaKelas,
          tahun_ajaran: tahunAjaran,
          semester: semesterNormalized,
        },
      });

      let kelasCreated = false;
      if (!kelas) {
        try {
          kelas = await prisma.kelas.create({
            data: {
              mkId: mk.id,
              nama: namaKelas,
              tahun_ajaran: tahunAjaran,
              semester: semesterNormalized,
            },
          });
          kelasCreated = true;
        } catch (error) {
          results.push({
            row: rowNum,
            status: 'error',
            message: `Gagal membuat kelas: ${kodeMk} kelas ${namaKelas}`,
          });
          continue;
        }
      }

      // Cek apakah pengampu sudah ada
      const existingPengampu = await prisma.pengampu.findFirst({
        where: {
          kelasId: kelas.id,
          dosenId: dosen.id,
        },
      });

      if (existingPengampu) {
        results.push({
          row: rowNum,
          status: 'skip',
          message: `${dosen.user.name} sudah mengampu ${mk.kode} kelas ${namaKelas}`,
        });
      } else {
        try {
          await prisma.pengampu.create({
            data: {
              kelasId: kelas.id,
              dosenId: dosen.id,
            },
          });

          const details = [
            kelasCreated ? 'Kelas dibuat' : 'Kelas sudah ada',
            `Dosen: ${dosen.user.name} (${dosenInfo.nidn})`,
            `MK: ${mk.kode} - ${mk.nama}`,
            `Kelas: ${namaKelas}`,
            `TA: ${tahunAjaran} ${semesterNormalized}`,
          ];

          results.push({
            row: rowNum,
            status: 'success',
            message: `Pengampu berhasil ditambahkan`,
            details: details.join(' | '),
          });
        } catch (error) {
          results.push({
            row: rowNum,
            status: 'error',
            message: `Gagal menambahkan pengampu`,
          });
        }
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const skipCount = results.filter((r) => r.status === 'skip').length;
    const warningCount = results.filter((r) => r.status === 'warning').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return NextResponse.json({
      successCount,
      skipCount,
      warningCount,
      errorCount,
      results,
      summary: {
        total: rows.length,
        processed: successCount + skipCount + warningCount,
        failed: errorCount,
      },
    });
  } catch (error) {
    console.error('Error importing pengampu:', error);
    return NextResponse.json(
      { error: 'Gagal memproses file Excel/CSV', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
