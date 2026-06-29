/**
 * CPL Calculation Engine — Outcome Based Education (OBE)
 *
 * Hierarki:
 *   Nilai Komponen → CPMK → PI → CPL
 *
 * Level 0: Nilai CPMK = Σ (nilai_komponen × bobot_komponen_ke_CPMK / 100)
 * Level 1: Nilai PI   = Σ (nilai_CPMK    × bobot_CPMK_ke_PI / 100)
 * Level 2: Nilai CPL  = Σ (nilai_PI      × bobot_PI_ke_CPL / 100)
 *
 * Ketentuan:
 *  - Total bobot komponen dalam satu CPMK = 100%
 *  - Total bobot CPMK dalam satu PI       = 100%
 *  - Total bobot PI dalam satu CPL        = 100%
 *  - Jika bobot tidak tersedia (belum dikonfigurasi), fallback ke rata-rata equal-weight
 */

import { prisma } from '@/lib/prisma';

export interface NilaiCPLResult {
  kode: string;
  deskripsi: string;
  nilai: number;          // 0–100
  target: number;
  status: 'Tercapai' | 'Tidak Tercapai' | 'Belum Ada Data';
  hasData: boolean;
  /** Detail breakdown per PI */
  piBreakdown?: { kode: string; nilai: number }[];
}

export interface LaporanCPLItem {
  cplKode: string;
  cplDeskripsi: string;
  rataRata: number;
  jumlahMahasiswa: number;
  tercapai: number;
  belumTercapai: number;
  persentaseTercapai: number;
}

const TARGET = 70;

