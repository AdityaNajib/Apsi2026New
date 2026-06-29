import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET dropdown options: mk, dosen, mahasiswa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'mk') {
      const mk = await prisma.mataKuliah.findMany({
        orderBy: { kode: 'asc' },
        select: { id: true, kode: true, nama: true, sks: true, semester: true },
      });
      return NextResponse.json(mk);
    }

    if (type === 'dosen') {
      const dosen = await prisma.dosen.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { user: { name: 'asc' } },
      });
      return NextResponse.json(dosen.map((d) => ({
        id: d.id,
        name: d.user.name,
        email: d.user.email,
        nidn: d.nidn,
      })));
    }

    if (type === 'mahasiswa') {
      const mhs = await prisma.mahasiswa.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { nim: 'asc' },
      });
      return NextResponse.json(mhs.map((m) => ({
        id: m.id,
        nim: m.nim,
        name: m.user.name,
        angkatan: m.angkatan,
      })));
    }

    if (type === 'mahasiswa-not-in-kelas') {
      const kelasId = searchParams.get('kelasId');
      if (!kelasId) return NextResponse.json({ error: 'kelasId wajib' }, { status: 400 });

      const enrolled = await prisma.kRS.findMany({
        where: { kelasId },
        select: { mahasiswaId: true },
      });
      const enrolledIds = enrolled.map((e) => e.mahasiswaId);

      const mhs = await prisma.mahasiswa.findMany({
        where: { id: { notIn: enrolledIds } },
        include: { user: { select: { name: true } } },
        orderBy: { nim: 'asc' },
      });

      return NextResponse.json(mhs.map((m) => ({
        id: m.id,
        nim: m.nim,
        name: m.user.name,
        angkatan: m.angkatan,
      })));
    }

    return NextResponse.json({ error: 'type tidak valid' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching options:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
