import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "cpl";

    if (type === "cpl") {
      const cplData = await prisma.cPL.findMany({
        include: { _count: { select: { pi: true } } },
        orderBy: { kode: "asc" },
      });
      return NextResponse.json(cplData);
    }

    if (type === "pi") {
      const piData = await prisma.pI.findMany({
        include: {
          cpl: { select: { kode: true } },
          _count: { select: { cpmk: true } },
        },
        orderBy: { kode: "asc" },
      });
      return NextResponse.json(piData);
    }

    if (type === "cpmk") {
      const cpmkData = await prisma.cPMK.findMany({
        include: {
          pi: { select: { kode: true } },
          mataKuliah: { select: { kode: true, nama: true } },
        },
        orderBy: { kode: "asc" },
      });
      return NextResponse.json(cpmkData);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching kurikulum:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
