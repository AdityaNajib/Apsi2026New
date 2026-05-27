"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import RadarChartCPL from "@/components/charts/RadarChart";
import { Users, BookOpen, Target, FileCheck2, TrendingUp } from "lucide-react";

export default function KaprodiDashboard() {
  const stats = [
    {
      title: "Total CPL Evaluated",
      value: "12",
      sub: "75% Complete",
      icon: Target,
      iconBg: "#ede9fe",
      iconColor: "#7c3aed",
      trend: "+2 bulan ini",
      trendUp: true,
    },
    {
      title: "Total PI Mapped",
      value: "48",
      sub: "Semua aktif",
      icon: BookOpen,
      iconBg: "#dbeafe",
      iconColor: "#2563eb",
      trend: "+5 baru",
      trendUp: true,
    },
    {
      title: "Total CPMK Defined",
      value: "156",
      sub: "4 Perlu Review",
      icon: FileCheck2,
      iconBg: "#d1fae5",
      iconColor: "#059669",
      trend: "4 perlu review",
      trendUp: false,
    },
    {
      title: "Total Mahasiswa",
      value: "1,248",
      sub: "Angkatan 2020–2024",
      icon: Users,
      iconBg: "#fef3c7",
      iconColor: "#d97706",
      trend: "+64 baru",
      trendUp: true,
    },
  ];

  const kurikulumData = [
    { kode: "TI-001", nama: "Data Structures", cpl: "CPL 01, 02, 03, 04", pi: 4, status: "Active" },
    { kode: "TI-002", nama: "Artificial Intelligence", cpl: "CPL 01, 05, 06", pi: 6, status: "In Progress" },
    { kode: "TI-003", nama: "Database Systems", cpl: "CPL 01, 02", pi: 3, status: "Needs Review" },
    { kode: "TI-004", nama: "Software Engineering", cpl: "CPL 03, 04, 05", pi: 5, status: "Active" },
  ];

  const statusStyle = (status: string) => {
    if (status === "Active") return { bg: "#d1fae5", color: "#059669" };
    if (status === "In Progress") return { bg: "#fef3c7", color: "#d97706" };
    return { bg: "#fee2e2", color: "#dc2626" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>
            Dashboard Overview
          </h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Academic performance and CPL management overview.
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 14px rgba(67,97,238,0.3)" }}
        >
          <TrendingUp className="w-4 h-4" />
          Academic Year 2025/2026
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center"
                  style={{ background: s.iconBg }}
                >
                  <s.icon className="w-5 h-5" style={{ color: s.iconColor }} />
                </div>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-lg"
                  style={{
                    background: s.trendUp ? "#d1fae5" : "#fee2e2",
                    color: s.trendUp ? "#059669" : "#dc2626",
                  }}
                >
                  {s.trend}
                </span>
              </div>
              <p className="text-3xl font-bold mb-1" style={{ color: "#1a1d2e" }}>{s.value}</p>
              <p className="text-sm font-semibold mb-0.5" style={{ color: "#1a1d2e" }}>{s.title}</p>
              <p className="text-xs" style={{ color: "#94a3b8" }}>{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Curriculum Mapping Table */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Curriculum Mapping</CardTitle>
            <a href="#" className="text-sm font-semibold" style={{ color: "#4361ee" }}>See all →</a>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    {["Course Name", "CPL Ref.", "PI Count", "Status", "Action"].map((h) => (
                      <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kurikulumData.map((row, i) => {
                    const st = statusStyle(row.status);
                    return (
                      <tr key={i} style={{ borderBottom: "1px solid #f8faff" }}>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                              {row.kode.split("-")[1]}
                            </div>
                            <div>
                              <p className="font-semibold text-sm" style={{ color: "#1a1d2e" }}>{row.nama}</p>
                              <p className="text-xs" style={{ color: "#94a3b8" }}>{row.kode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-xs" style={{ color: "#64748b" }}>{row.cpl}</td>
                        <td className="py-3.5 pr-4">
                          <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: "#dbeafe", color: "#2563eb" }}>
                            {row.pi} Indicators
                          </span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: st.bg, color: st.color }}>
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <button className="text-xs font-semibold" style={{ color: "#4361ee" }}>Edit</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Radar CPL Lulusan</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: "300px", width: "100%" }}>
              <RadarChartCPL />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3 text-center" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                <p className="text-2xl font-bold" style={{ color: "#059669" }}>8</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#059669" }}>CPL Tercapai</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
                <p className="text-2xl font-bold" style={{ color: "#dc2626" }}>2</p>
                <p className="text-xs font-medium mt-0.5" style={{ color: "#dc2626" }}>Belum Tercapai</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
