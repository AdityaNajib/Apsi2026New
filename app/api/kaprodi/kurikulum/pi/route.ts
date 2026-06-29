import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateKode } from "@/lib/kodeValidation";

// POST - Create new PI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { kode, deskripsi, cplId } = body;

    const kodeErr = validateKode("pi", kode ?? "");
    if (kodeErr) return NextResponse.json({ error: kodeErr }, { status: 400 });

    const existing = await prisma.pI.findUnique({ where: { kode } });
    if (existing) {
      return NextResponse.json({ error: "Kode PI sudah ada" }, { status: 400 });
    }

    const pi = await prisma.pI.create({
      data: { kode, deskripsi, cplId },
      include: {
        cpl: { select: { kode: true } },
        _count: { select: { cpmk: true } },
      },
    });
    return NextResponse.json(pi);
  } catch (error) {
    console.error("Error creating PI:", error);
    return NextResponse.json({ error: "Failed to create PI" }, { status: 500 });
  }
}

// PUT - Update PI
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, kode, deskripsi, cplId } = body;

    const kodeErr = validateKode("pi", kode ?? "");
    if (kodeErr) return NextResponse.json({ error: kodeErr }, { status: 400 });

    const pi = await prisma.pI.update({
      where: { id },
      data: { kode, deskripsi, cplId },
      include: {
        cpl: { select: { kode: true } },
        _count: { select: { cpmk: true } },
      },
    });
    return NextResponse.json(pi);
  } catch (error) {
    console.error("Error updating PI:", error);
    return NextResponse.json({ error: "Failed to update PI" }, { status: 500 });
  }
}

// DELETE - Delete PI
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    // Check if PI has CPMK
    const pi = await prisma.pI.findUnique({
      where: { id },
      include: { _count: { select: { cpmk: true } } },
    });

    if (pi && pi._count.cpmk > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus PI yang memiliki CPMK" },
        { status: 400 }
      );
    }

    await prisma.pI.delete({
      where: { id },
    });

    return NextResponse.json({ message: "PI deleted successfully" });
  } catch (error) {
    console.error("Error deleting PI:", error);
    return NextResponse.json({ error: "Failed to delete PI" }, { status: 500 });
  }
}
