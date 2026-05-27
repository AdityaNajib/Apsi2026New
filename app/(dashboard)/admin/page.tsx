"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import RadarChartCPL from "@/components/charts/RadarChart";
import { Users, BookOpen, FileCheck2, Target, Upload, Download, Calendar } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Total CPL Evaluated", value: "12", sub: "75% Complete", icon: Target, iconBg: "#ede9fe", iconColor: "#7c3aed", trend: "+2 baru", trendUp: true },
    { title: "Total PI Mapped", value: "48", sub: "Semua aktif", icon: BookOpen, iconBg: "#dbeafe", iconColor: "#2563eb", trend: "+5 baru", trendUp: true },
    { title: "Total CPMK Defined", value: "156", sub: "4 Perlu Review", icon: FileCheck2, iconBg: "#d1fae5", iconColor: "#059669", trend: "4 review", trendUp: false },
    { title: "Total Mahasiswa", value: "1,248", sub: "Angkatan 2020–2024", icon: Users, iconBg: "#fef3c7", iconColor: "#d97706", trend: "+64 baru", trendUp: true },
  ];

  const deadlines = [
    { date: "OCT\n15", title: "Finalize Semester PI", sub: "Kaprodi Approval Required", urgent: false },
    { date: "NOV\n01", title: "Curriculum Audit", sub: "Kaprodi Approval Required", urgent: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Dashboard Overview</h2>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Academic profile and CPL management overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: s.iconBg }}>
                  <s.icon className="w-5 h-5" style={{ color: s.iconColor }} />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ background: s.trendUp ? "#d1fae5" : "#fee2e2", color: s.trendUp ? "#059669" : "#dc2626" }}>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Radar CPL Mahasiswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ height: "320px" }}>
              <RadarChartCPL />
            </div>
          </CardContent>
        </Card>

        {/* Right Panel */}
        <div className="space-y-5">
          {/* Staff Registration */}
          <Card>
            <CardHeader>
              <CardTitle>Staff Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs mb-1.5 font-medium" style={{ color: "#64748b" }}>Email Address</p>
                <input
                  type="email"
                  placeholder="staff@uns.ac.id"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                />
              </div>
              <div>
                <p className="text-xs mb-1.5 font-medium" style={{ color: "#64748b" }}>Role Assignment</p>
                <select className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none" style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}>
                  <option>Administrator</option>
                  <option>Dosen</option>
                </select>
              </div>
              <button className="w-full py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                Register Staff
              </button>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <Calendar className="w-4 h-4" style={{ color: "#94a3b8" }} />
            </CardHeader>
            <CardContent className="space-y-3">
              {deadlines.map((d, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "#f8faff", border: "1px solid #e9edf4" }}>
                  <div className="text-center min-w-[40px]">
                    {d.date.split("\n").map((part, j) => (
                      <p key={j} className={j === 0 ? "text-xs font-bold" : "text-lg font-extrabold"} style={{ color: "#4361ee", lineHeight: 1.1 }}>{part}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#1a1d2e" }}>{d.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>{d.sub}</p>
                  </div>
                </div>
              ))}
              <button className="w-full text-sm font-semibold text-center mt-1" style={{ color: "#4361ee" }}>
                View Full Calendar →
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Upload, label: "Import Data Kurikulum", sub: "Upload file Excel (.xlsx)", color: "#4361ee", bg: "#eef2ff" },
              { icon: Upload, label: "Import Data Pengampu", sub: "Upload file Excel (.xlsx)", color: "#7c3aed", bg: "#ede9fe" },
              { icon: Download, label: "Export Laporan CPL", sub: "Download PDF untuk Akreditasi", color: "#059669", bg: "#d1fae5" },
            ].map((action, i) => (
              <button key={i} className="flex items-center gap-4 p-4 rounded-xl text-left transition-all hover:shadow-md" style={{ background: action.bg, border: `1.5px solid ${action.bg}` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: action.color }}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#1a1d2e" }}>{action.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{action.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
