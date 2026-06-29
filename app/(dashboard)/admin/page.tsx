"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Users, BookOpen, Target, GraduationCap,
  TrendingUp, School, PenTool, UserCheck, FileCheck2,
} from "lucide-react";
import Link from "next/link";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import SimplePieChart from "@/components/charts/SimplePieChart";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface Stats {
  totalDosen: number;
  totalMahasiswa: number;
  totalKelas: number;
  totalMataKuliah: number;
  totalCpl: number;
  mahasiswaPerAngkatan: Record<string, number>;
  mahasiswaPerStatus: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { saveScroll, restoreScroll } = useScrollRestore();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    saveScroll();
    try {
      const [dosenRes, mhsRes, kelasRes, mkRes, cplRes] = await Promise.all([
        fetch("/api/admin/pengguna/dosen"),
        fetch("/api/admin/pengguna/mahasiswa"),
        fetch("/api/admin/kelas"),
        fetch("/api/admin/mata-kuliah"),
        fetch("/api/admin/kurikulum?type=cpl"),
      ]);

      const [dosen, mhs, kelas, mk, cpl] = await Promise.all([
        dosenRes.json(),
        mhsRes.json(),
        kelasRes.json(),
        mkRes.json(),
        cplRes.json(),
      ]);

      const mhsArr = Array.isArray(mhs) ? mhs : [];
      const angkatanMap: Record<string, number> = {};
      const statusMap: Record<string, number> = { AKTIF: 0, CUTI: 0, LULUS: 0, NON_AKTIF: 0 };
      mhsArr.forEach((m: any) => {
        angkatanMap[m.angkatan] = (angkatanMap[m.angkatan] ?? 0) + 1;
        const s = m.status ?? 'AKTIF';
        statusMap[s] = (statusMap[s] ?? 0) + 1;
      });

      setStats({
        totalDosen: Array.isArray(dosen) ? dosen.length : 0,
        totalMahasiswa: mhsArr.length,
        totalKelas: Array.isArray(kelas) ? kelas.length : 0,
        totalMataKuliah: Array.isArray(mk) ? mk.length : 0,
        totalCpl: Array.isArray(cpl) ? cpl.length : 0,
        mahasiswaPerAngkatan: angkatanMap,
        mahasiswaPerStatus: statusMap,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      restoreScroll();
    }
  };

  const quickLinks = [
    { label: "Manajemen Pengguna", href: "/admin/manajemen-pengguna", icon: Users, bg: "#dbeafe", color: "#2563eb", desc: "Tambah/edit dosen & mahasiswa" },
    { label: "Akademik", href: "/admin/akademik", icon: BookOpen, bg: "#d1fae5", color: "#059669", desc: "Mata kuliah, kelas, dan nilai" },
    { label: "Data Kurikulum", href: "/admin/data-kurikulum", icon: Target, bg: "#ede9fe", color: "#7c3aed", desc: "Kelola CPL, PI, dan CPMK" },
    { label: "Laporan CPL", href: "/admin/laporan-cpl", icon: FileCheck2, bg: "#fef3c7", color: "#d97706", desc: "Laporan pencapaian CPL" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Dashboard Admin Prodi</h2>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          Kelola pengguna, kelas, mata kuliah, dan nilai Program Studi Teknik Industri UNS.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[0,1,2,3].map((i) => (
            <Card key={i}>
              <CardContent className="p-0 h-20 animate-pulse rounded-2xl" style={{ background: "#f1f5f9" }}>
                <div />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: "Total Dosen", value: stats?.totalDosen ?? 0, icon: UserCheck, bg: "#dbeafe", color: "#2563eb" },
            { label: "Total Mahasiswa", value: stats?.totalMahasiswa ?? 0, icon: GraduationCap, bg: "#ede9fe", color: "#7c3aed" },
            { label: "Total Kelas", value: stats?.totalKelas ?? 0, icon: School, bg: "#d1fae5", color: "#059669" },
            { label: "Mata Kuliah", value: stats?.totalMataKuliah ?? 0, icon: BookOpen, bg: "#fef3c7", color: "#d97706" },
          ].map((s, i) => (
            <Card key={i}>
              <CardContent className="p-0 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>{s.label}</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: "#1a1d2e" }}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Mahasiswa per angkatan + CPL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card>
          <CardHeader><CardTitle>Mahasiswa per Angkatan</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[0,1,2,3].map(i => <div key={i} className="h-8 rounded-lg animate-pulse" style={{ background: "#f1f5f9" }} />)}
              </div>
            ) : stats && Object.keys(stats.mahasiswaPerAngkatan).length > 0 ? (
              <SimpleBarChart
                data={Object.entries(stats.mahasiswaPerAngkatan)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .map(([angkatan, count]) => ({
                    label: angkatan,
                    value: count
                  }))}
                height={250}
                showValues={true}
              />
            ) : (
              <p className="text-sm text-center py-6" style={{ color: "#94a3b8" }}>Belum ada mahasiswa</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Distribusi Status Mahasiswa</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-2 gap-3">
                {[0,1,2,3].map(i => <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "#f1f5f9" }} />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Aktif",     key: "AKTIF",     bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)", color: "#059669", icon: "✓" },
                  { label: "Cuti",      key: "CUTI",      bg: "linear-gradient(135deg, #fef3c7, #fde68a)", color: "#d97706", icon: "⏸" },
                  { label: "Lulus",     key: "LULUS",     bg: "linear-gradient(135deg, #dbeafe, #93c5fd)", color: "#4361ee", icon: "🎓" },
                  { label: "Non-Aktif", key: "NON_AKTIF", bg: "linear-gradient(135deg, #fee2e2, #fecaca)", color: "#dc2626", icon: "✗" },
                ].map((d) => (
                  <div
                    key={d.key}
                    className="relative p-4 rounded-xl overflow-hidden group hover:scale-105 transition-transform"
                    style={{ background: d.bg }}
                  >
                    <div className="absolute top-2 right-2 text-2xl opacity-20">{d.icon}</div>
                    <div className="relative z-10">
                      <p className="text-xs font-semibold mb-1" style={{ color: d.color }}>{d.label}</p>
                      <p className="text-3xl font-bold" style={{ color: d.color }}>
                        {stats?.mahasiswaPerStatus?.[d.key] ?? 0}
                      </p>
                      <div className="mt-2 w-full h-1 rounded-full opacity-30" style={{ background: d.color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <Card>
        <CardHeader><CardTitle>Akses Cepat</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickLinks.map((q) => (
              <Link
                key={q.href}
                href={q.href}
                className="flex flex-col gap-2 p-4 rounded-2xl border transition-all hover:shadow-md hover:-translate-y-0.5"
                style={{ background: q.bg, borderColor: "transparent" }}
              >
                <q.icon className="w-6 h-6" style={{ color: q.color }} />
                <p className="font-bold text-sm" style={{ color: q.color }}>{q.label}</p>
                <p className="text-xs" style={{ color: "#64748b" }}>{q.desc}</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
