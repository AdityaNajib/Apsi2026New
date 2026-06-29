import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUploadedFile } from "@/lib/parseUpload";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const kelasId = (formData.get("kelasId") as string | null)?.trim();

    if (!file) {
      return NextResponse.json({ error: "File Excel/CSV wajib diupload" }, { status: 400 });
    }
    if (!kelasId) {
      return NextResponse.json({ error: "kelasId diperlukan" }, { status: 400 });
    }

    const fname = file.name.toLowerCase();
    if (!fname.endsWith(".csv") && !fname.endsWith(".xlsx") && !fname.endsWith(".xls")) {
      return NextResponse.json({ error: "Format file tidak didukung. Gunakan .csv, .xlsx, atau .xls" }, { status: 400 });
    }

    const kelas = await prisma.kelas.findUnique({ where: { id: kelasId } });
    if (!kelas) {
      return NextResponse.json({ error: "Kelas tidak ditemukan" }, { status: 404 });
    }

    const rows = await parseUploadedFile(file);
    if (rows.length === 0) {
      return NextResponse.json({ error: "File kosong atau format tidak valid" }, { status: 400 });
    }

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    const results: { row: number; status: "success" | "skip" | "error"; message: string; nama?: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      const nama = (row["nama"] || "").trim();
      const bobot_raw = (row["bobot"] || "").trim();

      if (!nama || !bobot_raw) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: "Kolom nama dan bobot wajib diisi", nama });
        continue;
      }

      const bobot = parseFloat(bobot_raw);
      if (isNaN(bobot) || bobot < 0 || bobot > 100) {
        errorCount++;
        results.push({ row: rowNum, status: "error", message: `Bobot '${bobot_raw}' tidak valid (harus angka 0–100)`, nama });
        continue;
      }

      const existing = await prisma.komponenNilai.findFirst({
        where: { nama, kelasId },
      });
      if (existing) {
        skipCount++;
        results.push({ row: rowNum, status: "skip", message: "Sudah ada, dilewati", nama });
        continue;
      }

      await prisma.komponenNilai.create({
        data: { nama, bobot, kelasId },
      });
      successCount++;
      results.push({ row: rowNum, status: "success", message: "Berhasil ditambahkan", nama });
    }

    return NextResponse.json({ successCount, skipCount, errorCount, results });
  } catch (error: any) {
    console.error("Error import komponen nilai:", error);
    return NextResponse.json({ error: error.message || "Gagal import komponen nilai" }, { status: 500 });
  }
}
