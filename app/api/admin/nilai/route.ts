import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET nilai mahasiswa in a kelas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    if (!kelasId) return NextResponse.json({ error: 'kelasId wajib' }, { status: 400 });

    const kelas = await prisma.kelas.findUnique({
      where: { id: kelasId },
      include: {
        mataKuliah: true,
        krs: {
          include: {
            mahasiswa: {
              include: {
                user: true,
                nilaiMahasiswa: {
                  where: { komponen: { kelasId } },
                },
              },
            },
          },
        },
        komponenNilai: true,
      },
    });

    if (!kelas) return NextResponse.json({ error: 'Kelas tidak ditemukan' }, { status: 404 });

    const mahasiswaList = kelas.krs.map((krs) => {
      const mhs = krs.mahasiswa;
      const nilaiMap: Record<string, number | null> = {};
      kelas.komponenNilai.forEach((k) => {
        const nilaiItem = mhs.nilaiMahasiswa.find((n) => n.komponenId === k.id);
        nilaiMap[k.id] = nilaiItem?.nilai ?? null;
      });
      return {
        mahasiswaId: mhs.id,
        nim: mhs.nim,
        name: mhs.user.name,
        nilaiMap,
      };
    });

    return NextResponse.json({
      kelas: {
        id: kelas.id,
        nama: kelas.nama,
        mataKuliah: kelas.mataKuliah.nama,
        kode: kelas.mataKuliah.kode,
      },
      komponenNilai: kelas.komponenNilai,
      mahasiswaList,
    });
  } catch (error) {
    console.error('Error fetching nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST upsert nilai (admin bisa input nilai)
export async function POST(request: NextRequest) {
  try {
    const { mahasiswaId, komponenId, nilai } = await request.json();
    if (!mahasiswaId || !komponenId || nilai === undefined) {
      return NextResponse.json({ error: 'mahasiswaId, komponenId, nilai wajib' }, { status: 400 });
    }
    if (nilai < 0 || nilai > 100) {
      return NextResponse.json({ error: 'Nilai harus antara 0-100' }, { status: 400 });
    }

    const existing = await prisma.nilaiMahasiswa.findFirst({
      where: { mahasiswaId, komponenId },
    });

    let result;
    if (existing) {
      result = await prisma.nilaiMahasiswa.update({
        where: { id: existing.id },
        data: { nilai },
      });
    } else {
      result = await prisma.nilaiMahasiswa.create({
        data: { mahasiswaId, komponenId, nilai },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving nilai:', error);
    return NextResponse.json({ error: 'Gagal menyimpan nilai' }, { status: 500 });
  }
}
