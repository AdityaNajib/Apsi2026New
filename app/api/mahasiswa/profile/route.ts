import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        mahasiswa: {
          include: {
            krs: {
              include: {
                kelas: {
                  include: { mataKuliah: true },
                },
              },
            },
            nilaiMahasiswa: true,
          },
        },
      },
    });

    if (!user || !user.mahasiswa) {
      return NextResponse.json({ error: 'Mahasiswa not found' }, { status: 404 });
    }

    const mhs = user.mahasiswa;

    // Calculate IPK from all nilai
    const allNilai = mhs.nilaiMahasiswa.map((n) => n.nilai);
    const avgNilai = allNilai.length > 0 ? allNilai.reduce((a, b) => a + b, 0) / allNilai.length : 0;
    const ipk = ((avgNilai / 100) * 4).toFixed(2);

    const semesterAktif = mhs.krs.length > 0
      ? Math.max(...mhs.krs.map((k) => k.kelas.mataKuliah.semester))
      : 1;

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      nim: mhs.nim,
      angkatan: mhs.angkatan,
      status: mhs.status,
      semester: semesterAktif,
      ipk,
      jumlahMk: mhs.krs.length,
    });
  } catch (error) {
    console.error('Error fetching mahasiswa profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
