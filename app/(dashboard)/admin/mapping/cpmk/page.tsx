"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, FileCheck2, PenTool, AlertCircle, CheckCircle, Loader2, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface CPMKItem {
  id: string; kode: string; deskripsi: string;
  mataKuliah: { kode: string; nama: string };
  pi: { id: string; kode: string };
  bobotCpmk: { komponen: { id: string; nama: string; bobot: number; kelas: { nama: string; mataKuliah: { kode: string; nama: string } } } }[];
}
interface KomponenItem {
  id: string; nama: string; bobot: number; kelasId: string;
  kelas: { nama: string; mataKuliah: { kode: string; nama: string } };
}

function Toggle({ checked, onChange, loading }: { checked: boolean; onChange: (v: boolean) => void; loading?: boolean }) {
  return (
    <button type="button" disabled={loading} onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50"
      style={{ background: checked ? "#059669" : "#d1d5db" }}>
      <span className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200"
        style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }} />
      {loading && <span className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-3 h-3 animate-spin text-white" /></span>}
    </button>
  );
}

function BobotInput({ cpmkId, komponenId, value, onChange }: { cpmkId: string; komponenId: string; value: number; onChange: (v: number) => void }) {
  const [local, setLocal] = useState(String(value));
  const [saving, setSaving] = useState(false);
  useEffect(() => { setLocal(String(value)); }, [value]);

  const save = async () => {
    const num = parseFloat(local);
    if (isNaN(num) || num < 0 || num > 100) return;
    setSaving(true);
    try {
      await fetch("/api/admin/mapping/cpmk-komponen", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpmkId, komponenId, bobot: num }),
      });
      onChange(num);
    } finally { setSaving(false); }
  };

  return (
    <div className="flex items-center gap-1.5">
      <input type="number" min="0" max="100" step="1" value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={save} onKeyDown={e => e.key === "Enter" && save()}
        className="w-16 px-2 py-1 text-xs rounded-lg text-center focus:outline-none font-bold"
        style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#d97706" }} />
      <span className="text-xs font-semibold" style={{ color: "#d97706" }}>%</span>
      {saving && <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#d97706" }} />}
    </div>
  );
}

