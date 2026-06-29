import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET mahasiswa in a kelas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    if (!kelasId) return NextResponse.json({ error: 'kelasId wajib' }, { status: 400 });

    const krsList = await prisma.kRS.findMany({
      where: { kelasId },
      include: {
        mahasiswa: { include: { user: true } },
      },
    });

    return NextResponse.json(krsList.map((k) => ({
      krsId: k.id,
      mahasiswaId: k.mahasiswaId,
      nim: k.mahasiswa.nim,
      name: k.mahasiswa.user.name,
      angkatan: k.mahasiswa.angkatan,
    })));
  } catch (error) {
    console.error('Error fetching mahasiswa kelas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST enroll mahasiswa to kelas
export async function POST(request: NextRequest) {
  try {
    const { kelasId, mahasiswaId } = await request.json();
    if (!kelasId || !mahasiswaId) {
      return NextResponse.json({ error: 'kelasId dan mahasiswaId wajib' }, { status: 400 });
    }

    const existing = await prisma.kRS.findFirst({ where: { kelasId, mahasiswaId } });
    if (existing) {
      return NextResponse.json({ error: 'Mahasiswa sudah terdaftar di kelas ini' }, { status: 409 });
    }

    const krs = await prisma.kRS.create({ data: { kelasId, mahasiswaId } });
    return NextResponse.json(krs, { status: 201 });
  } catch (error) {
    console.error('Error enrolling mahasiswa:', error);
    return NextResponse.json({ error: 'Gagal mendaftarkan mahasiswa' }, { status: 500 });
  }
}

  // DELETE unenroll mahasiswa from kelas
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const krsId = searchParams.get('krsId');
    if (!krsId) return NextResponse.json({ error: 'krsId wajib' }, { status: 400 });

    // Ambil KRS dulu untuk tahu kelasId dan mahasiswaId
    const krs = await prisma.kRS.findUnique({ where: { id: krsId } });
    if (!krs) return NextResponse.json({ error: 'KRS tidak ditemukan' }, { status: 404 });

    // Hapus nilai mahasiswa di kelas ini dulu
    await prisma.nilaiMahasiswa.deleteMany({
      where: {
        mahasiswaId: krs.mahasiswaId,
        komponen: { kelasId: krs.kelasId },
      },
    });

    await prisma.kRS.delete({ where: { id: krsId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing mahasiswa from kelas:', error);
    return NextResponse.json({ error: 'Gagal menghapus mahasiswa dari kelas' }, { status: 500 });
  }
}