// ─────────────────────────────────────────────────────────────────
// Internal helper: calculate nilai CPL for a single mahasiswa
// ─────────────────────────────────────────────────────────────────
export async function calculateCPLForMahasiswa(
  mahasiswaId: string
): Promise<NilaiCPLResult[]> {
  // Load full kurikulum + nilai in one query
  const cplList = await prisma.cPL.findMany({
    include: {
      bobotPiCpl: {
        include: {
          pi: {
            include: {
              bobotCpmkPi: {
                include: {
                  cpmk: {
                    include: {
                      bobotCpmk: {
                        include: {
                          komponen: {
                            include: {
                              nilaiMahasiswa: {
                                where: { mahasiswaId },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
              // Fallback: direct CPMK relation for equal-weight
              cpmk: {
                include: {
                  bobotCpmk: {
                    include: {
                      komponen: {
                        include: {
                          nilaiMahasiswa: { where: { mahasiswaId } },
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
      // Fallback: direct PI relation for equal-weight
      pi: {
        include: {
          cpmk: {
            include: {
              bobotCpmk: {
                include: {
                  komponen: {
                    include: {
                      nilaiMahasiswa: { where: { mahasiswaId } },
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

  return cplList.map((cpl) => {
    // Pilih jalur perhitungan: gunakan BobotPI_CPL jika tersedia, else fallback ke PI langsung
    const useBobotPiCpl = cpl.bobotPiCpl.length > 0;

    let piContributions: { nilai: number; bobot: number; kode: string }[] = [];

    if (useBobotPiCpl) {
      // === Jalur berbobot: BobotPI_CPL ===
      piContributions = cpl.bobotPiCpl.map((bpc) => {
        const pi = bpc.pi;
        const nilaiPi = calcNilaiPI_withBobot(pi, mahasiswaId);
        return { nilai: nilaiPi.nilai, bobot: bpc.bobot, kode: pi.kode };
      });
    } else {
      // === Fallback: equal-weight PI dari relasi langsung ===
      piContributions = cpl.pi.map((pi) => {
        const nilaiPi = calcNilaiPI_equalWeight(pi, mahasiswaId);
        return { nilai: nilaiPi.nilai, bobot: 1, kode: pi.kode };
      });
    }

    const hasData = piContributions.some((p) => p.nilai > 0 || p.bobot > 0);
    const validPi = piContributions.filter((p) => p.nilai !== null);

    let nilaiCpl = 0;
    if (validPi.length > 0) {
      if (useBobotPiCpl) {
        const totalBobot = validPi.reduce((s, p) => s + p.bobot, 0);
        nilaiCpl = totalBobot > 0
          ? validPi.reduce((s, p) => s + p.nilai * (p.bobot / 100), 0)
          : 0;
      } else {
        nilaiCpl = validPi.reduce((s, p) => s + p.nilai, 0) / validPi.length;
      }
    }

    const nilai = Math.round(nilaiCpl * 10) / 10;
    const dataExists = piContributions.some((p) => {
      // check underlying data exists
      return p.nilai > 0;
    });

    const status: NilaiCPLResult['status'] = !dataExists
      ? 'Belum Ada Data'
      : nilai >= TARGET
      ? 'Tercapai'
      : 'Tidak Tercapai';

    return {
      kode: cpl.kode,
      deskripsi: cpl.deskripsi,
      nilai,
      target: TARGET,
      status,
      hasData: dataExists,
      piBreakdown: piContributions.map((p) => ({ kode: p.kode, nilai: Math.round(p.nilai * 10) / 10 })),
    };
  });
}

// ─────────────────────────────────────────────────────────────────
// Level 1: Nilai PI — with explicit bobot (BobotCPMK_PI)
// ─────────────────────────────────────────────────────────────────
function calcNilaiPI_withBobot(
  pi: any,
  _mahasiswaId: string
): { nilai: number } {
  const cpmkContrib = (pi.bobotCpmkPi ?? []).map((bcp: any) => {
    const nilaiCpmk = calcNilaiCPMK(bcp.cpmk);
    return { nilai: nilaiCpmk, bobot: bcp.bobot };
  });

  if (cpmkContrib.length === 0) return { nilai: 0 };

  const total = cpmkContrib.reduce((s: number, c: any) => s + c.nilai * (c.bobot / 100), 0);
  return { nilai: total };
}

// ─────────────────────────────────────────────────────────────────
// Level 1: Nilai PI — equal-weight fallback (no BobotCPMK_PI)
// ─────────────────────────────────────────────────────────────────
function calcNilaiPI_equalWeight(pi: any, _mahasiswaId: string): { nilai: number } {
  const nilaiList: number[] = (pi.cpmk ?? []).map((cpmk: any) => calcNilaiCPMK(cpmk));
  if (nilaiList.length === 0) return { nilai: 0 };
  return { nilai: nilaiList.reduce((a: number, b: number) => a + b, 0) / nilaiList.length };
}

// ─────────────────────────────────────────────────────────────────
// Level 0: Nilai CPMK = Σ (nilai_komponen × bobot / 100)
// ─────────────────────────────────────────────────────────────────
function calcNilaiCPMK(cpmk: any): number {
  let weightedSum = 0;
  let weightTotal = 0;

  (cpmk.bobotCpmk ?? []).forEach((bobotEntry: any) => {
    const w = bobotEntry.bobot; // e.g. 40 (%)
    (bobotEntry.komponen?.nilaiMahasiswa ?? []).forEach((nm: any) => {
      weightedSum += nm.nilai * (w / 100);
      weightTotal += w / 100;
    });
  });

  if (weightTotal === 0) return 0;
  // Normalize in case total weight != 1.0 due to config error
  return weightedSum / weightTotal;
}

// ─────────────────────────────────────────────────────────────────
// Laporan CPL untuk semua mahasiswa (dipakai kaprodi/jamu)
// ─────────────────────────────────────────────────────────────────
export async function calculateLaporanCPL(angkatan = 'all'): Promise<LaporanCPLItem[]> {
  // Load all mahasiswa
  const mahasiswaList = await prisma.mahasiswa.findMany({
    where: angkatan !== 'all' ? { angkatan } : undefined,
    select: { id: true },
  });

  const cplList = await prisma.cPL.findMany({ orderBy: { kode: 'asc' } });

  // Per CPL, accumulate per mahasiswa
  const perCPL: Record<string, number[]> = {};
  cplList.forEach((c) => { perCPL[c.id] = []; });

  // Calculate in parallel per mahasiswa
  await Promise.all(
    mahasiswaList.map(async (mhs) => {
      const results = await calculateCPLForMahasiswa(mhs.id);
      results.forEach((r, idx) => {
        if (r.hasData) {
          perCPL[cplList[idx].id].push(r.nilai);
        }
      });
    })
  );

  return cplList.map((cpl) => {
    const vals = perCPL[cpl.id];
    const jumlahMahasiswa = vals.length;
    const rataRata = jumlahMahasiswa > 0
      ? vals.reduce((a, b) => a + b, 0) / jumlahMahasiswa
      : 0;
    const tercapai = vals.filter((v) => v >= TARGET).length;
    const belumTercapai = jumlahMahasiswa - tercapai;
    const persentaseTercapai = jumlahMahasiswa > 0
      ? (tercapai / jumlahMahasiswa) * 100
      : 0;

    return {
      cplKode: cpl.kode,
      cplDeskripsi: cpl.deskripsi,
      rataRata: Math.round(rataRata * 10) / 10,
      jumlahMahasiswa,
      tercapai,
      belumTercapai,
      persentaseTercapai: Math.round(persentaseTercapai * 10) / 10,
    };
  });
}
