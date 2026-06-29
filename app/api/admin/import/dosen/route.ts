import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { parseUploadedFile } from '@/lib/parseUpload';

// POST: import dosen from file Excel/CSV
// Format kolom: name,email,nidn
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
    const results: { row: number; status: 'success' | 'error'; message: string; name?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const name = row['name'] || row['nama'];
      const email = row['email'];
      const nidn = row['nidn'];
      const rowNum = i + 2;

      if (!name || !email || !nidn) {
        results.push({ row: rowNum, status: 'error', message: `Kolom name/email/nidn tidak lengkap (name="${name}", email="${email}", nidn="${nidn}")` });
        continue;
      }
      if (!email.endsWith('@staff.uns.ac.id')) {
        results.push({ row: rowNum, status: 'error', message: `Email harus @staff.uns.ac.id (ditemukan: ${email})` });
        continue;
      }

      try {
        const [existEmail, existNidn] = await Promise.all([
          prisma.user.findUnique({ where: { email } }),
          prisma.dosen.findUnique({ where: { nidn } }),
        ]);
        if (existEmail) { results.push({ row: rowNum, status: 'error', message: `Email ${email} sudah terdaftar` }); continue; }
        if (existNidn) { results.push({ row: rowNum, status: 'error', message: `NIDN ${nidn} sudah terdaftar` }); continue; }

        // Gunakan transaction agar user & dosen dibuat atomik
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: { name, email, password: hashedPassword, role: 'DOSEN' },
          });
          await tx.dosen.create({ data: { nidn, userId: user.id } });
        });

        results.push({ row: rowNum, status: 'success', message: 'Berhasil ditambahkan', name });
      } catch (e: any) {
        console.error('Row error:', e);
        const msg = e?.message?.includes('nip') ? 'Schema masih ada kolom nip — jalankan: npx prisma migrate reset --force'
          : e?.message?.includes('Unique constraint') ? 'Data duplikat (email/NIDN)'
          : e?.message ?? 'Gagal menyimpan ke database';
        results.push({ row: rowNum, status: 'error', message: msg });
      }
    }

    const successCount = results.filter((r) => r.status === 'success').length;
    const errorCount = results.filter((r) => r.status === 'error').length;

    return NextResponse.json({ successCount, errorCount, results });
  } catch (error) {
    console.error('Error importing dosen:', error);
    return NextResponse.json({ error: 'Gagal memproses file Excel/CSV' }, { status: 500 });
  }
}
