/**
 * POST /api/kaprodi/mapping/cpmk-komponen
 * Toggle KomponenNilai in a CPMK and set its bobot.
 * Body: { cpmkId, komponenId, linked: boolean, bobot?: number }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { cpmkId, komponenId, linked, bobot } = await request.json();

    if (!cpmkId || !komponenId || linked === undefined) {
      return NextResponse.json({ error: "cpmkId, komponenId, linked wajib" }, { status: 400 });
    }

    if (linked) {
      // Upsert BobotCPMK
      const existing = await prisma.bobotCPMK.findFirst({
        where: { cpmkId, komponenId },
      });
      if (existing) {
        // Update bobot if provided
        if (bobot !== undefined) {
          await prisma.bobotCPMK.update({
            where: { id: existing.id },
            data: { bobot: parseFloat(bobot) },
          });
        }
      } else {
        await prisma.bobotCPMK.create({
          data: {
            cpmkId,
            komponenId,
            bobot: bobot !== undefined ? parseFloat(bobot) : 0,
          },
        });
      }
    } else {
      // Delete BobotCPMK entry
      await prisma.bobotCPMK.deleteMany({ where: { cpmkId, komponenId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling CPMK-Komponen:", error);
    return NextResponse.json({ error: "Gagal menyimpan" }, { status: 500 });
  }
}

/**
 * PATCH /api/kaprodi/mapping/cpmk-komponen
 * Update bobot only.
 * Body: { cpmkId, komponenId, bobot: number }
 */
export async function PATCH(request: NextRequest) {
  try {
    const { cpmkId, komponenId, bobot } = await request.json();

    if (!cpmkId || !komponenId || bobot === undefined) {
      return NextResponse.json({ error: "cpmkId, komponenId, bobot wajib" }, { status: 400 });
    }

    const existing = await prisma.bobotCPMK.findFirst({ where: { cpmkId, komponenId } });
    if (!existing) {
      return NextResponse.json({ error: "Relasi tidak ditemukan" }, { status: 404 });
    }

    await prisma.bobotCPMK.update({
      where: { id: existing.id },
      data: { bobot: parseFloat(bobot) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating bobot:", error);
    return NextResponse.json({ error: "Gagal menyimpan bobot" }, { status: 500 });
  }
}
