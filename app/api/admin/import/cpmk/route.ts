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
      const kode_pi = (row["kode_pi"] || "").trim();
      const kode_mk = (row["kode_mk"] || "").trim();

      if (!kode || !deskripsi || !kode_pi || !kode_mk) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: "Kolom kode, deskripsi, kode_pi, dan kode_mk wajib diisi", kode });
        continue;
      }

      const kodeErr = validateKode("cpmk", kode);
      if (kodeErr) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: kodeErr, kode });
        continue;
      }

      const pi = await prisma.pI.findUnique({ where: { kode: kode_pi } });
      if (!pi) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: `PI '${kode_pi}' tidak ditemukan`, kode });
        continue;
      }

      const mk = await prisma.mataKuliah.findUnique({ where: { kode: kode_mk } });
      if (!mk) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: `Mata Kuliah '${kode_mk}' tidak ditemukan`, kode });
        continue;
      }

      const existing = await prisma.cPMK.findFirst({
        where: { kode, piId: pi.id, mkId: mk.id },
      });
      if (existing) {
        skipCount++;
        results.push({ row: rowNum, status: "skip", message: "Sudah ada, dilewati", kode });
        continue;
      }

      await prisma.cPMK.create({
        data: { kode, deskripsi, piId: pi.id, mkId: mk.id },
      });
      successCount++;
      results.push({ row: rowNum, status: "success", message: "Berhasil ditambahkan", kode });
    }

    return NextResponse.json({ successCount, skipCount, errorCount, results });
  } catch (error: any) {
    console.error("Error import CPMK:", error);
    return NextResponse.json({ error: error.message || "Gagal import CPMK" }, { status: 500 });
  }
}
