/**
 * POST /api/kaprodi/mapping/cpl-pi
 * Toggle PI membership in a CPL.
 * Body: { cplId, piId, linked: boolean }
 *
 * When linked=true  → update PI.cplId = cplId
 * When linked=false → PI must not be assigned to another CPL; just remove by
 *                     setting cplId to a "null" CPL — actually in our schema PI
 *                     has a non-nullable cplId. We handle unlink by creating a
 *                     placeholder or by preventing unlink if CPMK data exists.
 *
 * Strategy: PI.cplId is the FK. To "unlink" we reassign piId to a special
 * "unassigned" placeholder, OR we just prevent it and let the UI show a warning.
 * For simplicity: we allow relinking. To unlink we check if it's safe.
 */
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
      // Link PI → CPL
      await prisma.pI.update({ where: { id: piId }, data: { cplId } });
    } else {
      // Unlink: only allowed if PI has no CPMK with data
      const cpmkCount = await prisma.cPMK.count({ where: { piId } });
      if (cpmkCount > 0) {
        return NextResponse.json(
          { error: `PI ${pi.kode} masih memiliki ${cpmkCount} CPMK terhubung. Lepas CPMK terlebih dahulu.` },
          { status: 409 }
        );
      }
      // Re-assign to self (no real "unlink" since cplId is required)
      // We create an "unassigned" approach: keep current cplId unchanged but
      // remove from this CPL by setting to a different CPL or we track via a
      // junction. Since schema uses direct FK, we can't truly "unlink" without
      // changing the schema. Instead: we move PI to a "virtual" CPL with kode="UNASSIGNED"
      // OR we just disallow. For now: warn user.
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
