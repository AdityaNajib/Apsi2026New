"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Download, TrendingUp, TrendingDown, Users, Target, FileText } from "lucide-react";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface LaporanCPL {
  cplKode: string;
  cplDeskripsi: string;
  rataRata: number;
  jumlahMahasiswa: number;
  tercapai: number;
  belumTercapai: number;
  persentaseTercapai: number;
}

interface Props { role: "KAPRODI" | "JAMU"; }

export default function LaporanCPLContent({ role }: Props) {
  const [laporan, setLaporan] = useState<LaporanCPL[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAngkatan, setFilterAngkatan] = useState("all");
  const [downloading, setDownloading] = useState(false);
  const { saveScroll, restoreScroll } = useScrollRestore();

  const roleLabel = role === "KAPRODI" ? "Ketua Program Studi" : "Penjaminan Mutu";
  const tahunIni = new Date().getFullYear();

  useEffect(() => { fetchLaporan(); }, [filterAngkatan]);

  const fetchLaporan = async () => {
    saveScroll();
    setLoading(true);
    try {
      const res = await fetch(`/api/kaprodi/laporan-cpl?angkatan=${filterAngkatan}`);
      setLaporan(await res.json());
    } catch (e) { console.error(e); } finally {
      setLoading(false);
      restoreScroll();
    }
  };

  const handleDownloadCSV = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/kaprodi/laporan-cpl/export?format=csv&angkatan=${filterAngkatan}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-cpl-${filterAngkatan}-${tahunIni}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { alert("Gagal download CSV"); } finally { setDownloading(false); }
  };

  const handlePrint = () => window.print();

  const cplTercapai = laporan.filter(l => l.persentaseTercapai >= 70).length;
  const cplBelumTercapai = laporan.length - cplTercapai;
  const avgNilai = laporan.length > 0
    ? (laporan.reduce((s, l) => s + l.rataRata, 0) / laporan.length).toFixed(1)
    : "—";
  const totalMhs = laporan.length > 0
    ? Math.round(laporan.reduce((s, l) => s + l.jumlahMahasiswa, 0) / laporan.length)
    : 0;

  return (
    <>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #laporan-print-area, #laporan-print-area * { visibility: visible; }
          #laporan-print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 20px; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Laporan CPL</h2>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Monitoring capaian pembelajaran lulusan — {roleLabel}</p>
          </div>
          <div className="no-print flex flex-wrap items-center gap-2">
            <select value={filterAngkatan} onChange={e => setFilterAngkatan(e.target.value)}
              className="px-4 py-2 rounded-xl border text-sm font-medium"
              style={{ borderColor: "#e2e8f0", color: "#64748b" }}>
              <option value="all">Semua Angkatan</option>
              <option value="2025">Angkatan 2025</option>
              <option value="2024">Angkatan 2024</option>
              <option value="2023">Angkatan 2023</option>
              <option value="2022">Angkatan 2022</option>
            </select>
            <button onClick={handleDownloadCSV} disabled={downloading || loading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>
              <Download className="w-4 h-4" />{downloading ? "..." : "Excel / CSV"}
            </button>
            <button onClick={handlePrint} disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
              <FileText className="w-4 h-4" />Print / PDF
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="no-print grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            { label: "Total CPL", value: laporan.length, icon: Target, bg: "#ede9fe", color: "#7c3aed" },
            { label: "CPL Tercapai", value: cplTercapai, icon: TrendingUp, bg: "#d1fae5", color: "#059669" },
            { label: "Belum Tercapai", value: cplBelumTercapai, icon: TrendingDown, bg: "#fee2e2", color: "#dc2626" },
            { label: "Rata-rata Mhs", value: totalMhs, icon: Users, bg: "#dbeafe", color: "#2563eb" },
          ].map((s, i) => (
            <Card key={i}><CardContent className="p-0 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon className="w-6 h-6" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{s.value}</p>
                <p className="text-sm" style={{ color: "#94a3b8" }}>{s.label}</p>
              </div>
            </CardContent></Card>
          ))}
        </div>

        {/* Table screen */}
        <Card className="no-print">
          <CardHeader><CardTitle>Detail Capaian CPL</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    {["CPL", "Deskripsi", "Rata-rata", "Mahasiswa", "% Tercapai", "Status"].map(h =>
                      <th key={h} className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {laporan.map(item => (
                      <tr key={item.cplKode} style={{ borderBottom: "1px solid #f8faff" }}>
                        <td className="py-4"><span className="px-3 py-1 rounded-lg font-semibold text-sm" style={{ background: "#ede9fe", color: "#7c3aed" }}>{item.cplKode}</span></td>
                        <td className="py-4 pr-4" style={{ color: "#1a1d2e" }}>{item.cplDeskripsi}</td>
                        <td className="py-4 font-bold text-lg" style={{ color: "#1a1d2e" }}>{item.rataRata.toFixed(1)}</td>
                        <td className="py-4">
                          <p className="font-semibold text-sm" style={{ color: "#059669" }}>{item.tercapai} tercapai</p>
                          <p className="text-xs" style={{ color: "#dc2626" }}>{item.belumTercapai} belum</p>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "#f1f5f9", minWidth: 60 }}>
                              <div className="h-full rounded-full" style={{ width: `${Math.min(item.persentaseTercapai, 100)}%`, background: item.persentaseTercapai >= 70 ? "#059669" : "#dc2626" }} />
                            </div>
                            <span className="text-sm font-semibold w-12" style={{ color: item.persentaseTercapai >= 70 ? "#059669" : "#dc2626" }}>
                              {item.persentaseTercapai.toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-lg text-xs font-semibold"
                            style={{ background: item.persentaseTercapai >= 70 ? "#d1fae5" : "#fee2e2", color: item.persentaseTercapai >= 70 ? "#059669" : "#dc2626" }}>
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

        {/* Print area */}
        <div id="laporan-print-area">
          <div style={{ textAlign: "center", marginBottom: 20, paddingBottom: 16, borderBottom: "3px solid #4361ee" }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#1a1d2e", margin: 0 }}>LAPORAN KETERCAPAIAN CPL</h1>
            <p style={{ fontSize: 13, color: "#4361ee", fontWeight: 600, margin: "4px 0 0" }}>Program Studi Teknik Industri — Universitas Sebelas Maret</p>
            <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>
              Tahun Akademik {tahunIni}/{tahunIni + 1} &nbsp;|&nbsp;
              {filterAngkatan === "all" ? "Semua Angkatan" : `Angkatan ${filterAngkatan}`} &nbsp;|&nbsp;
              {roleLabel} &nbsp;|&nbsp;
              {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Total CPL", value: laporan.length, color: "#7c3aed", bg: "#ede9fe" },
              { label: "CPL Tercapai", value: cplTercapai, color: "#059669", bg: "#d1fae5" },
              { label: "Belum Tercapai", value: cplBelumTercapai, color: "#dc2626", bg: "#fee2e2" },
              { label: "Rata-rata Nilai", value: avgNilai, color: "#2563eb", bg: "#dbeafe" },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 8, padding: "12px 16px", textAlign: "center" }}>
                <p style={{ fontSize: 24, fontWeight: 700, color: s.color, margin: 0 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "#64748b", margin: "3px 0 0" }}>{s.label}</p>
              </div>
            ))}
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr style={{ background: "#4361ee" }}>
                {["Kode CPL", "Deskripsi CPL", "Rata-rata", "Jml Mhs", "Tercapai", "Belum", "% Tercapai", "Status"].map(h =>
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "#fff", fontWeight: 600, fontSize: 10, textTransform: "uppercase" }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {laporan.map((item, i) => {
                const ok = item.persentaseTercapai >= 70;
                return (
                  <tr key={item.cplKode} style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "7px 10px", fontWeight: 700, color: "#4361ee" }}>{item.cplKode}</td>
                    <td style={{ padding: "7px 10px", color: "#1a1d2e" }}>{item.cplDeskripsi}</td>
                    <td style={{ padding: "7px 10px", fontWeight: 700, textAlign: "center" }}>{item.rataRata.toFixed(1)}</td>
                    <td style={{ padding: "7px 10px", textAlign: "center" }}>{item.jumlahMahasiswa}</td>
                    <td style={{ padding: "7px 10px", textAlign: "center", color: "#059669", fontWeight: 600 }}>{item.tercapai}</td>
                    <td style={{ padding: "7px 10px", textAlign: "center", color: "#dc2626", fontWeight: 600 }}>{item.belumTercapai}</td>
                    <td style={{ padding: "7px 10px", textAlign: "center", fontWeight: 700, color: ok ? "#059669" : "#dc2626" }}>{item.persentaseTercapai.toFixed(1)}%</td>
                    <td style={{ padding: "7px 10px" }}>
                      <span style={{ background: ok ? "#d1fae5" : "#fee2e2", color: ok ? "#059669" : "#dc2626", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                        {ok ? "TERCAPAI" : "PERLU PERBAIKAN"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94a3b8", borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
            <span>Sistem Informasi CPL — Teknik Industri UNS</span>
            <span>Dicetak: {new Date().toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>
    </>
  );
}
