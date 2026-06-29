import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseUploadedFile } from '@/lib/parseUpload';

/**
 * POST: Import kelas (beserta dosen pengampu) dari CSV
 *
 * Format CSV:
 *   kode_mk, nama_kelas, tahun_ajaran, semester, nidn_dosen
 *
 * - kode_mk       : kode mata kuliah yang sudah ada (e.g. IE3201)
 * - nama_kelas    : nama/label kelas (e.g. A, B, Reguler)
 * - tahun_ajaran  : e.g. 2026/2027
 * - semester      : Ganjil | Genap
 * - nidn_dosen    : NIDN dosen pengampu (bisa kosong); multiple dosen pisah dengan "|"
 *
 * Baris dengan kode_mk + nama_kelas + tahun_ajaran + semester yang sama
 * akan di-skip (kelas sudah ada) kecuali ada dosen baru yang perlu ditambahkan.
 */
export async function POST(request: NextRequest) {
  try {
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

    // Preload semua mata kuliah dan dosen untuk efisiensi
    const [allMk, allDosen] = await Promise.all([
      prisma.mataKuliah.findMany({ select: { id: true, kode: true, nama: true } }),
      prisma.dosen.findMany({ include: { user: { select: { name: true } } } }),
    ]);

    const mkByKode = new Map(allMk.map((m) => [m.kode.toLowerCase(), m]));
    const dosenByNidn = new Map(allDosen.map((d) => [d.nidn, d]));

    const results: {
      row: number;
      status: 'success' | 'skip' | 'error';
      message: string;
      kelas?: string;
    }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const kodeMk = (row['kode_mk'] || row['kode mk'] || '').trim();
      const namaKelas = (row['nama_kelas'] || row['nama kelas'] || row['kelas'] || '').trim();
      const tahunAjaran = (row['tahun_ajaran'] || row['tahun ajaran'] || '').trim();
      const semester = (row['semester'] || '').trim();
      const nidnRaw = (row['nidn_dosen'] || row['nidn dosen'] || row['nidn'] || '').trim();

      if (!kodeMk || !namaKelas || !tahunAjaran || !semester) {
        results.push({ row: rowNum, status: 'error', message: 'Kolom kode_mk / nama_kelas / tahun_ajaran / semester tidak lengkap' });
        continue;
      }

      if (!['ganjil', 'genap'].includes(semester.toLowerCase())) {
        results.push({ row: rowNum, status: 'error', message: `Semester tidak valid: "${semester}". Harus "Ganjil" atau "Genap"` });
        continue;
      }

      const mk = mkByKode.get(kodeMk.toLowerCase());
      if (!mk) {
        results.push({ row: rowNum, status: 'error', message: `Mata kuliah dengan kode "${kodeMk}" tidak ditemukan` });
        continue;
      }

      // Cek kelas sudah ada
      let kelas = await prisma.kelas.findFirst({
        where: {
          mkId: mk.id,
          nama: namaKelas,
          tahun_ajaran: tahunAjaran,
          semester: semester.charAt(0).toUpperCase() + semester.slice(1).toLowerCase(),
        },
      });

      let created = false;
      if (!kelas) {
        kelas = await prisma.kelas.create({
          data: {
            mkId: mk.id,
            nama: namaKelas,
            tahun_ajaran: tahunAjaran,
            semester: semester.charAt(0).toUpperCase() + semester.slice(1).toLowerCase(),
          },
        });
        created = true;
      }

      // Proses dosen pengampu (bisa multi, pisah "|")
      const nidnList = nidnRaw
        ? nidnRaw.split('|').map((n) => n.trim()).filter(Boolean)
        : [];

      const dosenMessages: string[] = [];

      for (const nidn of nidnList) {
        const dosen = dosenByNidn.get(nidn);
        if (!dosen) {
          dosenMessages.push(`NIDN ${nidn} tidak ditemukan`);
          continue;
        }
        // Cek sudah mengampu
        const alreadyPengampu = await prisma.pengampu.findFirst({
          where: { kelasId: kelas.id, dosenId: dosen.id },
        });
        if (!alreadyPengampu) {
          await prisma.pengampu.create({ data: { kelasId: kelas.id, dosenId: dosen.id } });
          dosenMessages.push(`${dosen.user.name} (${nidn}) ditugaskan`);
        } else {
          dosenMessages.push(`${dosen.user.name} (${nidn}) sudah mengampu`);
        }
      }

      const kelasLabel = `${mk.kode} Kelas ${namaKelas} ${tahunAjaran}`;

      if (!created && nidnList.length === 0) {
        results.push({ row: rowNum, status: 'skip', message: 'Kelas sudah ada, tidak ada perubahan', kelas: kelasLabel });
      } else {
        const detail = [
          created ? 'Kelas dibuat' : 'Kelas sudah ada',
          ...dosenMessages,
        ].join('; ');
        results.push({ row: rowNum, status: 'success', message: detail, kelas: kelasLabel });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const skipCount = results.filter((r) => r.status === 'skip').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return NextResponse.json({ successCount, skipCount, errorCount, results });
  } catch (error) {
    console.error('Error importing kelas:', error);
    return NextResponse.json({ error: 'Gagal memproses file Excel/CSV' }, { status: 500 });
  }
}
