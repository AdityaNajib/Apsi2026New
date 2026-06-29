"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, Target, BookOpen, AlertCircle, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface CPLItem { id: string; kode: string; deskripsi: string; pi: { id: string }[]; }
interface PIItem { id: string; kode: string; deskripsi: string; cpl: { id: string; kode: string }; cpmk: { id: string }[]; }

function Toggle({ checked, onChange, loading }: { checked: boolean; onChange: (v: boolean) => void; loading?: boolean }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50"
      style={{ background: checked ? "#7c3aed" : "#d1d5db" }}
    >
      <span className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform duration-200"
        style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }} />
      {loading && <span className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-3 h-3 animate-spin text-white" /></span>}
    </button>
  );
}

export default function MappingCPLPage() {
  const [cplList, setCplList] = useState<CPLItem[]>([]);
  const [piList, setPiList] = useState<PIItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [toggling, setToggling] = useState<string | null>(null);
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
      setCplList(data.cplList ?? []);
      setPiList(data.piList ?? []);
    } finally {
      setLoading(false);
      restoreScroll();
    }
  }, [saveScroll, restoreScroll]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const togglePiCpl = async (cplId: string, piId: string, linked: boolean) => {
    const key = `${cplId}-${piId}`;
    setToggling(key);
    try {
      const res = await fetch("/api/admin/mapping/cpl-pi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cplId, piId, linked }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, "err"); return; }

      // Update local state
      setCplList(prev => prev.map(cpl => {
        if (cpl.id !== cplId) return cpl;
        const piRefs = linked
          ? [...cpl.pi.filter(p => p.id !== piId), { id: piId }]
          : cpl.pi.filter(p => p.id !== piId);
        return { ...cpl, pi: piRefs };
      }));
      showToast(linked ? "PI berhasil ditambahkan" : "PI dilepas", "ok");
    } finally {
      setToggling(null);
    }
  };

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#7c3aed", borderTopColor: "transparent" }} />
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
        <Link href="/admin/mapping" className="w-9 h-9 rounded-xl flex items-center justify-center hover:opacity-80"
          style={{ background: "#f1f5f9" }}>
          <ArrowLeft className="w-4 h-4" style={{ color: "#64748b" }} />
        </Link>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Mapping CPL → PI</h2>
          <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>Pilih PI yang berkontribusi ke setiap CPL. Toggle langsung tersimpan.</p>
        </div>
      </div>

      <div className="space-y-3">
        {cplList.map(cpl => {
          const isOpen = expanded.has(cpl.id);
          const linkedIds = new Set(cpl.pi.map(p => p.id));

          return (
            <div key={cpl.id} className="rounded-2xl border overflow-hidden" style={{ borderColor: "#c4b5fd" }}>
              <button onClick={() => toggle(cpl.id)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg, #ede9fe, #ddd6fe)" }}>
                {isOpen ? <ChevronDown className="w-4 h-4 shrink-0" style={{ color: "#7c3aed" }} /> : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "#7c3aed" }} />}
                <Target className="w-4 h-4 shrink-0" style={{ color: "#7c3aed" }} />
                <span className="font-bold text-sm" style={{ color: "#7c3aed" }}>{cpl.kode}</span>
                <span className="text-sm flex-1 text-left" style={{ color: "#6d28d9" }}>{cpl.deskripsi}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                  style={{ background: "#c4b5fd", color: "#5b21b6" }}>{linkedIds.size} PI terhubung</span>
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-3 space-y-2" style={{ background: "#faf9ff" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#94a3b8" }}>
                    Toggle PI yang berkontribusi ke {cpl.kode}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {piList.map(pi => {
                      const isLinked = linkedIds.has(pi.id);
                      const key = `${cpl.id}-${pi.id}`;
                      return (
                        <div key={pi.id}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl border transition-all"
                          style={{ background: isLinked ? "#eff6ff" : "#f8fafc", borderColor: isLinked ? "#93c5fd" : "#e2e8f0" }}>
                          <Toggle checked={isLinked} loading={toggling === key} onChange={(v) => togglePiCpl(cpl.id, pi.id, v)} />
                          <BookOpen className="w-3.5 h-3.5 shrink-0" style={{ color: "#2563eb" }} />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs" style={{ color: "#2563eb" }}>{pi.kode}</p>
                            <p className="text-xs truncate" style={{ color: "#64748b" }}>{pi.deskripsi}</p>
                          </div>
                          {isLinked && <span className="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: "#dbeafe", color: "#2563eb" }}>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                  {piList.length === 0 && <p className="text-xs text-center py-4" style={{ color: "#94a3b8" }}>Belum ada PI. Tambahkan di Data Kurikulum.</p>}
                </div>
              )}
            </div>
          );
        })}
        {cplList.length === 0 && (
          <div className="text-center py-16" style={{ color: "#94a3b8" }}>
            <Target className="w-12 h-12 mx-auto mb-3" style={{ color: "#cbd5e1" }} />
            <p className="font-semibold">Belum ada CPL</p>
          </div>
        )}
      </div>
    </div>
  );
}
