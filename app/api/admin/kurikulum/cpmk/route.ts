import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateKode } from "@/lib/kodeValidation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kode, deskripsi, piId, mkId } = body;

    const kodeErr = validateKode("cpmk", kode ?? "");
    if (kodeErr) return NextResponse.json({ error: kodeErr }, { status: 400 });

    const cpmk = await prisma.cPMK.create({
      data: { kode, deskripsi, piId, mkId },
      include: {
        pi: { select: { kode: true } },
        mataKuliah: { select: { kode: true, nama: true } },
      },
    });
    return NextResponse.json(cpmk);
  } catch (error) {
    console.error("Error creating CPMK:", error);
    return NextResponse.json({ error: "Failed to create CPMK" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, kode, deskripsi, piId, mkId } = body;

    const kodeErr = validateKode("cpmk", kode ?? "");
    if (kodeErr) return NextResponse.json({ error: kodeErr }, { status: 400 });

    const cpmk = await prisma.cPMK.update({
      where: { id },
      data: { kode, deskripsi, piId, mkId },
      include: {
        pi: { select: { kode: true } },
        mataKuliah: { select: { kode: true, nama: true } },
      },
    });
    return NextResponse.json(cpmk);
  } catch (error) {
    console.error("Error updating CPMK:", error);
    return NextResponse.json({ error: "Failed to update CPMK" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const cpmk = await prisma.cPMK.findUnique({
      where: { id },
      include: { _count: { select: { bobotCpmk: true } } },
    });
    if (cpmk && cpmk._count.bobotCpmk > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus CPMK yang memiliki bobot" },
        { status: 400 }
      );
    }

    await prisma.cPMK.delete({ where: { id } });
    return NextResponse.json({ message: "CPMK deleted successfully" });
  } catch (error) {
    console.error("Error deleting CPMK:", error);
    return NextResponse.json({ error: "Failed to delete CPMK" }, { status: 500 });
  }
}
