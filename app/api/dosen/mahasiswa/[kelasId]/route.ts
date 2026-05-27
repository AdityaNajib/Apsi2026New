import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kelasId: string }> }
) {
  try {
    const { kelasId } = await params;

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
