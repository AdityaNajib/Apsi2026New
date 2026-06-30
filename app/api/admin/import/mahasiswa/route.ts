import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { parseUploadedFile } from '@/lib/parseUpload';

// POST: import mahasiswa from file Excel/CSV
// Format kolom: name,email,nim,angkatan
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'File Excel/CSV wajib diupload' }, { status: 400 });

    const name = file.name.toLowerCase();
    if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      return NextResponse.json({ error: 'Format file tidak didukung. Gunakan .csv, .xlsx, atau .xls' }, { status: 400 });
    }

    const rows = await parseUploadedFile(file);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'File Excel/CSV kosong atau format tidak valid' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash('password123', 10);
    // Validasi angkatan: 5 tahun terakhir + tahun berjalan (dynamic)
    const currentYear = new Date().getFullYear();
    const validAngkatan = [
      String(currentYear - 4),
      String(currentYear - 3),
      String(currentYear - 2),
      String(currentYear - 1),
      String(currentYear),
    ];
    const results: { row: number; status: 'success' | 'error'; message: string; name?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row['name'] || row['nama'];
      const email = row['email'];
      const nim = row['nim'];
      const angkatan = row['angkatan'];
      const rowNum = i + 2;

      if (!name || !email || !nim || !angkatan) {
        results.push({ row: rowNum, status: 'error', message: 'Kolom name/email/nim/angkatan tidak lengkap' });
        continue;
      }
      if (!email.endsWith('@student.uns.ac.id')) {
        results.push({ row: rowNum, status: 'error', message: `Email harus @student.uns.ac.id (ditemukan: ${email})` });
        continue;
      }
      if (!validAngkatan.includes(angkatan)) {
        results.push({ row: rowNum, status: 'error', message: `Angkatan tidak valid: ${angkatan}. Harus: ${validAngkatan.join('/')}` });
        continue;
      }

      try {
        const [existEmail, existNim] = await Promise.all([
          prisma.user.findUnique({ where: { email } }),
          prisma.mahasiswa.findUnique({ where: { nim } }),
        ]);
        if (existEmail) { results.push({ row: rowNum, status: 'error', message: `Email ${email} sudah terdaftar` }); continue; }
        if (existNim) { results.push({ row: rowNum, status: 'error', message: `NIM ${nim} sudah terdaftar` }); continue; }

        // Gunakan transaction agar user & mahasiswa dibuat atomik
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: { name, email, password: hashedPassword, role: 'MAHASISWA' },
          });
          await tx.mahasiswa.create({
            data: { nim, angkatan, status: 'AKTIF', userId: user.id },
          });
        });
        results.push({ row: rowNum, status: 'success', message: 'Berhasil ditambahkan', name });
      } catch (e: any) {
        results.push({ row: rowNum, status: 'error', message: e?.message ?? 'Gagal menyimpan ke database' });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return NextResponse.json({ successCount, errorCount, results });
  } catch (error) {
    console.error('Error importing mahasiswa:', error);
    return NextResponse.json({ error: 'Gagal memproses file Excel/CSV' }, { status: 500 });
  }
}
