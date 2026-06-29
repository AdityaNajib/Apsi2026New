import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST assign dosen to kelas
export async function POST(request: NextRequest) {
  try {
    const { kelasId, dosenId } = await request.json();
    if (!kelasId || !dosenId) {
      return NextResponse.json({ error: 'kelasId dan dosenId wajib' }, { status: 400 });
    }

    // Check duplicate
    const existing = await prisma.pengampu.findFirst({ where: { kelasId, dosenId } });
    if (existing) {
      return NextResponse.json({ error: 'Dosen sudah mengampu kelas ini' }, { status: 409 });
    }

    const pengampu = await prisma.pengampu.create({ data: { kelasId, dosenId } });
    return NextResponse.json(pengampu, { status: 201 });
  } catch (error) {
    console.error('Error assigning dosen:', error);
    return NextResponse.json({ error: 'Gagal menambah pengampu' }, { status: 500 });
  }
}

// DELETE remove dosen from kelas
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });

    await prisma.pengampu.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing pengampu:', error);
    return NextResponse.json({ error: 'Gagal menghapus pengampu' }, { status: 500 });
  }
}