export default function MappingCPMKPage() {
  const [cpmkList, setCpmkList] = useState<CPMKItem[]>([]);
  const [komponenList, setKomponenList] = useState<KomponenItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const { saveScroll, restoreScroll } = useScrollRestore();

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    saveScroll();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mapping");
      const data = await res.json();
      setCpmkList(data.cpmkList ?? []);
      setKomponenList(data.komponenList ?? []);
    } finally {
      setLoading(false);
      restoreScroll();
    }
  }, [saveScroll, restoreScroll]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleKomponenCpmk = async (cpmkId: string, komponenId: string, linked: boolean) => {
    const key = `${cpmkId}-${komponenId}`;
    setToggling(key);
    try {
      const res = await fetch("/api/admin/mapping/cpmk-komponen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpmkId, komponenId, linked, bobot: linked ? 0 : undefined }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, "err"); return; }

      const komp = komponenList.find(k => k.id === komponenId)!;
      setCpmkList(prev => prev.map(c => {
        if (c.id !== cpmkId) return c;
        const entries = linked
          ? [...c.bobotCpmk, { komponen: { id: komponenId, nama: komp.nama, bobot: 0, kelas: komp.kelas } }]
          : c.bobotCpmk.filter(b => b.komponen.id !== komponenId);
        return { ...c, bobotCpmk: entries };
      }));
      showToast(linked ? "Komponen ditambahkan" : "Komponen dilepas", "ok");
    } finally {
      setToggling(null);
    }
  };

  const updateBobotLocal = (cpmkId: string, komponenId: string, bobot: number) => {
    setCpmkList(prev => prev.map(c => {
      if (c.id !== cpmkId) return c;
      return { ...c, bobotCpmk: c.bobotCpmk.map(b => b.komponen.id === komponenId ? { ...b, komponen: { ...b.komponen, bobot } } : b) };
    }));
  };

  const toggle = (id: string) => {
    setExpanded(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  // Group by MK
  const cpmkByMk: Record<string, CPMKItem[]> = {};
  const filtered = cpmkList.filter(c =>
    c.kode.toLowerCase().includes(search.toLowerCase()) ||
    c.deskripsi.toLowerCase().includes(search.toLowerCase()) ||
    c.mataKuliah.kode.toLowerCase().includes(search.toLowerCase())
  );
  filtered.forEach(c => {
    const k = c.mataKuliah.kode;
    if (!cpmkByMk[k]) cpmkByMk[k] = [];
    cpmkByMk[k].push(c);
  });

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#059669", borderTopColor: "transparent" }} />
    </div>
  );

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold"
          style={{ background: toast.type === "ok" ? "#d1fae5" : "#fee2e2", color: toast.type === "ok" ? "#059669" : "#dc2626" }}>
          {toast.type === "ok" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link href="/admin/mapping" className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80" style={{ background: "#f1f5f9" }}>
          <ArrowLeft className="w-4 h-4" style={{ color: "#64748b" }} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Mapping CPMK → Komponen</h2>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>Pilih komponen penilaian dan atur bobotnya untuk setiap CPMK. Toggle dan bobot langsung tersimpan.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari CPMK atau mata kuliah..."
          className="pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none w-full"
          style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }} />
      </div>

      {/* CPMK grouped by MK */}
      <div className="space-y-4">
        {Object.entries(cpmkByMk).map(([mkKode, cpmks]) => (
          <div key={mkKode} className="rounded-2xl border overflow-hidden" style={{ borderColor: "#6ee7b7" }}>
            {/* MK Header */}
            <div className="px-5 py-3 text-sm font-bold" style={{ background: "linear-gradient(135deg, #d1fae5, #a7f3d0)", color: "#059669" }}>
              📚 {mkKode} — {cpmks[0].mataKuliah.nama}
            </div>

            <div className="divide-y" style={{ background: "#f0fdf4" }}>
              {cpmks.map(cpmk => {
                const isOpen = expanded.has(cpmk.id);
                const linkedIds = new Set(cpmk.bobotCpmk.map(b => b.komponen.id));
                const totalBobot = cpmk.bobotCpmk.reduce((s, b) => s + b.komponen.bobot, 0);
                const komponenForThisMk = komponenList.filter(k => k.kelas.mataKuliah.kode === mkKode);

                return (
                  <div key={cpmk.id}>
                    <button onClick={() => toggle(cpmk.id)}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-green-50 transition-colors">
                      {isOpen ? <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "#059669" }} /> : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#059669" }} />}
                      <FileCheck2 className="w-4 h-4 shrink-0" style={{ color: "#059669" }} />
                      <span className="font-bold text-sm" style={{ color: "#059669" }}>{cpmk.kode}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: "#dbeafe", color: "#2563eb" }}>
                        {cpmk.pi.kode}
                      </span>
                      <span className="text-sm flex-1 text-left truncate" style={{ color: "#1a1d2e" }}>{cpmk.deskripsi}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: "#d1fae5", color: "#059669" }}>{linkedIds.size} komponen</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            background: Math.abs(totalBobot - 100) < 0.5 ? "#d1fae5" : "#fee2e2",
                            color: Math.abs(totalBobot - 100) < 0.5 ? "#059669" : "#dc2626"
                          }}>
                          {totalBobot.toFixed(0)}% {Math.abs(totalBobot - 100) < 0.5 ? "✓" : "⚠"}
                        </span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-4 pt-2 space-y-2" style={{ background: "#fefce8" }}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                            Komponen Penilaian & Bobot untuk {cpmk.kode}
                          </p>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: Math.abs(totalBobot - 100) < 0.5 ? "#d1fae5" : "#fee2e2",
                              color: Math.abs(totalBobot - 100) < 0.5 ? "#059669" : "#dc2626"
                            }}>
                            Total bobot: {totalBobot.toFixed(0)}% {Math.abs(totalBobot - 100) < 0.5 ? "✓" : "≠ 100%"}
                          </span>
                        </div>

                        {komponenForThisMk.length === 0 ? (
                          <p className="text-xs text-center py-4" style={{ color: "#94a3b8" }}>
                            Belum ada komponen nilai untuk {mkKode}. Tambahkan di menu Input Nilai.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {komponenForThisMk.map(komp => {
                              const isLinked = linkedIds.has(komp.id);
                              const key = `${cpmk.id}-${komp.id}`;
                              const bobotEntry = cpmk.bobotCpmk.find(b => b.komponen.id === komp.id);

                              return (
                                <div key={komp.id}
                                  className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                                  style={{ background: isLinked ? "#fffbeb" : "#f8fafc", borderColor: isLinked ? "#fde68a" : "#e2e8f0" }}>
                                  <Toggle checked={isLinked} loading={toggling === key} onChange={v => toggleKomponenCpmk(cpmk.id, komp.id, v)} />
                                  <PenTool className="w-3.5 h-3.5 shrink-0" style={{ color: "#d97706" }} />
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs" style={{ color: "#92400e" }}>{komp.nama}</p>
                                    <p className="text-xs" style={{ color: "#94a3b8" }}>Kelas {komp.kelas.nama}</p>
                                  </div>
                                  {isLinked && (
                                    <BobotInput
                                      cpmkId={cpmk.id} komponenId={komp.id}
                                      value={bobotEntry?.komponen.bobot ?? 0}
                                      onChange={v => updateBobotLocal(cpmk.id, komp.id, v)}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {Object.keys(cpmkByMk).length === 0 && (
          <div className="text-center py-16" style={{ color: "#94a3b8" }}>
            <FileCheck2 className="w-12 h-12 mx-auto mb-3" style={{ color: "#cbd5e1" }} />
            <p className="font-semibold">Tidak ada CPMK ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
