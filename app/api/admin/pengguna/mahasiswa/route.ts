import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET semua mahasiswa, bisa filter by angkatan
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const angkatan = searchParams.get('angkatan');

    const mhsList = await prisma.mahasiswa.findMany({
      where: angkatan && angkatan !== 'all' ? { angkatan } : undefined,
      include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
      orderBy: [{ angkatan: 'desc' }, { nim: 'asc' }],
    });

    return NextResponse.json(mhsList.map((m) => ({
      id: m.id,
      userId: m.userId,
      name: m.user.name,
      email: m.user.email,
      nim: m.nim,
      angkatan: m.angkatan,
      status: m.status,
      createdAt: m.user.createdAt,
    })));
  } catch (error) {
    console.error('Error fetching mahasiswa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST tambah mahasiswa baru
export async function POST(request: NextRequest) {
  try {
    const { name, email, nim, angkatan } = await request.json();

    if (!name || !email || !nim || !angkatan) {
      return NextResponse.json({ error: 'name, email, nim, angkatan wajib diisi' }, { status: 400 });
    }

    // Validasi domain email
    if (!email.endsWith('@student.uns.ac.id')) {
      return NextResponse.json({ error: 'Email mahasiswa harus menggunakan domain @student.uns.ac.id' }, { status: 400 });
    }

    // Validasi angkatan: 5 tahun terakhir + tahun berjalan (dynamic)
    const currentYear = new Date().getFullYear();
    const validAngkatan = [
      String(currentYear - 4),
      String(currentYear - 3),
      String(currentYear - 2),
      String(currentYear - 1),
      String(currentYear),
    ];
    if (!validAngkatan.includes(angkatan)) {
      return NextResponse.json({ error: `Angkatan tidak valid. Harus antara ${validAngkatan[0]} - ${validAngkatan[4]}` }, { status: 400 });
    }

    // Cek duplikat email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 409 });

    // Cek duplikat NIM
    const existingNim = await prisma.mahasiswa.findUnique({ where: { nim } });
    if (existingNim) return NextResponse.json({ error: 'NIM sudah digunakan' }, { status: 409 });

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Gunakan transaction agar user & mahasiswa dibuat atomik
    const mhs = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, password: hashedPassword, role: 'MAHASISWA' },
      });
      return tx.mahasiswa.create({
        data: { nim, angkatan, status: 'AKTIF', userId: user.id },
      });
    });

    return NextResponse.json({ id: mhs.id, name, email, nim, angkatan }, { status: 201 });
  } catch (error) {
    console.error('Error creating mahasiswa:', error);
    return NextResponse.json({ error: 'Gagal menambah mahasiswa' }, { status: 500 });
  }
}

// PUT update mahasiswa
export async function PUT(request: NextRequest) {
  try {
    const { mahasiswaId, name, email, nim, angkatan, status } = await request.json();

    if (!mahasiswaId) return NextResponse.json({ error: 'mahasiswaId wajib' }, { status: 400 });

    const mhs = await prisma.mahasiswa.findUnique({ where: { id: mahasiswaId } });
    if (!mhs) return NextResponse.json({ error: 'Mahasiswa tidak ditemukan' }, { status: 404 });

    if (email && !email.endsWith('@student.uns.ac.id')) {
      return NextResponse.json({ error: 'Email harus @student.uns.ac.id' }, { status: 400 });
    }

    // Cek duplikat email
    if (email) {
      const existing = await prisma.user.findFirst({ where: { email, NOT: { id: mhs.userId } } });
      if (existing) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 409 });
    }

    // Cek duplikat NIM
    if (nim) {
      const existing = await prisma.mahasiswa.findFirst({ where: { nim, NOT: { id: mahasiswaId } } });
      if (existing) return NextResponse.json({ error: 'NIM sudah digunakan' }, { status: 409 });
    }

    if (name || email) {
      await prisma.user.update({
        where: { id: mhs.userId },
        data: { ...(name && { name }), ...(email && { email }) },
      });
    }

    if (nim || angkatan || status) {
      await prisma.mahasiswa.update({
        where: { id: mahasiswaId },
        data: { ...(nim && { nim }), ...(angkatan && { angkatan }), ...(status && { status }) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating mahasiswa:', error);
    return NextResponse.json({ error: 'Gagal mengupdate mahasiswa' }, { status: 500 });
  }
}

// DELETE hapus mahasiswa
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mahasiswaId = searchParams.get('mahasiswaId');
    if (!mahasiswaId) return NextResponse.json({ error: 'mahasiswaId wajib' }, { status: 400 });

    const mhs = await prisma.mahasiswa.findUnique({ where: { id: mahasiswaId } });
    if (!mhs) return NextResponse.json({ error: 'Mahasiswa tidak ditemukan' }, { status: 404 });

    // Cascade delete
    await prisma.nilaiMahasiswa.deleteMany({ where: { mahasiswaId } });
    await prisma.kRS.deleteMany({ where: { mahasiswaId } });
    await prisma.mahasiswa.delete({ where: { id: mahasiswaId } });
    await prisma.user.delete({ where: { id: mhs.userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mahasiswa:', error);
    return NextResponse.json({ error: 'Gagal menghapus mahasiswa' }, { status: 500 });
  }
}
