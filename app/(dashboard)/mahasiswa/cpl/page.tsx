"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Award, TrendingUp, Target, CheckCircle, XCircle, AlertCircle, Download, FileText } from "lucide-react";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface CPLResult {
  kode: string;
  deskripsi: string;
  nilai: number;
  target: number;
  status: string;
  hasData: boolean;
}

export default function HasilCPLPage() {
  const [cplResults, setCplResults] = useState<CPLResult[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);
  const { saveScroll, restoreScroll } = useScrollRestore();

  useEffect(() => {
    saveScroll();
    Promise.all([
      fetch('/api/mahasiswa/cpl').then((r) => r.json()),
      fetch('/api/mahasiswa/profile').then((r) => r.json()),
    ])
      .then(([cpl, p]) => {
        setCplResults(Array.isArray(cpl) ? cpl : []);
        setProfile(p);
      })
      .catch(console.error)
      .finally(() => { setLoading(false); restoreScroll(); });
  }, []);

  const handleDownloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const withData = cplResults.filter((c) => c.hasData);
  const tercapai = cplResults.filter((c) => c.status === "Tercapai").length;
  const tidakTercapai = cplResults.filter((c) => c.status === "Tidak Tercapai").length;
  const belumData = cplResults.filter((c) => c.status === "Belum Ada Data").length;
  const rataRata = withData.length > 0
    ? Math.round(withData.reduce((sum, c) => sum + c.nilai, 0) / withData.length)
    : 0;

  const stats = [
    { title: "CPL Tercapai", value: `${tercapai}/${cplResults.length}`, icon: CheckCircle, iconBg: "#d1fae5", iconColor: "#059669" },
    { title: "Tidak Tercapai", value: tidakTercapai.toString(), icon: XCircle, iconBg: "#fee2e2", iconColor: "#dc2626" },
    { title: "Rata-rata Nilai", value: withData.length > 0 ? rataRata.toString() : "—", icon: TrendingUp, iconBg: "#dbeafe", iconColor: "#2563eb" },
    { title: "Target Minimal", value: "70", icon: Target, iconBg: "#fef3c7", iconColor: "#d97706" },
  ];

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #cpl-print-area, #cpl-print-area * { visibility: visible; }
          #cpl-print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 24px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Hasil Capaian Pembelajaran Lulusan (CPL)</h2>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Detail pencapaian CPL Anda berdasarkan nilai yang telah diinput</p>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="no-print flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 14px rgba(67,97,238,0.3)" }}
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 no-print">
          {stats.map((s, i) => (
            <Card key={i}>
              <CardContent className="p-0 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: s.iconBg }}>
                  <s.icon className="w-5 h-5" style={{ color: s.iconColor }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>{s.title}</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: "#1a1d2e" }}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Progress bars - screen only */}
        <Card className="no-print">
          <CardHeader>
            <CardTitle><div className="flex items-center gap-2"><Award className="w-5 h-5" />Progress CPL</div></CardTitle>
          </CardHeader>
          <CardContent>
            {cplResults.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>Belum ada data CPL</p>
            ) : (
              <div className="space-y-4">
                {cplResults.map((cpl) => {
                  const pct = cpl.hasData ? Math.min((cpl.nilai / 100) * 100, 100) : 0;
                  const barColor = cpl.status === "Tercapai" ? "#059669" : cpl.status === "Tidak Tercapai" ? "#dc2626" : "#d97706";
                  return (
                    <div key={cpl.kode}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: "#eef2ff", color: "#4361ee" }}>{cpl.kode}</span>
                          <span className="text-sm" style={{ color: "#64748b" }}>{cpl.deskripsi}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: "#1a1d2e" }}>{cpl.hasData ? cpl.nilai : "—"}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                            style={cpl.status === "Tercapai" ? { background: "#d1fae5", color: "#059669" }
                              : cpl.status === "Tidak Tercapai" ? { background: "#fee2e2", color: "#dc2626" }
                              : { background: "#fef3c7", color: "#d97706" }}>
                            {cpl.status}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "#f1f5f9" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── PRINT AREA ── */}
        <div id="cpl-print-area">
          {/* Header PDF */}
          <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: "2px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1a1d2e", margin: 0 }}>
                  Laporan Ketercapaian CPL
                </h1>
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
                  Program Studi Teknik Industri — Universitas Sebelas Maret
                </p>
              </div>
              <div style={{ textAlign: "right", fontSize: 12, color: "#64748b" }}>
                <p style={{ margin: 0 }}>Tanggal: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            </div>
          </div>

          {/* Info mahasiswa */}
          {profile && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20, padding: 16, background: "#f8fafc", borderRadius: 8 }}>
              <div><span style={{ color: "#64748b", fontSize: 12 }}>Nama</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{profile.name}</p></div>
              <div><span style={{ color: "#64748b", fontSize: 12 }}>NIM</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{profile.nim}</p></div>
              <div><span style={{ color: "#64748b", fontSize: 12 }}>Angkatan</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{profile.angkatan}</p></div>
              <div><span style={{ color: "#64748b", fontSize: 12 }}>IPK</span><p style={{ fontWeight: 600, margin: "2px 0 0" }}>{profile.ipk}</p></div>
            </div>
          )}

          {/* Ringkasan */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 20 }}>
            {[
              { label: "CPL Tercapai", value: `${tercapai}/${cplResults.length}`, color: "#059669", bg: "#d1fae5" },
              { label: "Tidak Tercapai", value: tidakTercapai, color: "#dc2626", bg: "#fee2e2" },
              { label: "Rata-rata Nilai", value: withData.length > 0 ? rataRata : "—", color: "#2563eb", bg: "#dbeafe" },
              { label: "Target Minimal", value: 70, color: "#d97706", bg: "#fef3c7" },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabel CPL */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#f1f5f9" }}>
                {["Kode CPL", "Deskripsi", "Target", "Nilai", "Selisih", "Status"].map((h) => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#64748b", fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cplResults.map((cpl, i) => {
                const selisih = cpl.hasData ? cpl.nilai - cpl.target : null;
                const statusColor = cpl.status === "Tercapai" ? "#059669" : cpl.status === "Tidak Tercapai" ? "#dc2626" : "#d97706";
                const statusBg = cpl.status === "Tercapai" ? "#d1fae5" : cpl.status === "Tidak Tercapai" ? "#fee2e2" : "#fef3c7";
                return (
                  <tr key={cpl.kode} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 700, color: "#4361ee" }}>{cpl.kode}</td>
                    <td style={{ padding: "8px 10px", color: "#1a1d2e" }}>{cpl.deskripsi}</td>
                    <td style={{ padding: "8px 10px", color: "#64748b" }}>{cpl.target}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 700, color: cpl.hasData ? "#1a1d2e" : "#94a3b8" }}>{cpl.hasData ? cpl.nilai.toFixed(1) : "—"}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 600, color: selisih === null ? "#94a3b8" : selisih >= 0 ? "#059669" : "#dc2626" }}>
                      {selisih === null ? "—" : (selisih >= 0 ? "+" : "") + selisih.toFixed(1)}
                    </td>
                    <td style={{ padding: "8px 10px" }}>
                      <span style={{ background: statusBg, color: statusColor, padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
                        {cpl.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p style={{ marginTop: 24, fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
            Dicetak pada {new Date().toLocaleString("id-ID")} — Sistem Informasi CPL Teknik Industri UNS
          </p>
        </div>

        {/* Detail table - screen */}
        <Card className="no-print">
          <CardHeader><CardTitle>Rincian Detail CPL</CardTitle></CardHeader>
          <CardContent>
            <div className="w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    {["Kode CPL", "Deskripsi", "Target", "Nilai", "Selisih", "Status"].map((h) => (
                      <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cplResults.map((cpl) => {
                    const selisih = cpl.hasData ? cpl.nilai - cpl.target : null;
                    return (
                      <tr key={cpl.kode} style={{ borderBottom: "1px solid #f8faff" }}>
                        <td className="py-3 pr-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "#eef2ff", color: "#4361ee" }}>{cpl.kode}</span>
                        </td>
                        <td className="py-3 pr-4 font-medium" style={{ color: "#1a1d2e" }}>{cpl.deskripsi}</td>
                        <td className="py-3 pr-4" style={{ color: "#64748b" }}>{cpl.target}</td>
                        <td className="py-3 pr-4">
                          <span className="text-base font-bold" style={{ color: cpl.hasData ? "#4361ee" : "#94a3b8" }}>
                            {cpl.hasData ? cpl.nilai : "—"}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {selisih !== null ? (
                            <span className="text-sm font-semibold" style={{ color: selisih >= 0 ? "#059669" : "#dc2626" }}>
                              {selisih >= 0 ? "+" : ""}{selisih.toFixed(1)}
                            </span>
                          ) : <span style={{ color: "#94a3b8" }}>—</span>}
                        </td>
                        <td className="py-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                            style={cpl.status === "Tercapai" ? { background: "#d1fae5", color: "#059669" }
                              : cpl.status === "Tidak Tercapai" ? { background: "#fee2e2", color: "#dc2626" }
                              : { background: "#fef3c7", color: "#d97706" }}>
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
    </>
  );
}
