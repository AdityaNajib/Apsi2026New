import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET stats for kelas - menghitung mahasiswa unik yang terdaftar di kelas
export async function GET() {
  try {
    // Ambil semua KRS untuk mendapatkan mahasiswa unik yang terdaftar di kelas
    const allKRS = await prisma.kRS.findMany({
      select: {
        mahasiswaId: true,
        mahasiswa: {
          select: {
            angkatan: true,
            status: true,
          },
        },
      },
    });

    // Hitung mahasiswa unik yang aktif
    const uniqueMahasiswaIds = new Set<string>();
    allKRS.forEach((krs) => {
      // Hanya hitung mahasiswa yang aktif
      if (krs.mahasiswa.status === 'AKTIF') {
        uniqueMahasiswaIds.add(krs.mahasiswaId);
      }
    });

    return NextResponse.json({
      totalMahasiswaUnik: uniqueMahasiswaIds.size,
    });
  } catch (error) {
    console.error('Error fetching kelas stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
