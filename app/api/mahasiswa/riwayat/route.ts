import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

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

function getNilaiAngka(huruf: string): number {
  const map: Record<string, number> = {
    'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0,
    'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D': 1.0, 'E': 0.0,
  };
  return map[huruf] ?? 0;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { mahasiswa: true },
    });

    if (!user || !user.mahasiswa) {
      return NextResponse.json({ error: 'Mahasiswa not found' }, { status: 404 });
    }

    const mahasiswaId = user.mahasiswa.id;

    // Get all KRS with nilai
    const krsList = await prisma.kRS.findMany({
      where: { mahasiswaId },
      include: {
        kelas: {
          include: {
            mataKuliah: true,
            komponenNilai: {
              include: {
                nilaiMahasiswa: {
                  where: { mahasiswaId },
                },
              },
            },
          },
        },
      },
    });

    // Group by semester
    const semesterMap = new Map<number, any[]>();

    krsList.forEach((krs) => {
      const mk = krs.kelas.mataKuliah;
      const komponen = krs.kelas.komponenNilai;

      // Calculate nilai akhir
      let totalNilai = 0;
      let totalBobot = 0;
      komponen.forEach((k) => {
        const nilaiMhs = k.nilaiMahasiswa[0];
        if (nilaiMhs) {
          totalNilai += nilaiMhs.nilai * (k.bobot / 100);
          totalBobot += k.bobot;
        }
      });

      const nilaiAkhir = totalBobot > 0 ? Math.round(totalNilai * 100) / 100 : 0;
      const huruf = totalBobot > 0 ? getNilaiHuruf(nilaiAkhir) : '-';
      const angka = totalBobot > 0 ? getNilaiAngka(huruf) : 0;

      const semesterMk = mk.semester;
      if (!semesterMap.has(semesterMk)) {
        semesterMap.set(semesterMk, []);
      }

      semesterMap.get(semesterMk)!.push({
        kode: mk.kode,
        nama: mk.nama,
        sks: mk.sks,
        nilaiAngka: nilaiAkhir,
        nilaiHuruf: huruf,
        nilaiBobot: angka,
        sudahAda: totalBobot > 0,
      });
    });

    // Build result per semester
    const result = Array.from(semesterMap.entries())
      .sort(([a], [b]) => a - b)
      .map(([semester, matkul]) => {
        const mkDenganNilai = matkul.filter((m) => m.sudahAda);
        const totalSks = mkDenganNilai.reduce((sum, m) => sum + m.sks, 0);
        const totalBobot = mkDenganNilai.reduce((sum, m) => sum + m.nilaiBobot * m.sks, 0);
        const ips = totalSks > 0 ? Math.round((totalBobot / totalSks) * 100) / 100 : 0;

        return {
          semester,
          matkul,
          ips,
          totalSks,
        };
      });

    // Calculate IPK
    const allMkDenganNilai = krsList.flatMap((krs) => {
      const mk = krs.kelas.mataKuliah;
      const komponen = krs.kelas.komponenNilai;
      let totalNilai = 0;
      let totalBobot = 0;
      komponen.forEach((k) => {
        const nilaiMhs = k.nilaiMahasiswa[0];
        if (nilaiMhs) {
          totalNilai += nilaiMhs.nilai * (k.bobot / 100);
          totalBobot += k.bobot;
        }
      });
      if (totalBobot === 0) return [];
      const nilaiAkhir = Math.round(totalNilai * 100) / 100;
      const huruf = getNilaiHuruf(nilaiAkhir);
      const angka = getNilaiAngka(huruf);
      return [{ sks: mk.sks, angka }];
    });

    const totalSksAll = allMkDenganNilai.reduce((s, m) => s + m.sks, 0);
    const totalBobotAll = allMkDenganNilai.reduce((s, m) => s + m.angka * m.sks, 0);
    const ipk = totalSksAll > 0 ? Math.round((totalBobotAll / totalSksAll) * 100) / 100 : 0;

    return NextResponse.json({ semesters: result, ipk });
  } catch (error) {
    console.error('Error fetching riwayat nilai:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
