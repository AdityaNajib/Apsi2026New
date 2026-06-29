import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET komponen nilai by kelasId
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');

    if (!kelasId) {
      return NextResponse.json({ error: 'Missing kelasId' }, { status: 400 });
    }

    const komponenNilai = await prisma.komponenNilai.findMany({
      where: { kelasId },
      orderBy: { nama: 'asc' },
    });

    return NextResponse.json(komponenNilai);
  } catch (error) {
    console.error('Error fetching komponen nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create komponen nilai (Admin can create for any kelas)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kelasId, nama, bobot } = body;

    if (!kelasId || !nama || bobot === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const komponenNilai = await prisma.komponenNilai.create({
      data: {
        kelasId,
        nama,
        bobot: parseFloat(bobot),
      },
    });

    return NextResponse.json(komponenNilai);
  } catch (error) {
    console.error('Error creating komponen nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT update komponen nilai
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nama, bobot } = body;

    if (!id || !nama || bobot === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const komponenNilai = await prisma.komponenNilai.update({
      where: { id },
      data: {
        nama,
        bobot: parseFloat(bobot),
      },
    });

    return NextResponse.json(komponenNilai);
  } catch (error) {
    console.error('Error updating komponen nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE komponen nilai
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Cascade: hapus nilai dan bobot CPMK dulu
    await prisma.nilaiMahasiswa.deleteMany({ where: { komponenId: id } });
    await prisma.bobotCPMK.deleteMany({ where: { komponenId: id } });
    await prisma.komponenNilai.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting komponen nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
