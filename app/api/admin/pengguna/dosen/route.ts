import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET semua dosen
export async function GET() {
  try {
    const dosenList = await prisma.dosen.findMany({
      include: { user: { select: { id: true, name: true, email: true, createdAt: true } } },
      orderBy: { user: { name: 'asc' } },
    });

    return NextResponse.json(dosenList.map((d) => ({
      id: d.id,
      userId: d.userId,
      name: d.user.name,
      email: d.user.email,
      nidn: d.nidn,
      createdAt: d.user.createdAt,
    })));
  } catch (error) {
    console.error('Error fetching dosen:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST tambah dosen baru
export async function POST(request: NextRequest) {
  try {
    const { name, email, nidn } = await request.json();

    if (!name || !email || !nidn) {
      return NextResponse.json({ error: 'name, email, nidn wajib diisi' }, { status: 400 });
    }

    if (!email.endsWith('@staff.uns.ac.id')) {
      return NextResponse.json({ error: 'Email dosen harus menggunakan domain @staff.uns.ac.id' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 409 });

    const existingNidn = await prisma.dosen.findUnique({ where: { nidn } });
    if (existingNidn) return NextResponse.json({ error: 'NIDN sudah digunakan' }, { status: 409 });

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Gunakan transaction agar user & dosen dibuat atomik
    const dosen = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: { name, email, password: hashedPassword, role: 'DOSEN' },
      });
      return tx.dosen.create({ data: { nidn, userId: user.id } });
    });

    return NextResponse.json({ id: dosen.id, name, email, nidn }, { status: 201 });
  } catch (error) {
    console.error('Error creating dosen:', error);
    return NextResponse.json({ error: 'Gagal menambah dosen' }, { status: 500 });
  }
}

// PUT update dosen
export async function PUT(request: NextRequest) {
  try {
    const { dosenId, name, email, nidn } = await request.json();

    if (!dosenId) return NextResponse.json({ error: 'dosenId wajib' }, { status: 400 });

    const dosen = await prisma.dosen.findUnique({ where: { id: dosenId } });
    if (!dosen) return NextResponse.json({ error: 'Dosen tidak ditemukan' }, { status: 404 });

    if (email && !email.endsWith('@staff.uns.ac.id')) {
      return NextResponse.json({ error: 'Email dosen harus menggunakan domain @staff.uns.ac.id' }, { status: 400 });
    }

    if (email) {
      const existing = await prisma.user.findFirst({ where: { email, NOT: { id: dosen.userId } } });
      if (existing) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 409 });
    }

    if (nidn) {
      const existing = await prisma.dosen.findFirst({ where: { nidn, NOT: { id: dosenId } } });
      if (existing) return NextResponse.json({ error: 'NIDN sudah digunakan' }, { status: 409 });
    }

    if (name || email) {
      await prisma.user.update({
        where: { id: dosen.userId },
        data: { ...(name && { name }), ...(email && { email }) },
      });
    }

    if (nidn) {
      await prisma.dosen.update({ where: { id: dosenId }, data: { nidn } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating dosen:', error);
    return NextResponse.json({ error: 'Gagal mengupdate dosen' }, { status: 500 });
  }
}

// DELETE hapus dosen
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dosenId = searchParams.get('dosenId');
    if (!dosenId) return NextResponse.json({ error: 'dosenId wajib' }, { status: 400 });

    const dosen = await prisma.dosen.findUnique({ where: { id: dosenId } });
    if (!dosen) return NextResponse.json({ error: 'Dosen tidak ditemukan' }, { status: 404 });

    await prisma.pengampu.deleteMany({ where: { dosenId } });
    await prisma.dosen.delete({ where: { id: dosenId } });
    await prisma.user.delete({ where: { id: dosen.userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting dosen:', error);
    return NextResponse.json({ error: 'Gagal menghapus dosen' }, { status: 500 });
  }
}
