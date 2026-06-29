import { NextRequest, NextResponse } from "next/server";
import { calculateLaporanCPL } from "@/lib/cplEngine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const angkatan = searchParams.get("angkatan") || "all";

    const laporan = await calculateLaporanCPL(angkatan);
    return NextResponse.json(laporan);
  } catch (error) {
    console.error("Error fetching laporan CPL:", error);
    return NextResponse.json({ error: "Failed to fetch laporan" }, { status: 500 });
  }
}
