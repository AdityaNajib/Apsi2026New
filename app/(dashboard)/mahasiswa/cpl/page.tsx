"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import RadarChartCPL from "@/components/charts/RadarChart";
import { Award, TrendingUp, Target, CheckCircle, XCircle } from "lucide-react";

export default function HasilCPLPage() {
  const cplResults = [
    { id: 1, kode: "CPL 1", deskripsi: "Kemampuan Teknik", nilai: 85, target: 70, status: "Tercapai" },
    { id: 2, kode: "CPL 2", deskripsi: "Analisis Masalah", nilai: 90, target: 70, status: "Tercapai" },
    { id: 3, kode: "CPL 3", deskripsi: "Desain Rekayasa", nilai: 78, target: 70, status: "Tercapai" },
    { id: 4, kode: "CPL 4", deskripsi: "Investigasi", nilai: 65, target: 70, status: "Tidak Tercapai" },
    { id: 5, kode: "CPL 5", deskripsi: "Penggunaan Alat", nilai: 92, target: 70, status: "Tercapai" },
    { id: 6, kode: "CPL 6", deskripsi: "Etika Profesional", nilai: 75, target: 70, status: "Tercapai" },
    { id: 7, kode: "CPL 7", deskripsi: "Komunikasi", nilai: 68, target: 70, status: "Tidak Tercapai" },
    { id: 8, kode: "CPL 8", deskripsi: "Lingkungan & Keberlanjutan", nilai: 85, target: 70, status: "Tercapai" },
    { id: 9, kode: "CPL 9", deskripsi: "Etika", nilai: 82, target: 70, status: "Tercapai" },
    { id: 10, kode: "CPL 10", deskripsi: "Manajemen Proyek", nilai: 89, target: 70, status: "Tercapai" },
    { id: 11, kode: "CPL 11", deskripsi: "Pembelajaran Berkelanjutan", nilai: 88, target: 70, status: "Tercapai" },
    { id: 12, kode: "CPL 12", deskripsi: "Kewirausahaan", nilai: 76, target: 70, status: "Tercapai" },
  ];

  const tercapai = cplResults.filter((c) => c.status === "Tercapai").length;
  const tidakTercapai = cplResults.filter((c) => c.status === "Tidak Tercapai").length;
  const rataRata = Math.round(cplResults.reduce((sum, c) => sum + c.nilai, 0) / cplResults.length);

  const stats = [
    {
      title: "CPL Tercapai",
      value: `${tercapai}/${cplResults.length}`,
      icon: CheckCircle,
      iconBg: "#d1fae5",
      iconColor: "#059669",
    },
    {
      title: "CPL Tidak Tercapai",
      value: tidakTercapai.toString(),
      icon: XCircle,
      iconBg: "#fee2e2",
      iconColor: "#dc2626",
    },
    {
      title: "Rata-rata CPL",
      value: rataRata.toString(),
      icon: TrendingUp,
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
    },
    {
      title: "Target Minimal",
      value: "70",
      icon: Target,
      iconBg: "#fef3c7",
      iconColor: "#d97706",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>
          Hasil Capaian Pembelajaran Lulusan (CPL)
        </h2>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          Visualisasi dan detail pencapaian CPL Anda
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-0 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: s.iconBg }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.iconColor }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>
                  {s.title}
                </p>
                <p className="text-2xl font-bold mt-0.5" style={{ color: "#1a1d2e" }}>
                  {s.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Pemetaan CPL (Radar Chart)</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ height: "400px" }}>
            <RadarChartCPL />
          </div>
        </CardContent>
      </Card>

      {/* CPL Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Rincian Nilai CPL
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                  {["Kode CPL", "Deskripsi", "Target", "Nilai", "Selisih", "Status"].map((h) => (
                    <th
                      key={h}
                      className="pb-3 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "#94a3b8" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cplResults.map((cpl) => {
                  const selisih = cpl.nilai - cpl.target;
                  return (
                    <tr key={cpl.id} style={{ borderBottom: "1px solid #f8faff" }}>
                      <td className="py-3 pr-4">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded-lg"
                          style={{ background: "#eef2ff", color: "#4361ee" }}
                        >
                          {cpl.kode}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-medium" style={{ color: "#1a1d2e" }}>
                        {cpl.deskripsi}
                      </td>
                      <td className="py-3 pr-4" style={{ color: "#64748b" }}>
                        {cpl.target}
                      </td>
                      <td className="py-3 pr-4">
                        <span className="text-base font-bold" style={{ color: "#4361ee" }}>
                          {cpl.nilai}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: selisih >= 0 ? "#059669" : "#dc2626" }}
                        >
                          {selisih >= 0 ? "+" : ""}
                          {selisih}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg"
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
