"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, BookOpen, FileCheck2, AlertCircle, CheckCircle, Loader2, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface PIItem { id: string; kode: string; deskripsi: string; cpl: { id: string; kode: string }; cpmk: { id: string }[]; }
interface CPMKItem { id: string; kode: string; deskripsi: string; mataKuliah: { kode: string; nama: string }; pi: { id: string; kode: string }; bobotCpmk: any[]; }

function Toggle({ checked, onChange, loading }: { checked: boolean; onChange: (v: boolean) => void; loading?: boolean }) {
  return (
    <button type="button" disabled={loading} onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50"
      style={{ background: checked ? "#2563eb" : "#d1d5db" }}>
      <span className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200"
        style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }} />
      {loading && <span className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-3 h-3 animate-spin text-white" /></span>}
    </button>
  );
}

export default function MappingPIPage() {
  const [piList, setPiList] = useState<PIItem[]>([]);
  const [cpmkList, setCpmkList] = useState<CPMKItem[]>([]);
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
      setPiList(data.piList ?? []);
      setCpmkList(data.cpmkList ?? []);
    } finally {
      setLoading(false);
      restoreScroll();
    }
  }, [saveScroll, restoreScroll]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleCpmkPi = async (piId: string, cpmkId: string, linked: boolean) => {
    const key = `${piId}-${cpmkId}`;
    setToggling(key);
    try {
      const res = await fetch("/api/admin/mapping/pi-cpmk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ piId, cpmkId, linked }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, "err"); return; }

      setCpmkList(prev => prev.map(c =>
        c.id === cpmkId ? { ...c, pi: linked ? { id: piId, kode: piList.find(p => p.id === piId)?.kode ?? "" } : c.pi } : c
      ));
      setPiList(prev => prev.map(pi => {
        if (pi.id !== piId) return pi;
        const refs = linked ? [...pi.cpmk.filter(c => c.id !== cpmkId), { id: cpmkId }] : pi.cpmk.filter(c => c.id !== cpmkId);
        return { ...pi, cpmk: refs };
      }));
      showToast(linked ? "CPMK berhasil dihubungkan" : "CPMK dilepas", "ok");
    } finally {
      setToggling(null);
    }
  };

  const toggle = (id: string) => {
    setExpanded(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };

  // Group CPMK by MK
  const cpmkByMk: Record<string, CPMKItem[]> = {};
  cpmkList.forEach(c => {
    const k = c.mataKuliah.kode;
    if (!cpmkByMk[k]) cpmkByMk[k] = [];
    cpmkByMk[k].push(c);
  });

  const filteredPi = piList.filter(pi =>
    pi.kode.toLowerCase().includes(search.toLowerCase()) ||
    pi.deskripsi.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#2563eb", borderTopColor: "transparent" }} />
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
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Mapping PI → CPMK</h2>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>Pilih CPMK dari mata kuliah yang mendukung setiap PI. Toggle langsung tersimpan.</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cari PI..."
          className="pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none w-full"
          style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }} />
      </div>

      <div className="space-y-3">
        {filteredPi.map(pi => {
          const isOpen = expanded.has(pi.id);
          const linkedIds = new Set(pi.cpmk.map(c => c.id));

          return (
            <div key={pi.id} className="rounded-2xl border overflow-hidden" style={{ borderColor: "#93c5fd" }}>
              <button onClick={() => toggle(pi.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg, #dbeafe, #bfdbfe)" }}>
                {isOpen ? <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "#2563eb" }} /> : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#2563eb" }} />}
                <BookOpen className="w-4 h-4 shrink-0" style={{ color: "#2563eb" }} />
                <span className="font-bold text-sm" style={{ color: "#2563eb" }}>{pi.kode}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#ede9fe", color: "#7c3aed" }}>{pi.cpl.kode}</span>
                <span className="text-sm flex-1 text-left" style={{ color: "#1e40af" }}>{pi.deskripsi}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0" style={{ background: "#93c5fd", color: "#1e40af" }}>
                  {linkedIds.size} CPMK
                </span>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-3 space-y-3" style={{ background: "#f0f9ff" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                    Toggle CPMK yang mendukung {pi.kode} — dikelompokkan per Mata Kuliah
                  </p>

                  {Object.entries(cpmkByMk).map(([mkKode, cpmks]) => {
                    const hasLinked = cpmks.some(c => linkedIds.has(c.id));
                    return (
                      <div key={mkKode} className="rounded-xl overflow-hidden" style={{ border: "1px solid #e2e8f0" }}>
                        <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider"
                          style={{ background: hasLinked ? "#dbeafe" : "#f8fafc", color: hasLinked ? "#2563eb" : "#94a3b8" }}>
                          📚 {mkKode} — {cpmks[0].mataKuliah.nama}
                        </div>
                        <div className="divide-y divide-gray-100">
                          {cpmks.map(cpmk => {
                            const isLinked = linkedIds.has(cpmk.id);
                            const key = `${pi.id}-${cpmk.id}`;
                            return (
                              <div key={cpmk.id}
                                className="flex items-center gap-3 px-4 py-2.5 transition-all"
                                style={{ background: isLinked ? "#eff6ff" : "#fff" }}>
                                <Toggle checked={isLinked} loading={toggling === key} onChange={v => toggleCpmkPi(pi.id, cpmk.id, v)} />
                                <FileCheck2 className="w-3.5 h-3.5 shrink-0" style={{ color: "#059669" }} />
                                <span className="font-bold text-xs" style={{ color: "#059669" }}>{cpmk.kode}</span>
                                <span className="text-xs flex-1" style={{ color: "#374151" }}>{cpmk.deskripsi}</span>
                                {isLinked && <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: "#dbeafe", color: "#2563eb" }}>✓ Terhubung</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {cpmkList.length === 0 && <p className="text-xs text-center py-4" style={{ color: "#94a3b8" }}>Belum ada CPMK.</p>}
                </div>
              )}
            </div>
          );
        })}
        {filteredPi.length === 0 && (
          <div className="text-center py-16" style={{ color: "#94a3b8" }}>
            <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: "#cbd5e1" }} />
            <p className="font-semibold">Tidak ada PI ditemukan</p>
          </div>
        )}
      </div>
    </div>
  );
}
