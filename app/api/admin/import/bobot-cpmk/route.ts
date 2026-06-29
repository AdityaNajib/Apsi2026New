import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUploadedFile } from "@/lib/parseUpload";

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
      const komponen_id = (row["komponen_id"] || "").trim();
      const kode_cpmk = (row["kode_cpmk"] || "").trim();
      const kode_mk = (row["kode_mk"] || "").trim();
      const bobot_raw = (row["bobot"] || "").trim();

      if (!komponen_id || !kode_cpmk || !kode_mk || !bobot_raw) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: "Kolom komponen_id, kode_cpmk, kode_mk, dan bobot wajib diisi" });
        continue;
      }

      const bobot = parseFloat(bobot_raw);
      if (isNaN(bobot) || bobot < 0 || bobot > 100) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: `Bobot '${bobot_raw}' tidak valid (harus angka 0–100)` });
        continue;
      }

      const komponen = await prisma.komponenNilai.findUnique({ where: { id: komponen_id } });
      if (!komponen) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: `Komponen nilai '${komponen_id}' tidak ditemukan` });
        continue;
      }

      const mk = await prisma.mataKuliah.findUnique({ where: { kode: kode_mk } });
      if (!mk) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: `Mata Kuliah '${kode_mk}' tidak ditemukan` });
        continue;
      }

      const cpmk = await prisma.cPMK.findFirst({ where: { kode: kode_cpmk, mkId: mk.id } });
      if (!cpmk) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: `CPMK '${kode_cpmk}' untuk MK '${kode_mk}' tidak ditemukan` });
        continue;
      }

      const existing = await prisma.bobotCPMK.findFirst({
        where: { komponenId: komponen.id, cpmkId: cpmk.id },
      });
      if (existing) {
        skipCount++;
        results.push({ row: rowNum, status: "skip", message: "Sudah ada, dilewati", kode: kode_cpmk });
        continue;
      }

      await prisma.bobotCPMK.create({
        data: { komponenId: komponen.id, cpmkId: cpmk.id, bobot },
      });
      successCount++;
      results.push({ row: rowNum, status: "success", message: "Berhasil ditambahkan", kode: kode_cpmk });
    }

    return NextResponse.json({ successCount, skipCount, errorCount, results });
  } catch (error: any) {
    console.error("Error import bobot CPMK:", error);
    return NextResponse.json({ error: error.message || "Gagal import bobot CPMK" }, { status: 500 });
  }
}
