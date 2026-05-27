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
        mataKuliah: true,
        krs: {
          include: {
            mahasiswa: {
              include: {
                user: true,
                nilaiMahasiswa: {
                  include: {
                    komponen: {
                      where: { kelasId },
                    },
                  },
                },
              },
            },
          },
        },
        komponenNilai: true,
      },
    });

    if (!kelas) {
      return NextResponse.json({ error: 'Kelas not found' }, { status: 404 });
    }

    // Calculate rekap for each mahasiswa
    const rekap = kelas.krs.map((krs) => {
      const mhs = krs.mahasiswa;
      const nilaiList = mhs.nilaiMahasiswa.filter(
        (n) => n.komponen.kelasId === kelasId
      );

      // Calculate weighted average
      let totalNilai = 0;
      let totalBobot = 0;

      nilaiList.forEach((nilai) => {
        const komponen = kelas.komponenNilai.find((k) => k.id === nilai.komponenId);
        if (komponen) {
          totalNilai += nilai.nilai * (komponen.bobot / 100);
          totalBobot += komponen.bobot;
        }
      });

      const nilaiAkhir = totalBobot > 0 ? totalNilai : 0;
      const huruf = getNilaiHuruf(nilaiAkhir);

      return {
        mahasiswaId: mhs.id,
        nim: mhs.nim,
        nama: mhs.user.name,
        angkatan: mhs.angkatan,
        nilaiKomponen: nilaiList.map((n) => ({
          komponenId: n.komponenId,
          komponenNama: kelas.komponenNilai.find((k) => k.id === n.komponenId)?.nama || '',
          nilai: n.nilai,
        })),
        nilaiAkhir: Math.round(nilaiAkhir * 100) / 100,
        nilaiHuruf: huruf,
      };
    });

    return NextResponse.json({
      kelas: {
        id: kelas.id,
        nama: kelas.nama,
        mataKuliah: kelas.mataKuliah.nama,
        kode: kelas.mataKuliah.kode,
        tahunAjaran: kelas.tahun_ajaran,
        semester: kelas.semester,
      },
      komponenNilai: kelas.komponenNilai,
      rekap,
    });
  } catch (error) {
    console.error('Error fetching rekap:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function getNilaiHuruf(nilai: number): string {
  if (nilai >= 85) return 'A';
  if (nilai >= 80) return 'A-';
  if (nilai >= 75) return 'B+';
  if (nilai >= 70) return 'B';
  if (nilai >= 65) return 'B-';
  if (nilai >= 60) return 'C+';
  if (nilai >= 55) return 'C';
  if (nilai >= 50) return 'C-';
  if (nilai >= 45) return 'D';
  return 'E';
}
