import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET semua mata kuliah
export async function GET() {
  try {
    const mk = await prisma.mataKuliah.findMany({
      include: {
        _count: { select: { kelas: true, cpmk: true } },
      },
      orderBy: [{ semester: 'asc' }, { kode: 'asc' }],
    });
    return NextResponse.json(mk);
  } catch (error) {
    console.error('Error fetching mata kuliah:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST tambah mata kuliah baru
export async function POST(request: NextRequest) {
  try {
    const { kode, nama, nama_en, sks, semester } = await request.json();

    if (!kode || !nama || !sks || !semester) {
      return NextResponse.json({ error: 'kode, nama, sks, semester wajib diisi' }, { status: 400 });
    }

    const existing = await prisma.mataKuliah.findUnique({ where: { kode } });
    if (existing) {
      return NextResponse.json({ error: `Kode ${kode} sudah digunakan` }, { status: 409 });
    }

    const mk = await prisma.mataKuliah.create({
      data: { 
        kode, 
        nama, 
        nama_en: nama_en || undefined,
        sks: Number(sks), 
        semester: Number(semester) 
      },
    });

    return NextResponse.json(mk, { status: 201 });
  } catch (error) {
    console.error('Error creating mata kuliah:', error);
    return NextResponse.json({ error: 'Gagal menambah mata kuliah' }, { status: 500 });
  }
}

// PUT update mata kuliah
export async function PUT(request: NextRequest) {
  try {
    const { id, kode, nama, nama_en, sks, semester } = await request.json();
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });

    // Cek duplikat kode (kecuali diri sendiri)
    if (kode) {
      const existing = await prisma.mataKuliah.findFirst({ where: { kode, NOT: { id } } });
      if (existing) return NextResponse.json({ error: `Kode ${kode} sudah digunakan` }, { status: 409 });
    }

    const mk = await prisma.mataKuliah.update({
      where: { id },
      data: {
        ...(kode && { kode }),
        ...(nama && { nama }),
        ...(nama_en !== undefined && { nama_en: nama_en || undefined }),
        ...(sks && { sks: Number(sks) }),
        ...(semester && { semester: Number(semester) }),
      },
    });

    return NextResponse.json(mk);
  } catch (error) {
    console.error('Error updating mata kuliah:', error);
    return NextResponse.json({ error: 'Gagal mengupdate mata kuliah' }, { status: 500 });
  }
}

// DELETE mata kuliah
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });

    // Cek apakah ada kelas yang menggunakan MK ini
    const kelasCount = await prisma.kelas.count({ where: { mkId: id } });
    if (kelasCount > 0) {
      return NextResponse.json({
        error: `Tidak bisa dihapus — ada ${kelasCount} kelas yang menggunakan mata kuliah ini. Hapus kelas terlebih dahulu.`
      }, { status: 409 });
    }

    await prisma.cPMK.deleteMany({ where: { mkId: id } });
    await prisma.mataKuliah.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mata kuliah:', error);
    return NextResponse.json({ error: 'Gagal menghapus mata kuliah' }, { status: 500 });
  }
}
