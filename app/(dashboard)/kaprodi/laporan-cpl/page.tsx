"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import RadarChartCPL from "@/components/charts/RadarChart";
import { Download, Filter, TrendingUp, TrendingDown, Users, Target } from "lucide-react";

interface LaporanCPL {
  cplKode: string;
  cplDeskripsi: string;
  rataRata: number;
  jumlahMahasiswa: number;
  tercapai: number;
  belumTercapai: number;
  persentaseTercapai: number;
}

export default function LaporanCPLPage() {
  const [laporan, setLaporan] = useState<LaporanCPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAngkatan, setFilterAngkatan] = useState("all");

  useEffect(() => {
    fetchLaporan();
  }, [filterAngkatan]);

  const fetchLaporan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kaprodi/laporan-cpl?angkatan=${filterAngkatan}`);
      const data = await res.json();
      setLaporan(data);
    } catch (error) {
      console.error("Error fetching laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      const res = await fetch(`/api/kaprodi/laporan-cpl/export?format=${format}&angkatan=${filterAngkatan}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-cpl-${filterAngkatan}.${format}`;
      a.click();
    } catch (error) {
      console.error("Error exporting:", error);
    }
  };

  const totalMahasiswa = laporan.reduce((sum, l) => sum + l.jumlahMahasiswa, 0) / (laporan.length || 1);
  const avgPersentase = laporan.reduce((sum, l) => sum + l.persentaseTercapai, 0) / (laporan.length || 1);
  const cplTercapai = laporan.filter(l => l.persentaseTercapai >= 70).length;
  const cplBelumTercapai = laporan.length - cplTercapai;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>
            Laporan CPL
          </h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Monitoring capaian pembelajaran lulusan
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={filterAngkatan}
            onChange={(e) => setFilterAngkatan(e.target.value)}
            className="px-4 py-2 rounded-xl border text-sm font-medium"
            style={{ borderColor: "#e2e8f0", color: "#64748b" }}
          >
            <option value="all">Semua Angkatan</option>
            <option value="2024">Angkatan 2024</option>
            <option value="2023">Angkatan 2023</option>
            <option value="2022">Angkatan 2022</option>
            <option value="2021">Angkatan 2021</option>
          </select>
          <button
            onClick={() => handleExport("csv")}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            <Download className="w-4 h-4" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#ede9fe" }}>
                <Target className="w-6 h-6" style={{ color: "#7c3aed" }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{laporan.length}</p>
                <p className="text-sm" style={{ color: "#94a3b8" }}>Total CPL</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#d1fae5" }}>
                <TrendingUp className="w-6 h-6" style={{ color: "#059669" }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{cplTercapai}</p>
                <p className="text-sm" style={{ color: "#94a3b8" }}>CPL Tercapai</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#fee2e2" }}>
                <TrendingDown className="w-6 h-6" style={{ color: "#dc2626" }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{cplBelumTercapai}</p>
                <p className="text-sm" style={{ color: "#94a3b8" }}>Belum Tercapai</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#dbeafe" }}>
                <Users className="w-6 h-6" style={{ color: "#2563eb" }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{Math.round(totalMahasiswa)}</p>
                <p className="text-sm" style={{ color: "#94a3b8" }}>Rata-rata Mahasiswa</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart & Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Visualisasi CPL</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px", width: "100%" }}>
              <RadarChartCPL />
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#f0fdf4" }}>
                <span className="text-sm font-medium" style={{ color: "#059669" }}>Tercapai (≥70%)</span>
                <span className="text-lg font-bold" style={{ color: "#059669" }}>{cplTercapai}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "#fef2f2" }}>
                <span className="text-sm font-medium" style={{ color: "#dc2626" }}>Belum Tercapai (&lt;70%)</span>
                <span className="text-lg font-bold" style={{ color: "#dc2626" }}>{cplBelumTercapai}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Detail Capaian CPL</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>CPL</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Deskripsi</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Rata-rata</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Mahasiswa</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {laporan.map((item) => (
                      <tr key={item.cplKode} style={{ borderBottom: "1px solid #f8faff" }}>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-lg font-semibold text-sm" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                            {item.cplKode}
                          </span>
                        </td>
                        <td className="py-4" style={{ color: "#1a1d2e" }}>{item.cplDeskripsi}</td>
                        <td className="py-4">
                          <div>
                            <p className="font-bold text-lg" style={{ color: "#1a1d2e" }}>{item.rataRata.toFixed(1)}</p>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>{item.persentaseTercapai.toFixed(0)}% tercapai</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <div>
                            <p className="font-semibold" style={{ color: "#059669" }}>{item.tercapai} tercapai</p>
                            <p className="text-xs" style={{ color: "#dc2626" }}>{item.belumTercapai} belum</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <span
                            className="px-3 py-1 rounded-lg text-xs font-semibold"
                            style={{
                              background: item.persentaseTercapai >= 70 ? "#d1fae5" : "#fee2e2",
                              color: item.persentaseTercapai >= 70 ? "#059669" : "#dc2626",
                            }}
                          >
                            {item.persentaseTercapai >= 70 ? "Tercapai" : "Perlu Perbaikan"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
