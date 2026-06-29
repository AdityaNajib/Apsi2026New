import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Create new Bobot CPMK
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpmkId, komponenId, bobot } = body;

    // Validate bobot range
    if (bobot < 0 || bobot > 100) {
      return NextResponse.json(
        { error: "Bobot harus antara 0-100" },
        { status: 400 }
      );
    }

    // Check if combination already exists
    const existing = await prisma.bobotCPMK.findFirst({
      where: {
        cpmkId,
        komponenId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bobot untuk CPMK dan Komponen ini sudah ada" },
        { status: 400 }
      );
    }

    const bobotCpmk = await prisma.bobotCPMK.create({
      data: { cpmkId, komponenId, bobot },
      include: {
        cpmk: { select: { kode: true, deskripsi: true } },
        komponen: {
          select: {
            nama: true,
            bobot: true,
            kelas: {
              select: {
                nama: true,
                tahun_ajaran: true,
                mataKuliah: { select: { kode: true, nama: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(bobotCpmk);
  } catch (error) {
    console.error("Error creating Bobot CPMK:", error);
    return NextResponse.json({ error: "Failed to create Bobot CPMK" }, { status: 500 });
  }
}

// PUT - Update Bobot CPMK
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, cpmkId, komponenId, bobot } = body;

    // Validate bobot range
    if (bobot < 0 || bobot > 100) {
      return NextResponse.json(
        { error: "Bobot harus antara 0-100" },
        { status: 400 }
      );
    }

    // Check if updating to combination that already exists (excluding current record)
    const existing = await prisma.bobotCPMK.findFirst({
      where: {
        cpmkId,
        komponenId,
        NOT: { id },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bobot untuk CPMK dan Komponen ini sudah ada" },
        { status: 400 }
      );
    }

    const bobotCpmk = await prisma.bobotCPMK.update({
      where: { id },
      data: { cpmkId, komponenId, bobot },
      include: {
        cpmk: { select: { kode: true, deskripsi: true } },
        komponen: {
          select: {
            nama: true,
            bobot: true,
            kelas: {
              select: {
                nama: true,
                tahun_ajaran: true,
                mataKuliah: { select: { kode: true, nama: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(bobotCpmk);
  } catch (error) {
    console.error("Error updating Bobot CPMK:", error);
    return NextResponse.json({ error: "Failed to update Bobot CPMK" }, { status: 500 });
  }
}

// DELETE - Delete Bobot CPMK
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID required" }, { status: 400 });
    }

    await prisma.bobotCPMK.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Bobot CPMK deleted successfully" });
  } catch (error) {
    console.error("Error deleting Bobot CPMK:", error);
    return NextResponse.json({ error: "Failed to delete Bobot CPMK" }, { status: 500 });
  }
}

