import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET semua nilai untuk satu kelas sekaligus (fix N+1)
// ?kelasId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const kelasId = searchParams.get('kelasId');
    if (!kelasId) return NextResponse.json({ error: 'kelasId wajib' }, { status: 400 });

    const krs = await prisma.kRS.findMany({
      where: { kelasId },
      select: { mahasiswaId: true },
    });
    const mahasiswaIds = krs.map((k) => k.mahasiswaId);

    const komponen = await prisma.komponenNilai.findMany({
      where: { kelasId },
      select: { id: true },
    });
    const komponenIds = komponen.map((k) => k.id);

    const nilaiList = await prisma.nilaiMahasiswa.findMany({
      where: {
        mahasiswaId: { in: mahasiswaIds },
        komponenId: { in: komponenIds },
      },
      select: { mahasiswaId: true, komponenId: true, nilai: true },
    });

    // Format: { [mahasiswaId]: { [komponenId]: nilai } }
    const nilaiMap: Record<string, Record<string, number>> = {};
    nilaiList.forEach((n) => {
      if (!nilaiMap[n.mahasiswaId]) nilaiMap[n.mahasiswaId] = {};
      nilaiMap[n.mahasiswaId][n.komponenId] = n.nilai;
    });

    return NextResponse.json(nilaiMap);
  } catch (error) {
    console.error('Error batch fetching nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST batch upsert semua nilai sekaligus
// Body: { items: [{ mahasiswaId, komponenId, nilai }] }
export async function POST(request: NextRequest) {
  try {
    const { items } = await request.json() as {
      items: { mahasiswaId: string; komponenId: string; nilai: number }[];
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'items wajib dan tidak boleh kosong' }, { status: 400 });
    }

    for (const item of items) {
      if (!item.mahasiswaId || !item.komponenId || item.nilai === undefined) {
        return NextResponse.json(
          { error: 'Setiap item harus memiliki mahasiswaId, komponenId, dan nilai' },
          { status: 400 }
        );
      }
      if (item.nilai < 0 || item.nilai > 100) {
        return NextResponse.json({ error: `Nilai ${item.nilai} di luar range 0-100` }, { status: 400 });
      }
    }

    // Upsert sequentially (SQLite doesn't support concurrent writes well)
    let saved = 0;
    for (const item of items) {
      const existing = await prisma.nilaiMahasiswa.findFirst({
        where: { mahasiswaId: item.mahasiswaId, komponenId: item.komponenId },
      });
      if (existing) {
        await prisma.nilaiMahasiswa.update({
          where: { id: existing.id },
          data: { nilai: item.nilai },
        });
      } else {
        await prisma.nilaiMahasiswa.create({
          data: { mahasiswaId: item.mahasiswaId, komponenId: item.komponenId, nilai: item.nilai },
        });
      }
      saved++;
    }

    return NextResponse.json({ saved });
  } catch (error) {
    console.error('Error batch saving nilai:', error);
    return NextResponse.json({ error: 'Gagal menyimpan nilai' }, { status: 500 });
  }
}
