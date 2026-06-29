import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { isDosenAuthorizedForKelas } from '@/lib/auth-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kelasId: string }> }
) {
  try {
    const { kelasId } = await params;

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

    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        krs: {
          include: {
            mahasiswa: {
              include: {
                user: true,
              },
            },
          },
        },
        komponenNilai: {
          include: {
            nilaiMahasiswa: true,
          },
        },
      },
    });

    if (!kelas) {
      return NextResponse.json({ error: 'Kelas not found' }, { status: 404 });
    }

    const mahasiswa = kelas.krs.map((krs) => ({
      id: krs.mahasiswa.id,
      nim: krs.mahasiswa.nim,
      nama: krs.mahasiswa.user.name,
      angkatan: krs.mahasiswa.angkatan,
      status: krs.mahasiswa.status,
    }));

    return NextResponse.json({
      mahasiswa,
      komponenNilai: kelas.komponenNilai,
    });
  } catch (error) {
    console.error('Error fetching mahasiswa:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
