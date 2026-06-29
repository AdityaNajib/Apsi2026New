import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Verify caller is KAPRODI
async function verifyKaprodi() {
  const cookieStore = await cookies();
  const role = cookieStore.get('role')?.value;
  return role === 'KAPRODI';
}

// GET all admin users
export async function GET() {
  try {
    if (!(await verifyKaprodi())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const adminList = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, createdAt: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(adminList);
  } catch (error) {
    console.error('Error fetching admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST tambah admin baru
export async function POST(request: NextRequest) {
  try {
    if (!(await verifyKaprodi())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { name, email } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'name dan email wajib diisi' }, { status: 400 });
    }

    if (!email.endsWith('@admin.uns.ac.id')) {
      return NextResponse.json(
        { error: 'Email admin harus menggunakan domain @admin.uns.ac.id' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'ADMIN' },
    });

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json({ error: 'Gagal menambah admin' }, { status: 500 });
  }
}

// PUT update admin (name/email)
export async function PUT(request: NextRequest) {
  try {
    if (!(await verifyKaprodi())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { userId, name, email } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'userId wajib' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    if (email && !email.endsWith('@admin.uns.ac.id')) {
      return NextResponse.json(
        { error: 'Email admin harus menggunakan domain @admin.uns.ac.id' },
        { status: 400 }
      );
    }

    if (email && email !== user.email) {
      const dup = await prisma.user.findUnique({ where: { email } });
      if (dup) return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 409 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { ...(name && { name }), ...(email && { email }) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json({ error: 'Gagal mengupdate admin' }, { status: 500 });
  }
}

// DELETE hapus admin
export async function DELETE(request: NextRequest) {
  try {
    if (!(await verifyKaprodi())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId wajib' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin tidak ditemukan' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting admin:', error);
    return NextResponse.json({ error: 'Gagal menghapus admin' }, { status: 500 });
  }
}
