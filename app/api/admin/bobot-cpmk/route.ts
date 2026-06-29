import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get all bobot CPMK (Admin can see all)
export async function GET(request: NextRequest) {
  try {
    const bobotData = await prisma.bobotCPMK.findMany({
      include: {
        cpmk: {
          select: { kode: true, deskripsi: true },
        },
        komponen: {
          select: {
            id: true,
            nama: true,
            bobot: true,
            kelasId: true,
            kelas: {
              select: {
                nama: true,
                tahun_ajaran: true,
                mataKuliah: {
                  select: { id: true, kode: true, nama: true },
                },
              },
            },
          },
        },
      },
    });
    return NextResponse.json(bobotData);
  } catch (error) {
    console.error("Error fetching bobot CPMK:", error);
    return NextResponse.json({ error: "Failed to fetch bobot CPMK" }, { status: 500 });
  }
}

// POST - Create new Bobot CPMK (Admin can create for any class)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cpmkId, komponenId, bobot } = body;

    // Validate required fields
    if (!cpmkId || !komponenId || bobot === undefined || bobot === null) {
      return NextResponse.json(
        { error: "cpmkId, komponenId, dan bobot wajib diisi" },
        { status: 400 }
      );
    }

    // Validate bobot range
    const bobotNum = parseFloat(bobot);
    if (isNaN(bobotNum) || bobotNum < 0 || bobotNum > 100) {
      return NextResponse.json(
        { error: "Bobot harus berupa angka antara 0-100" },
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
        { error: "Bobot untuk CPMK dan Komponen ini sudah ada. Gunakan Edit jika ingin mengubah." },
        { status: 400 }
      );
    }

    const bobotCpmk = await prisma.bobotCPMK.create({
      data: { cpmkId, komponenId, bobot: bobotNum },
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

    return NextResponse.json(bobotCpmk, { status: 201 });
  } catch (error) {
    console.error("Error creating Bobot CPMK:", error);
    return NextResponse.json({ error: "Failed to create Bobot CPMK" }, { status: 500 });
  }
}

// PUT - Update Bobot CPMK (Admin can update any)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, cpmkId, komponenId, bobot } = body;

    if (!id) {
      return NextResponse.json({ error: "ID wajib diisi" }, { status: 400 });
    }

    // Validate required fields
    if (!cpmkId || !komponenId || bobot === undefined || bobot === null) {
      return NextResponse.json(
        { error: "cpmkId, komponenId, dan bobot wajib diisi" },
        { status: 400 }
      );
    }

    // Validate bobot range
    const bobotNum = parseFloat(bobot);
    if (isNaN(bobotNum) || bobotNum < 0 || bobotNum > 100) {
      return NextResponse.json(
        { error: "Bobot harus berupa angka antara 0-100" },
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
        { error: "Kombinasi CPMK dan Komponen ini sudah ada pada record lain" },
        { status: 400 }
      );
    }

    const bobotCpmk = await prisma.bobotCPMK.update({
      where: { id },
      data: { cpmkId, komponenId, bobot: bobotNum },
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

// DELETE - Delete Bobot CPMK (Admin can delete any)
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
