import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get dosen data
    const dosen = await prisma.dosen.findUnique({
      where: { userId: userIdCookie.value },
      include: {
        pengampu: {
          include: {
            kelas: {
              include: {
                mataKuliah: true,
                krs: {
                  include: {
                    mahasiswa: true,
                  },
                },
                komponenNilai: true,
              },
            },
          },
        },
      },
    });

    if (!dosen) {
      return NextResponse.json({ error: 'Dosen not found' }, { status: 404 });
    }

    // Transform data
    const mataKuliah = dosen.pengampu.map((p) => ({
      kelasId: p.kelas.id,
      kode: p.kelas.mataKuliah.kode,
      nama: p.kelas.mataKuliah.nama,
      namaKelas: p.kelas.nama,
      sks: p.kelas.mataKuliah.sks,
      semester: p.kelas.mataKuliah.semester,
      tahunAjaran: p.kelas.tahun_ajaran,
      semesterKelas: p.kelas.semester,
      jumlahMahasiswa: p.kelas.krs.length,
      komponenNilai: p.kelas.komponenNilai,
    }));

    return NextResponse.json(mataKuliah);
  } catch (error) {
    console.error('Error fetching mata kuliah:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
