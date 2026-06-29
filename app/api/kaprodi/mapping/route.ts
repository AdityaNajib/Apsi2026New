/**
 * GET /api/kaprodi/mapping
 * Returns full tree: CPL → PI → CPMK → KomponenNilai
 * Used by the tree-toggle mapping dashboard.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // All CPL
    const cplList = await prisma.cPL.findMany({
      orderBy: { kode: "asc" },
      include: {
        pi: { select: { id: true } }, // which PIs are currently linked
      },
    });

    // All PI
    const piList = await prisma.pI.findMany({
      orderBy: { kode: "asc" },
      include: {
        cpl: { select: { id: true, kode: true } },
        cpmk: { select: { id: true } }, // which CPMKs are currently linked
      },
    });

    // All CPMK
    const cpmkList = await prisma.cPMK.findMany({
      orderBy: { kode: "asc" },
      include: {
        mataKuliah: { select: { kode: true, nama: true } },
        pi: { select: { id: true, kode: true } },
        bobotCpmk: {
          include: {
            komponen: {
              select: { id: true, nama: true, bobot: true, kelasId: true,
                kelas: { select: { nama: true, mataKuliah: { select: { kode: true, nama: true } } } }
              },
            },
          },
        },
      },
    });

    // All KomponenNilai (for CPMK mapping)
    const komponenList = await prisma.komponenNilai.findMany({
      orderBy: { nama: "asc" },
      include: {
        kelas: {
          select: {
            nama: true,
            mataKuliah: { select: { kode: true, nama: true } },
          },
        },
      },
    });

    return NextResponse.json({ cplList, piList, cpmkList, komponenList });
  } catch (error) {
    console.error("Error fetching mapping:", error);
    return NextResponse.json({ error: "Failed to fetch mapping" }, { status: 500 });
  }
}
