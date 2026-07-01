import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { getActiveSemester } from '@/lib/semesterUtils';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userIdCookie = cookieStore.get('userId');

    if (!userIdCookie?.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get dosen data with pengampu (teaching assignments)
    const dosen = await prisma.dosen.findUnique({
      where: { userId: userIdCookie.value },
      include: {
        pengampu: {
          include: {
            kelas: {
              where: { semester: getActiveSemester() },
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

    // AUTHORIZATION: Only return mata kuliah where dosen is assigned as pengampu
    // This ensures dosen can ONLY see courses they are authorized to teach
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
