"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import RadarChartCPL from "@/components/charts/RadarChart";
import { GraduationCap, Award, BookOpen, Download, LogOut } from "lucide-react";

export default function MahasiswaDashboard() {
  const cplResults = [
    { id: 1, cpl: "CPL 1", deskripsi: "Kemampuan Teknik", nilai: 85, status: "Tercapai" },
    { id: 2, cpl: "CPL 2", deskripsi: "Analisis Masalah", nilai: 90, status: "Tercapai" },
    { id: 3, cpl: "CPL 3", deskripsi: "Desain Rekayasa", nilai: 78, status: "Tercapai" },
    { id: 4, cpl: "CPL 4", deskripsi: "Investigasi", nilai: 65, status: "Tidak Tercapai" },
    { id: 5, cpl: "CPL 5", deskripsi: "Penggunaan Alat", nilai: 92, status: "Tercapai" },
    { id: 6, cpl: "CPL 6", deskripsi: "Etika Profesional", nilai: 75, status: "Tercapai" },
    { id: 7, cpl: "CPL 7", deskripsi: "Komunikasi", nilai: 68, status: "Tidak Tercapai" },
    { id: 8, cpl: "CPL 8", deskripsi: "Lingkungan & Keberlanjutan", nilai: 85, status: "Tercapai" },
    { id: 9, cpl: "CPL 9", deskripsi: "Etika", nilai: 82, status: "Tercapai" },
    { id: 10, cpl: "CPL 10", deskripsi: "Manajemen Proyek", nilai: 89, status: "Tercapai" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Dashboard Mahasiswa</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Pantau progres dan capaian pembelajaran Anda.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
              document.cookie = "name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
              window.location.href = "/login";
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#dc2626"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fee2e2"; (e.currentTarget as HTMLElement).style.color = "#dc2626"; }}
          >
            <LogOut className="w-4 h-4" />
            Keluar / Ganti Akun
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 14px rgba(67,97,238,0.3)" }}
          >
            <Download className="w-4 h-4" />
            Download Laporan PDF
          </button>
        </div>
      </div>

      {/* Profil Card */}
      <div
        className="rounded-2xl p-6 flex items-center gap-6"
        style={{
          background: "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)",
          boxShadow: "0 8px 32px rgba(67,97,238,0.25)",
        }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,0.25)" }}
        >
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-white">Aditya Pratama</h3>
          <p className="text-white/75 text-sm mt-1">NIM: I0323045 · Angkatan 2023 · Teknik Industri UNS</p>
          <div className="flex flex-wrap gap-3 mt-4">
            {[
              { icon: BookOpen, label: "Semester 5" },
              { icon: Award, label: "IPK: 3.85" },
              { icon: GraduationCap, label: "8/10 CPL Tercapai" },
            ].map((tag, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white font-medium" style={{ background: "rgba(255,255,255,0.15)" }}>
                <tag.icon className="w-3.5 h-3.5" />
                {tag.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Radar + Table */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Pemetaan CPL (Radar Chart)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: "340px" }}>
              <RadarChartCPL />
            </div>
          </CardContent>
        </Card>

        {/* CPL Table */}
        <Card>
          <CardHeader>
            <CardTitle>Rincian Nilai CPL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto" style={{ maxHeight: "360px" }}>
              <table className="w-full text-sm">
                <thead className="sticky top-0" style={{ background: "#f8faff" }}>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    {["Kode", "Deskripsi", "Nilai", "Status"].map((h) => (
                      <th key={h} className="pb-3 pt-1 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cplResults.map((cpl) => (
                    <tr key={cpl.id} style={{ borderBottom: "1px solid #f8faff" }}>
                      <td className="py-3 pr-3 font-bold text-xs" style={{ color: "#4361ee" }}>{cpl.cpl}</td>
                      <td className="py-3 pr-3 text-xs" style={{ color: "#64748b" }}>{cpl.deskripsi}</td>
                      <td className="py-3 pr-3 font-bold" style={{ color: "#1a1d2e" }}>{cpl.nilai}</td>
                      <td className="py-3">
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-lg"
                          style={
                            cpl.status === "Tercapai"
                              ? { background: "#d1fae5", color: "#059669" }
                              : { background: "#fee2e2", color: "#dc2626" }
                          }
                        >
                          {cpl.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
