import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isDosenAuthorizedForKelas } from '@/lib/auth-utils';

// GET nilai mahasiswa
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mahasiswaId = searchParams.get('mahasiswaId');
    const komponenId = searchParams.get('komponenId');

    if (!mahasiswaId || !komponenId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // AUTHORIZATION: Verify dosen can access this kelas
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get kelas from komponen
    const komponen = await prisma.komponenNilai.findUnique({
      where: { id: komponenId },
      select: { kelasId: true },
    });

    if (!komponen) {
      return NextResponse.json({ error: 'Komponen not found' }, { status: 404 });
    }

    // Check authorization
    const isAuthorized = await isDosenAuthorizedForKelas(userIdCookie.value, komponen.kelasId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Anda tidak memiliki akses ke kelas ini' }, { status: 403 });
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

    const nilaiNum = parseFloat(nilai);
    if (isNaN(nilaiNum) || nilaiNum < 0 || nilaiNum > 100) {
      return NextResponse.json({ error: 'Nilai harus berupa angka antara 0-100' }, { status: 400 });
    }

    // AUTHORIZATION: Verify dosen can access this kelas
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');
    const userNameCookie = cookieStore.get('name');

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dosenName = userNameCookie?.value || 'Unknown';

    // Get kelas from komponen
    const komponen = await prisma.komponenNilai.findUnique({
      where: { id: komponenId },
      select: { kelasId: true },
    });

    if (!komponen) {
      return NextResponse.json({ error: 'Komponen not found' }, { status: 404 });
    }

    // Check authorization
    const isAuthorized = await isDosenAuthorizedForKelas(userIdCookie.value, komponen.kelasId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Anda tidak memiliki akses untuk mengubah nilai kelas ini' }, { status: 403 });
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
      result = await prisma.nilaiMahasiswa.update({
        where: { id: existingNilai.id },
        data: { 
          nilai: nilaiNum,
          lastUpdatedBy: dosenName,  // Track who updated
        },
      });
    } else {
      result = await prisma.nilaiMahasiswa.create({
        data: { 
          mahasiswaId, 
          komponenId, 
          nilai: nilaiNum,
          lastUpdatedBy: dosenName,  // Track who created
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

    // AUTHORIZATION: Verify dosen can access this kelas
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get kelas from komponen
    const komponen = await prisma.komponenNilai.findUnique({
      where: { id: komponenId },
      select: { kelasId: true },
    });

    if (!komponen) {
      return NextResponse.json({ error: 'Komponen not found' }, { status: 404 });
    }

    // Check authorization
    const isAuthorized = await isDosenAuthorizedForKelas(userIdCookie.value, komponen.kelasId);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Anda tidak memiliki akses untuk menghapus nilai kelas ini' }, { status: 403 });
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
