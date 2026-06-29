import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { piId, cpmkId, linked } = await request.json();

    if (!piId || !cpmkId || linked === undefined) {
      return NextResponse.json({ error: "piId, cpmkId, linked wajib" }, { status: 400 });
    }

    const cpmk = await prisma.cPMK.findUnique({ where: { id: cpmkId } });
    if (!cpmk) return NextResponse.json({ error: "CPMK tidak ditemukan" }, { status: 404 });

    if (linked) {
      await prisma.cPMK.update({ where: { id: cpmkId }, data: { piId } });
    } else {
      const bobotCount = await prisma.bobotCPMK.count({ where: { cpmkId } });
      if (bobotCount > 0) {
        return NextResponse.json(
          { error: `CPMK ${cpmk.kode} masih memiliki ${bobotCount} bobot komponen. Hapus bobot terlebih dahulu.` },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "Untuk melepas CPMK dari PI, hapus atau reassign CPMK ke PI lain." },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling PI-CPMK:", error);
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}
