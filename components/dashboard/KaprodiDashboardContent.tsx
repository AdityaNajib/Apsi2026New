"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, BookOpen, Target, FileCheck2, TrendingUp } from "lucide-react";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import SimplePieChart from "@/components/charts/SimplePieChart";

interface Props {
  role: "KAPRODI" | "JAMU";
}

export default function KaprodiDashboardContent({ role }: Props) {
  const [stats, setStats] = useState({
    totalCpl: 0,
    totalPi: 0,
    totalCpmk: 0,
    totalMahasiswa: 0,
    cplTercapai: 0,
    cplBelumTercapai: 0,
  });
  const [loading, setLoading] = useState(true);

  const prefix = role === "KAPRODI" ? "/kaprodi" : "/jamu";
  const title = role === "KAPRODI" ? "Dashboard Ketua Program Studi" : "Dashboard Penjaminan Mutu";

  useEffect(() => {
    Promise.all([
      fetch("/api/kaprodi/kurikulum?type=cpl").then((r) => r.json()),
      fetch("/api/kaprodi/kurikulum?type=pi").then((r) => r.json()),
      fetch("/api/kaprodi/kurikulum?type=cpmk").then((r) => r.json()),
      fetch("/api/kaprodi/laporan-cpl?angkatan=all").then((r) => r.json()),
    ])
      .then(([cpl, pi, cpmk, laporan]) => {
        const laporanArr = Array.isArray(laporan) ? laporan : [];
        const allMhs = new Set<number>();
        laporanArr.forEach((l: any) => allMhs.add(l.jumlahMahasiswa));

        setStats({
          totalCpl: Array.isArray(cpl) ? cpl.length : 0,
          totalPi: Array.isArray(pi) ? pi.length : 0,
          totalCpmk: Array.isArray(cpmk) ? cpmk.length : 0,
          totalMahasiswa: laporanArr.reduce((s: number, l: any) => Math.max(s, l.jumlahMahasiswa ?? 0), 0),
          cplTercapai: laporanArr.filter((l: any) => l.persentaseTercapai >= 70).length,
          cplBelumTercapai: laporanArr.filter((l: any) => l.persentaseTercapai < 70).length,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: "Total CPL", value: stats.totalCpl.toString(), sub: `${stats.cplTercapai} tercapai`, icon: Target, iconBg: "#ede9fe", iconColor: "#7c3aed", trend: `${stats.cplTercapai}/${stats.totalCpl} tercapai`, trendUp: stats.cplTercapai > 0 },
    { title: "Total PI", value: stats.totalPi.toString(), sub: "Performance Indicators", icon: BookOpen, iconBg: "#dbeafe", iconColor: "#2563eb", trend: "aktif", trendUp: true },
    { title: "Total CPMK", value: stats.totalCpmk.toString(), sub: "Capaian MK", icon: FileCheck2, iconBg: "#d1fae5", iconColor: "#059669", trend: "terdefinisi", trendUp: true },
    { title: "Total Mahasiswa", value: stats.totalMahasiswa.toString(), sub: "Dengan data nilai", icon: Users, iconBg: "#fef3c7", iconColor: "#d97706", trend: "terdaftar", trendUp: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{title}</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Monitoring capaian pembelajaran dan evaluasi OBE berbasis IABEE.
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href={`${prefix}/data-kurikulum`}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 14px rgba(67,97,238,0.3)" }}
          >
            <BookOpen className="w-4 h-4" />
            Data Kurikulum
          </a>
          <a
            href={`${prefix}/laporan-cpl`}
            className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
            style={{ background: "#eef2ff", color: "#4361ee" }}
          >
            <TrendingUp className="w-4 h-4" />
            Laporan CPL
          </a>
        </div>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[0,1,2,3].map((i) => (
            <Card key={i}>
              <CardContent className="p-0 h-24 animate-pulse" style={{ background: "#f1f5f9" }}>
                <div />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {statCards.map((s, i) => (
            <Card key={i}>
              <CardContent className="p-0">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: s.iconBg }}>
                    <s.icon className="w-5 h-5" style={{ color: s.iconColor }} />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-lg"
                    style={{ background: s.trendUp ? "#d1fae5" : "#fee2e2", color: s.trendUp ? "#059669" : "#dc2626" }}>
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
      )}

      {/* CPL Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle>Status Pencapaian CPL</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full animate-pulse" style={{ background: "#f1f5f9" }} />
              </div>
            ) : (
              <SimplePieChart
                data={[
                  { label: "Tercapai (≥70%)", value: stats.cplTercapai, color: "#059669" },
                  { label: "Perlu Perbaikan (<70%)", value: stats.cplBelumTercapai, color: "#dc2626" },
                ]}
                size={200}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Distribusi Kurikulum</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-pulse" style={{ background: "#f1f5f9", height: 200 }} />
              </div>
            ) : (
              <SimpleBarChart
                data={[
                  { label: "CPL", value: stats.totalCpl, color: "#7c3aed" },
                  { label: "PI", value: stats.totalPi, color: "#2563eb" },
                  { label: "CPMK", value: stats.totalCpmk, color: "#059669" },
                ]}
                height={250}
                showValues={true}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <Card>
        <CardHeader><CardTitle>Akses Cepat</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              ...(role === "KAPRODI" ? [{ label: "Manajemen Admin", href: `/kaprodi/manajemen-admin`, color: "#2563eb", bg: "#dbeafe" }] : []),
              { label: "Edit CPL", href: `${prefix}/data-kurikulum`, color: "#7c3aed", bg: "#ede9fe" },
              { label: "Edit PI", href: `${prefix}/data-kurikulum`, color: "#059669", bg: "#d1fae5" },
              { label: "Laporan CPL", href: `${prefix}/laporan-cpl`, color: "#d97706", bg: "#fef3c7" },
            ].map((q) => (
              <a
                key={q.label}
                href={q.href}
                className="flex flex-col items-center gap-2 p-4 rounded-xl text-center text-sm font-semibold transition-all hover:shadow-md"
                style={{ background: q.bg, color: q.color }}
              >
                {q.label}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
