import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUploadedFile } from "@/lib/parseUpload";
import { validateKode } from "@/lib/kodeValidation";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "File Excel/CSV wajib diupload" }, { status: 400 });
    }

    const fname = file.name.toLowerCase();
    if (!fname.endsWith(".csv") && !fname.endsWith(".xlsx") && !fname.endsWith(".xls")) {
      return NextResponse.json({ error: "Format file tidak didukung. Gunakan .csv, .xlsx, atau .xls" }, { status: 400 });
    }

    const rows = await parseUploadedFile(file);
    if (rows.length === 0) {
      return NextResponse.json({ error: "File kosong atau format tidak valid" }, { status: 400 });
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const results: { row: number; status: "success" | "skip" | "error"; message: string; kode?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      const kode = (row["kode"] || "").trim();
      const deskripsi = (row["deskripsi"] || "").trim();
      const deskripsi_en = (row["deskripsi_en"] || "").trim();

      if (!kode || !deskripsi) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: "Kolom kode dan deskripsi wajib diisi", kode });
        continue;
      }

      const kodeErr = validateKode("cpl", kode);
      if (kodeErr) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: kodeErr, kode });
        continue;
      }

      const existing = await prisma.cPL.findUnique({ where: { kode } });
      if (existing) {
        skipCount++;
        results.push({ row: rowNum, status: "skip", message: "Sudah ada, dilewati", kode });
        continue;
      }

      await prisma.cPL.create({
        data: { kode, deskripsi, deskripsi_en: deskripsi_en || undefined },
      });
      successCount++;
      results.push({ row: rowNum, status: "success", message: "Berhasil ditambahkan", kode });
    }

    return NextResponse.json({ successCount, skipCount, errorCount, results });
  } catch (error: any) {
    console.error("Error import CPL:", error);
    return NextResponse.json({ error: error.message || "Gagal import CPL" }, { status: 500 });
  }
}
