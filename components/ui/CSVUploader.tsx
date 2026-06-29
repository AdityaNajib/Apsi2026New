"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle, XCircle, Download, FileText, FileSpreadsheet } from "lucide-react";

interface ImportResult {
  row: number;
  status: "success" | "error" | "skip" | "updated";
  message: string;
  name?: string;
  nim?: string;
  kelas?: string;
  kode?: string;
  nama?: string;
}

interface ImportResponse {
  successCount: number;
  errorCount: number;
  skipCount?: number;
  updatedCount?: number;
  results: ImportResult[];
  komponenTersedia?: string[];
  kelasInfo?: { nama: string; mataKuliah: string; kode: string };
}

interface CSVUploaderProps {
  title: string;
  endpoint: string;
  /** Extra form fields to append (e.g. { kelasId: "xxx" }) */
  extraFields?: Record<string, string>;
  /** Extra URL query params (e.g. { mode: "update" }) */
  queryParams?: Record<string, string>;
  /** Template CSV content for building xlsx download */
  templateContent: string;
  templateFileName: string;
  /** Column description shown to user */
  formatInfo: string;
  onSuccess?: () => void;
}

const ACCEPTED = ".csv,.xlsx,.xls";
const ACCEPTED_LABEL = ".csv, .xlsx, .xls";

