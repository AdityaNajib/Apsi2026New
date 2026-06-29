import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { cplId, piId, linked } = await request.json();

    if (!cplId || !piId || linked === undefined) {
      return NextResponse.json({ error: "cplId, piId, linked wajib" }, { status: 400 });
    }

    const pi = await prisma.pI.findUnique({ where: { id: piId } });
    if (!pi) return NextResponse.json({ error: "PI tidak ditemukan" }, { status: 404 });

    const cpl = await prisma.cPL.findUnique({ where: { id: cplId } });
    if (!cpl) return NextResponse.json({ error: "CPL tidak ditemukan" }, { status: 404 });

    if (linked) {
      await prisma.pI.update({ where: { id: piId }, data: { cplId } });
    } else {
      const cpmkCount = await prisma.cPMK.count({ where: { piId } });
      if (cpmkCount > 0) {
        return NextResponse.json(
          { error: `PI ${pi.kode} masih memiliki ${cpmkCount} CPMK terhubung. Lepas CPMK terlebih dahulu.` },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Untuk melepas PI dari CPL, hapus PI terlebih dahulu atau reassign ke CPL lain." },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling CPL-PI:", error);
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}
