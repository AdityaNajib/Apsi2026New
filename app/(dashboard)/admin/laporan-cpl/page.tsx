"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import RadarChartCPL from "@/components/charts/RadarChart";
import { Download, Target, TrendingUp, TrendingDown, Users } from "lucide-react";

interface LaporanItem {
  cplKode: string;
  cplDeskripsi: string;
  rataRata: number;
  jumlahMahasiswa: number;
  tercapai: number;
  belumTercapai: number;
  persentaseTercapai: number;
}

export default function AdminLaporanCPLPage() {
  const [laporan, setLaporan] = useState<LaporanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [angkatan, setAngkatan] = useState("all");

  useEffect(() => {
    loadLaporan();
  }, [angkatan]);

  const loadLaporan = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kaprodi/laporan-cpl?angkatan=${angkatan}`);
      const data = await res.json();
      setLaporan(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      setLaporan([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: "csv" | "pdf") => {
    alert(`Export ${format.toUpperCase()} akan segera tersedia`);
  };

  const totalMhs = laporan.length > 0 ? Math.round(laporan.reduce((sum, l) => sum + l.jumlahMahasiswa, 0) / laporan.length) : 0;
  const cplTercapai = laporan.filter(l => l.persentaseTercapai >= 70).length;
  const cplBelum = laporan.length - cplTercapai;

  const stats = [
    { title: "Total CPL", value: laporan.length, icon: Target, bg: "#ede9fe", color: "#7c3aed" },
    { title: "CPL Tercapai", value: cplTercapai, icon: TrendingUp, bg: "#d1fae5", color: "#059669" },
    { title: "Belum Tercapai", value: cplBelum, icon: TrendingDown, bg: "#fee2e2", color: "#dc2626" },
    { title: "Rata-rata Mhs", value: totalMhs, icon: Users, bg: "#dbeafe", color: "#2563eb" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Laporan CPL</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Monitoring capaian pembelajaran lulusan</p>
        </div>
        <div className="flex gap-3">
          <select
            value={angkatan}
            onChange={(e) => setAngkatan(e.target.value)}
            className="px-4 py-2 rounded-xl border text-sm"
            style={{ borderColor: "#e2e8f0" }}
          >
            <option value="all">Semua Angkatan</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
            <option value="2021">2021</option>
          </select>
          <button
            onClick={() => handleExport("csv")}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon className="w-6 h-6" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{s.value}</p>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>{s.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
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
                <span className="text-sm font-medium" style={{ color: "#dc2626" }}>Belum (&lt;70%)</span>
                <span className="text-lg font-bold" style={{ color: "#dc2626" }}>{cplBelum}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Detail Capaian CPL</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
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
                          <p className="font-bold text-lg" style={{ color: "#1a1d2e" }}>{item.rataRata.toFixed(1)}</p>
                          <p className="text-xs" style={{ color: "#94a3b8" }}>{item.persentaseTercapai.toFixed(0)}%</p>
                        </td>
                        <td className="py-4">
                          <p className="font-semibold" style={{ color: "#059669" }}>{item.tercapai} tercapai</p>
                          <p className="text-xs" style={{ color: "#dc2626" }}>{item.belumTercapai} belum</p>
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