export default function CSVUploader({
  title,
  endpoint,
  extraFields,
  queryParams,
  templateContent,
  templateFileName,
  formatInfo,
  onSuccess,
}: CSVUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const isValidFile = (name: string) =>
    name.endsWith(".csv") || name.endsWith(".xlsx") || name.endsWith(".xls");

  const handleFile = async (file: File) => {
    if (!isValidFile(file.name)) {
      setError(`Format tidak didukung. Gunakan ${ACCEPTED_LABEL}`);
      return;
    }
    setFileName(file.name);
    setError("");
    setResult(null);
    setUploading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);
      if (extraFields) {
        Object.entries(extraFields).forEach(([k, v]) => fd.append(k, v));
      }

      const url = queryParams
        ? `${endpoint}?${new URLSearchParams(queryParams).toString()}`
        : endpoint;

      const res = await fetch(url, { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengupload");
        return;
      }

      setResult(data);
      if (data.successCount > 0 && onSuccess) onSuccess();
    } catch {
      setError("Terjadi kesalahan saat upload");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      // Build xlsx on client using the SheetJS CDN-style dynamic import
      const XLSX = await import("xlsx");

      const lines = templateContent.replace(/\r/g, "").split("\n").filter(Boolean);
      const rows = lines.map((l) => l.split(",").map((v) => v.trim()));

      const ws = XLSX.utils.aoa_to_sheet(rows);
      const colWidths = rows[0].map((_, ci) =>
        Math.max(...rows.map((r) => String(r[ci] ?? "").length)) + 4
      );
      ws["!cols"] = colWidths.map((w) => ({ wch: w }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");

      // Replace .csv extension with .xlsx if present
      const xlsxName = templateFileName.replace(/\.csv$/i, ".xlsx");
      XLSX.writeFile(wb, xlsxName);
    } catch {
      // Fallback: download as CSV
      const blob = new Blob([templateContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = templateFileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const reset = () => {
    setResult(null);
    setError("");
    setFileName("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const isExcel = (name: string) => name.endsWith(".xlsx") || name.endsWith(".xls");

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold" style={{ color: "#1a1d2e" }}>{title}</p>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          style={{ background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#dcfce7"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f0fdf4"; }}
        >
          <Download className="w-3.5 h-3.5" />
          Download Template Excel
        </button>
      </div>

      {/* Format info */}
      <div className="px-3 py-2 rounded-lg text-xs" style={{ background: "#fef9c3", color: "#854d0e" }}>
        <span className="font-semibold">Format kolom: </span>{formatInfo}
      </div>

      {/* Accepted formats badge */}
      <div className="flex items-center gap-2 text-xs" style={{ color: "#64748b" }}>
        <span>Format yang diterima:</span>
        {[".xlsx", ".xls", ".csv"].map((ext) => (
          <span key={ext} className="px-2 py-0.5 rounded-md font-semibold"
            style={{ background: ext.startsWith(".xlsx") || ext.startsWith(".xls") ? "#d1fae5" : "#dbeafe", color: ext.startsWith(".xlsx") || ext.startsWith(".xls") ? "#059669" : "#2563eb" }}>
            {ext}
          </span>
        ))}
      </div>

      {/* Drop zone */}
      {!result && (
        <div
          className="relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all"
          style={{
            borderColor: dragging ? "#4361ee" : "#e2e8f0",
            background: dragging ? "#eef2ff" : "#f8fafc",
          }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
              <p className="text-sm font-medium" style={{ color: "#4361ee" }}>
                Memproses {fileName}...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: dragging ? "#c7d2fe" : "#eef2ff" }}>
                {fileName && isExcel(fileName)
                  ? <FileSpreadsheet className="w-7 h-7" style={{ color: "#059669" }} />
                  : <Upload className="w-7 h-7" style={{ color: "#4361ee" }} />
                }
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1a1d2e" }}>
                  {fileName ? fileName : "Klik atau drag & drop file"}
                </p>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                  {ACCEPTED_LABEL}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
          style={{ background: "#fee2e2", color: "#dc2626" }}>
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-4 rounded-xl"
            style={{ background: result.errorCount === 0 ? "#f0fdf4" : "#fffbeb" }}>
            <FileText className="w-5 h-5 shrink-0"
              style={{ color: result.errorCount === 0 ? "#059669" : "#d97706" }} />
            <div className="flex-1">
              <p className="text-sm font-bold"
                style={{ color: result.errorCount === 0 ? "#059669" : "#d97706" }}>
                {result.successCount} ditambahkan
                {result.updatedCount ? `, ${result.updatedCount} diperbarui` : ""}
                {result.skipCount ? `, ${result.skipCount} dilewati` : ""}
                {result.errorCount ? `, ${result.errorCount} gagal` : ""}
              </p>
              {result.komponenTersedia && (
                <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                  Komponen: {result.komponenTersedia.join(", ")}
                </p>
              )}
              {result.kelasInfo && (
                <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                  Kelas: {result.kelasInfo.kode} — {result.kelasInfo.mataKuliah} ({result.kelasInfo.nama})
                </p>
              )}
            </div>
            <button onClick={reset} className="p-1 hover:bg-black/5 rounded-lg">
              <X className="w-4 h-4" style={{ color: "#64748b" }} />
            </button>
          </div>

          <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#e2e8f0" }}>
            <div className="max-h-52 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0" style={{ background: "#f8fafc" }}>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <th className="px-3 py-2 text-left font-semibold" style={{ color: "#94a3b8" }}>Baris</th>
                    <th className="px-3 py-2 text-left font-semibold" style={{ color: "#94a3b8" }}>Data</th>
                    <th className="px-3 py-2 text-left font-semibold" style={{ color: "#94a3b8" }}>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {result.results.map((r) => (
                    <tr key={r.row} style={{ borderBottom: "1px solid #f1f5f9" }}>
                      <td className="px-3 py-2 font-mono" style={{ color: "#94a3b8" }}>#{r.row}</td>
                      <td className="px-3 py-2 font-semibold" style={{ color: "#1a1d2e" }}>
                        {r.kode || r.kelas || r.name || r.nim || r.nama || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-1.5"
                          style={{
                            color: r.status === "success" || r.status === "updated"
                              ? "#059669"
                              : r.status === "skip"
                              ? "#d97706"
                              : "#dc2626",
                          }}>
                          {r.status === "success" || r.status === "updated"
                            ? <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                            : r.status === "skip"
                            ? <CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ opacity: 0.6 }} />
                            : <XCircle className="w-3.5 h-3.5 shrink-0" />
                          }
                          {r.message}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: "#f1f5f9", color: "#64748b" }}
          >
            Upload File Lain
          </button>
        </div>
      )}
    </div>
  );
}
