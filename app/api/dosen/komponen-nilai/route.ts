import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isDosenAuthorizedForKelas } from '@/lib/auth-utils';

// GET komponen nilai by kelasId
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');

    if (!kelasId) {
      return NextResponse.json({ error: 'Missing kelasId' }, { status: 400 });
    }

    // AUTHORIZATION: Verify dosen can access this kelas
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAuthorized = await isDosenAuthorizedForKelas(userIdCookie.value, kelasId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Anda tidak memiliki akses ke kelas ini' }, { status: 403 });
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

// POST create komponen nilai
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kelasId, nama, bobot } = body;

    if (!kelasId || !nama || bobot === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // AUTHORIZATION: Verify dosen can access this kelas
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAuthorized = await isDosenAuthorizedForKelas(userIdCookie.value, kelasId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Anda tidak memiliki akses untuk menambah komponen nilai kelas ini' }, { status: 403 });
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
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, nama, bobot } = body;

    if (!id || !nama || bobot === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the kelasId from komponen to check authorization
    const komponen = await prisma.komponenNilai.findUnique({
      where: { id },
      select: { kelasId: true },
    });

    if (!komponen) {
      return NextResponse.json({ error: 'Komponen nilai not found' }, { status: 404 });
    }

    // AUTHORIZATION: Verify dosen can access this kelas
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAuthorized = await isDosenAuthorizedForKelas(userIdCookie.value, komponen.kelasId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Anda tidak memiliki akses untuk mengubah komponen nilai kelas ini' }, { status: 403 });
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
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    // Get the kelasId from komponen to check authorization
    const komponen = await prisma.komponenNilai.findUnique({
      where: { id },
      select: { kelasId: true },
    });

    if (!komponen) {
      return NextResponse.json({ error: 'Komponen nilai not found' }, { status: 404 });
    }

    // AUTHORIZATION: Verify dosen can access this kelas
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAuthorized = await isDosenAuthorizedForKelas(userIdCookie.value, komponen.kelasId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Anda tidak memiliki akses untuk menghapus komponen nilai kelas ini' }, { status: 403 });
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
