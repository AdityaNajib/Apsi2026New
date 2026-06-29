import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: export laporan CPL as CSV
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const angkatan = searchParams.get('angkatan') || 'all';
    const format = searchParams.get('format') || 'csv';

    // Fetch all CPL dengan data nilai
    const cplList = await prisma.cPL.findMany({
      include: {
        pi: {
          include: {
            cpmk: {
              include: {
                bobotCpmk: {
                  include: {
                    komponen: {
                      include: {
                        nilaiMahasiswa: {
                          include: {
                            mahasiswa: { include: { user: true } },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { kode: 'asc' },
    });

    const laporan = cplList.map((cpl) => {
      let totalNilai = 0;
      let countNilai = 0;
      const mahasiswaSet = new Set<string>();
      const mahasiswaValues: Record<string, number[]> = {};

      cpl.pi.forEach((pi) => {
        pi.cpmk.forEach((cpmk) => {
          cpmk.bobotCpmk.forEach((bobot) => {
            bobot.komponen.nilaiMahasiswa.forEach((nilai) => {
              if (angkatan !== 'all' && nilai.mahasiswa.angkatan !== angkatan) return;
              totalNilai += nilai.nilai;
              countNilai++;
              mahasiswaSet.add(nilai.mahasiswaId);
              if (!mahasiswaValues[nilai.mahasiswaId]) mahasiswaValues[nilai.mahasiswaId] = [];
              mahasiswaValues[nilai.mahasiswaId].push(nilai.nilai);
            });
          });
        });
      });

      const rataRata = countNilai > 0 ? totalNilai / countNilai : 0;
      const jumlahMahasiswa = mahasiswaSet.size;
      const tercapai = Object.values(mahasiswaValues).filter(
        (vals) => vals.reduce((a, b) => a + b, 0) / vals.length >= 70
      ).length;
      const belumTercapai = jumlahMahasiswa - tercapai;
      const persentaseTercapai = jumlahMahasiswa > 0 ? (tercapai / jumlahMahasiswa) * 100 : 0;

      return {
        cplKode: cpl.kode,
        cplDeskripsi: cpl.deskripsi,
        rataRata: Math.round(rataRata * 10) / 10,
        jumlahMahasiswa,
        tercapai,
        belumTercapai,
        persentaseTercapai: Math.round(persentaseTercapai * 10) / 10,
        status: persentaseTercapai >= 70 ? 'Tercapai' : 'Perlu Perbaikan',
      };
    });

    if (format === 'csv') {
      // Build CSV dengan BOM UTF-8 agar Excel baca benar
      const tahunIni = new Date().getFullYear();
      const angkatanLabel = angkatan === 'all' ? 'Semua Angkatan' : `Angkatan ${angkatan}`;

      const rows = [
        [`LAPORAN KETERCAPAIAN CPL - PROGRAM STUDI TEKNIK INDUSTRI UNS`],
        [`Tahun Akademik: ${tahunIni}/${tahunIni + 1}`, `Filter: ${angkatanLabel}`],
        [`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`],
        [],
        ['Kode CPL', 'Deskripsi', 'Rata-rata Nilai', 'Jumlah Mahasiswa', 'Tercapai', 'Belum Tercapai', 'Persentase Tercapai (%)', 'Status'],
        ...laporan.map((l) => [
          l.cplKode,
          l.cplDeskripsi,
          l.rataRata,
          l.jumlahMahasiswa,
          l.tercapai,
          l.belumTercapai,
          l.persentaseTercapai,
          l.status,
        ]),
        [],
        ['RINGKASAN'],
        ['Total CPL', laporan.length],
        ['CPL Tercapai (≥70%)', laporan.filter((l) => l.persentaseTercapai >= 70).length],
        ['CPL Belum Tercapai', laporan.filter((l) => l.persentaseTercapai < 70).length],
        ['Rata-rata Keseluruhan', (laporan.reduce((s, l) => s + l.rataRata, 0) / (laporan.length || 1)).toFixed(1)],
      ];

      const csvContent = '\uFEFF' + rows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="laporan-cpl-${angkatan}-${tahunIni}.csv"`,
        },
      });
    }

    // JSON fallback untuk print
    return NextResponse.json(laporan);
  } catch (error) {
    console.error('Error exporting laporan:', error);
    return NextResponse.json({ error: 'Gagal export laporan' }, { status: 500 });
  }
}
