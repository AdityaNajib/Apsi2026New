import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateKode } from "@/lib/kodeValidation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kode, deskripsi, deskripsi_en } = body;

    const kodeErr = validateKode("cpl", kode ?? "");
    if (kodeErr) return NextResponse.json({ error: kodeErr }, { status: 400 });

    const existing = await prisma.cPL.findUnique({ where: { kode } });
    if (existing) {
      return NextResponse.json({ error: "Kode CPL sudah ada" }, { status: 400 });
    }

    const cpl = await prisma.cPL.create({
      data: { kode, deskripsi, deskripsi_en: deskripsi_en || undefined },
    });
    return NextResponse.json(cpl);
  } catch (error) {
    console.error("Error creating CPL:", error);
    return NextResponse.json({ error: "Failed to create CPL" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, kode, deskripsi, deskripsi_en } = body;

    const kodeErr = validateKode("cpl", kode ?? "");
    if (kodeErr) return NextResponse.json({ error: kodeErr }, { status: 400 });

    const cpl = await prisma.cPL.update({
      where: { id },
      data: { kode, deskripsi, deskripsi_en: deskripsi_en || undefined },
    });
    return NextResponse.json(cpl);
  } catch (error) {
    console.error("Error updating CPL:", error);
    return NextResponse.json({ error: "Failed to update CPL" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const cpl = await prisma.cPL.findUnique({
      where: { id },
      include: { _count: { select: { pi: true } } },
    });
    if (cpl && cpl._count.pi > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus CPL yang memiliki PI" },
        { status: 400 }
      );
    }

    await prisma.cPL.delete({ where: { id } });
    return NextResponse.json({ message: "CPL deleted successfully" });
  } catch (error) {
    console.error("Error deleting CPL:", error);
    return NextResponse.json({ error: "Failed to delete CPL" }, { status: 500 });
  }
}
