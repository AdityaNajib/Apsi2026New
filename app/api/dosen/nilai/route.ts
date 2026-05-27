import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET nilai mahasiswa
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mahasiswaId = searchParams.get('mahasiswaId');
    const komponenId = searchParams.get('komponenId');

    if (!mahasiswaId || !komponenId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const nilai = await prisma.nilaiMahasiswa.findFirst({
      where: {
        mahasiswaId,
        komponenId,
      },
    });

    return NextResponse.json(nilai);
  } catch (error) {
    console.error('Error fetching nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST/UPDATE nilai mahasiswa
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { mahasiswaId, komponenId, nilai } = body;

    if (!mahasiswaId || !komponenId || nilai === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if nilai already exists
    const existingNilai = await prisma.nilaiMahasiswa.findFirst({
      where: {
        mahasiswaId,
        komponenId,
      },
    });

    let result;
    if (existingNilai) {
      // Update existing nilai
      result = await prisma.nilaiMahasiswa.update({
        where: { id: existingNilai.id },
        data: { nilai: parseFloat(nilai) },
      });
    } else {
      // Create new nilai
      result = await prisma.nilaiMahasiswa.create({
        data: {
          mahasiswaId,
          komponenId,
          nilai: parseFloat(nilai),
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE nilai mahasiswa
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mahasiswaId = searchParams.get('mahasiswaId');
    const komponenId = searchParams.get('komponenId');

    if (!mahasiswaId || !komponenId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const nilai = await prisma.nilaiMahasiswa.findFirst({
      where: {
        mahasiswaId,
        komponenId,
      },
    });

    if (!nilai) {
      return NextResponse.json({ error: 'Nilai not found' }, { status: 404 });
    }

    await prisma.nilaiMahasiswa.delete({
      where: { id: nilai.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
