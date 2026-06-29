import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all kelas with full detail
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mkId = searchParams.get('mkId');

    const whereClause = mkId ? { mkId } : {};

    const kelasList = await prisma.kelas.findMany({
      where: whereClause,
      include: {
        mataKuliah: true,
        pengampu: {
          include: {
            dosen: { include: { user: true } },
          },
        },
        krs: {
          include: {
            mahasiswa: { include: { user: true } },
          },
        },
        komponenNilai: true,
      },
      orderBy: [{ tahun_ajaran: 'desc' }, { mataKuliah: { nama: 'asc' } }],
    });

    return NextResponse.json(kelasList.map((k) => ({
      id: k.id,
      nama: k.nama,
      tahunAjaran: k.tahun_ajaran,
      semester: k.semester,
      mataKuliah: {
        id: k.mataKuliah.id,
        kode: k.mataKuliah.kode,
        nama: k.mataKuliah.nama,
        sks: k.mataKuliah.sks,
        semester: k.mataKuliah.semester, // Added semester field
      },
      dosen: k.pengampu.map((p) => ({
        id: p.dosen.id,
        pengampuId: p.id,
        name: p.dosen.user.name,
        nidn: p.dosen.nidn,
      })),
      jumlahMahasiswa: k.krs.length,
      komponenNilai: k.komponenNilai,
    })));
  } catch (error) {
    console.error('Error fetching kelas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new kelas
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mkId, nama, tahunAjaran, semester } = body;

    if (!mkId || !nama || !tahunAjaran || !semester) {
      return NextResponse.json({ error: 'mkId, nama, tahunAjaran, semester wajib diisi' }, { status: 400 });
    }

    const kelas = await prisma.kelas.create({
      data: { mkId, nama, tahun_ajaran: tahunAjaran, semester },
      include: { mataKuliah: true },
    });

    return NextResponse.json(kelas, { status: 201 });
  } catch (error) {
    console.error('Error creating kelas:', error);
    return NextResponse.json({ error: 'Gagal membuat kelas' }, { status: 500 });
  }
}

// DELETE kelas
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 });

    // Cascade delete
    await prisma.nilaiMahasiswa.deleteMany({
      where: { komponen: { kelasId: id } },
    });
    await prisma.bobotCPMK.deleteMany({
      where: { komponen: { kelasId: id } },
    });
    await prisma.komponenNilai.deleteMany({ where: { kelasId: id } });
    await prisma.kRS.deleteMany({ where: { kelasId: id } });
    await prisma.pengampu.deleteMany({ where: { kelasId: id } });
    await prisma.kelas.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting kelas:', error);
    return NextResponse.json({ error: 'Gagal menghapus kelas' }, { status: 500 });
  }
}
