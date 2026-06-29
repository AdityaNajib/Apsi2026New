import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get options for dropdowns (CPL list, MK list, CPMK list)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "cpl") {
      const cplList = await prisma.cPL.findMany({
        select: { id: true, kode: true, deskripsi: true },
        orderBy: { kode: "asc" },
      });
      return NextResponse.json(cplList);
    }

    if (type === "pi") {
      const piList = await prisma.pI.findMany({
        select: { id: true, kode: true, deskripsi: true, cplId: true },
        orderBy: { kode: "asc" },
      });
      return NextResponse.json(piList);
    }

    if (type === "mk") {
      const mkList = await prisma.mataKuliah.findMany({
        select: { id: true, kode: true, nama: true },
        orderBy: { kode: "asc" },
      });
      return NextResponse.json(mkList);
    }

    if (type === "cpmk") {
      const cpmkList = await prisma.cPMK.findMany({
        select: { id: true, kode: true, deskripsi: true, mkId: true },
        orderBy: { kode: "asc" },
      });
      return NextResponse.json(cpmkList);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Error fetching options:", error);
    return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 });
  }
}
