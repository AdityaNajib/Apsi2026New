"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { GraduationCap, Award, BookOpen, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import SimplePieChart from "@/components/charts/SimplePieChart";
import SimpleBarChart from "@/components/charts/SimpleBarChart";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface Profile {
  name: string;
  nim: string;
  angkatan: string;
  semester: number;
  ipk: string;
  jumlahMk: number;
}

interface CPLResult {
  kode: string;
  deskripsi: string;
  nilai: number;
  target: number;
  status: string;
  hasData: boolean;
}

export default function MahasiswaDashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [cplResults, setCplResults] = useState<CPLResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { saveScroll, restoreScroll } = useScrollRestore();

  useEffect(() => {
    saveScroll();
    Promise.all([
      fetch('/api/mahasiswa/profile').then((r) => r.json()),
      fetch('/api/mahasiswa/cpl').then((r) => r.json()),
    ])
      .then(([p, c]) => {
        setProfile(p);
        setCplResults(Array.isArray(c) ? c : []);
      })
      .catch(console.error)
      .finally(() => { setLoading(false); restoreScroll(); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const tercapai = cplResults.filter((c) => c.status === "Tercapai").length;
  const belum = cplResults.filter((c) => c.status === "Tidak Tercapai").length;
  const belumData = cplResults.filter((c) => c.status === "Belum Ada Data").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Dashboard Mahasiswa</h2>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Pantau progres dan capaian pembelajaran Anda.</p>
      </div>

      {/* Profil Card */}
      <div
        className="rounded-2xl p-6 flex items-center gap-6"
        style={{ background: "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)", boxShadow: "0 8px 32px rgba(67,97,238,0.25)" }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,0.25)" }}
        >
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-white">{profile?.name ?? "—"}</h3>
          <p className="text-white/75 text-sm mt-1">
            NIM: {profile?.nim ?? "—"} · Angkatan {profile?.angkatan ?? "—"} · Teknik Industri UNS
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white font-medium" style={{ background: "rgba(255,255,255,0.15)" }}>
              <BookOpen className="w-3.5 h-3.5" />
              Semester {profile?.semester ?? "—"}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white font-medium" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Award className="w-3.5 h-3.5" />
              IPK: {profile?.ipk ?? "—"}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white font-medium" style={{ background: "rgba(255,255,255,0.15)" }}>
              <GraduationCap className="w-3.5 h-3.5" />
              {tercapai}/{cplResults.length} CPL Tercapai
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardContent className="p-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#d1fae5" }}>
              <CheckCircle className="w-5 h-5" style={{ color: "#059669" }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>CPL Tercapai</p>
              <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{tercapai}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#fee2e2" }}>
              <XCircle className="w-5 h-5" style={{ color: "#dc2626" }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>Belum Tercapai</p>
              <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{belum}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#fef3c7" }}>
              <AlertCircle className="w-5 h-5" style={{ color: "#d97706" }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>Belum Ada Data</p>
              <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{belumData}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
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
                  { label: "Tercapai", value: tercapai, color: "#059669" },
                  { label: "Belum Tercapai", value: belum, color: "#dc2626" },
                  { label: "Belum Ada Data", value: belumData, color: "#d97706" },
                ].filter(d => d.value > 0)}
                size={200}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Detail Pencapaian CPL</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-48 flex items-center justify-center">
                <div className="animate-pulse" style={{ background: "#f1f5f9", height: 200 }} />
              </div>
            ) : cplResults.filter(c => c.hasData).length > 0 ? (
              <SimpleBarChart
                data={cplResults
                  .filter(c => c.hasData)
                  .slice(0, 6)
                  .map(c => ({
                    label: c.kode,
                    value: c.nilai,
                    color: c.nilai >= c.target ? "#059669" : "#dc2626"
                  }))}
                height={250}
                showValues={true}
              />
            ) : (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>Belum ada data nilai CPL</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CPL Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rincian Nilai CPL</CardTitle>
          <a href="/mahasiswa/cpl" className="text-sm font-semibold" style={{ color: "#4361ee" }}>Detail →</a>
        </CardHeader>
        <CardContent>
          {cplResults.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>Belum ada data CPL</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    {["Kode", "Deskripsi", "Nilai", "Target", "Status"].map((h) => (
                      <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cplResults.map((cpl) => (
                    <tr key={cpl.kode} style={{ borderBottom: "1px solid #f8faff" }}>
                      <td className="py-3 pr-3">
                        <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "#eef2ff", color: "#4361ee" }}>{cpl.kode}</span>
                      </td>
                      <td className="py-3 pr-3 text-xs" style={{ color: "#64748b" }}>{cpl.deskripsi}</td>
                      <td className="py-3 pr-3 font-bold" style={{ color: "#1a1d2e" }}>
                        {cpl.hasData ? cpl.nilai : "—"}
                      </td>
                      <td className="py-3 pr-3" style={{ color: "#64748b" }}>{cpl.target}</td>
                      <td className="py-3">
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-lg"
                          style={
                            cpl.status === "Tercapai"
                              ? { background: "#d1fae5", color: "#059669" }
                              : cpl.status === "Tidak Tercapai"
                              ? { background: "#fee2e2", color: "#dc2626" }
                              : { background: "#fef3c7", color: "#d97706" }
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
