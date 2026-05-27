import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const angkatan = searchParams.get("angkatan") || "all";

    // Get all CPL
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
                            mahasiswa: {
                              include: {
                                user: true,
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
        },
      },
    });

    // Calculate CPL achievement for each CPL
    const laporan = cplList.map((cpl) => {
      let totalNilai = 0;
      let countNilai = 0;
      const mahasiswaSet = new Set<string>();

      // Iterate through PI -> CPMK -> BobotCPMK -> KomponenNilai -> NilaiMahasiswa
      cpl.pi.forEach((pi) => {
        pi.cpmk.forEach((cpmk) => {
          cpmk.bobotCpmk.forEach((bobot) => {
            bobot.komponen.nilaiMahasiswa.forEach((nilai) => {
              // Filter by angkatan if specified
              if (angkatan !== "all" && nilai.mahasiswa.angkatan !== angkatan) {
                return;
              }

              totalNilai += nilai.nilai;
              countNilai++;
              mahasiswaSet.add(nilai.mahasiswaId);
            });
          });
        });
      });

      const rataRata = countNilai > 0 ? totalNilai / countNilai : 0;
      const jumlahMahasiswa = mahasiswaSet.size;
      const tercapai = Math.round(jumlahMahasiswa * (rataRata / 100));
      const belumTercapai = jumlahMahasiswa - tercapai;
      const persentaseTercapai = jumlahMahasiswa > 0 ? (tercapai / jumlahMahasiswa) * 100 : 0;

      return {
        cplKode: cpl.kode,
        cplDeskripsi: cpl.deskripsi,
        rataRata,
        jumlahMahasiswa,
        tercapai,
        belumTercapai,
        persentaseTercapai,
      };
    });

    return NextResponse.json(laporan);
  } catch (error) {
    console.error("Error fetching laporan CPL:", error);
    return NextResponse.json({ error: "Failed to fetch laporan" }, { status: 500 });
  }
}
