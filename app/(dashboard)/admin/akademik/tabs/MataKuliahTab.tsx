"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import CSVUploader from "@/components/ui/CSVUploader";
import { BookOpen, Plus, Edit2, Trash2, X, Search, Upload } from "lucide-react";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface MataKuliah {
  id: string;
  kode: string;
  nama: string;
  nama_en?: string;
  sks: number;
  semester: number;
  _count: { kelas: number; cpmk: number };
}

const SEMESTER_COLORS: Record<number, { bg: string; color: string }> = {
  1: { bg: "#dbeafe", color: "#2563eb" },
  2: { bg: "#ede9fe", color: "#7c3aed" },
  3: { bg: "#d1fae5", color: "#059669" },
  4: { bg: "#fef3c7", color: "#d97706" },
  5: { bg: "#fee2e2", color: "#dc2626" },
  6: { bg: "#cffafe", color: "#0891b2" },
  7: { bg: "#fce7f3", color: "#db2777" },
  8: { bg: "#ecfdf5", color: "#10b981" },
};

const CSV_TEMPLATE = `kode,nama,sks,semester,nama_en
IE1101,Kalkulus I,3,1,Calculus I
IE1102,Fisika Dasar,3,1,Basic Physics
IE1103,Pengantar Teknik Industri,2,1,Introduction to Industrial Engineering
IE1104,Kimia Dasar,2,1,Basic Chemistry
IE1105,Bahasa Indonesia,2,1,Indonesian Language
IE1201,Kalkulus II,3,2,Calculus II
IE1202,Fisika Lanjut,3,2,Advanced Physics
IE1203,Menggambar Teknik,2,2,Technical Drawing
IE1204,Statistika Dasar,3,2,Basic Statistics
IE2101,Riset Operasi I,3,3,Operations Research I
IE2102,Proses Manufaktur,3,3,Manufacturing Processes
IE2103,Analisis dan Desain Sistem,3,3,System Analysis and Design
IE2201,Riset Operasi II,3,4,Operations Research II
IE2202,Perencanaan dan Pengendalian Produksi,3,4,Production Planning and Control
IE2203,Ergonomi,3,4,Ergonomics
IE3101,Manajemen Kualitas,3,5,Quality Management
IE3102,Simulasi Sistem,3,5,System Simulation
IE3103,Manajemen Rantai Pasok,3,5,Supply Chain Management
IE3201,Analisis Keputusan,3,6,Decision Analysis
IE3202,Manajemen Proyek,3,6,Project Management
IE3203,Keselamatan dan Kesehatan Kerja,2,6,Occupational Safety and Health
IE4101,Tugas Akhir I,3,7,Final Project I
IE4102,Kerja Praktik,2,7,Internship
IE4201,Tugas Akhir II,4,8,Final Project II`;

interface MataKuliahTabProps {
  sharedSemesterFilter: number | "all";
  setSharedSemesterFilter: (sem: number | "all") => void;
}

export default function MataKuliahTab({ sharedSemesterFilter, setSharedSemesterFilter }: MataKuliahTabProps) {
  const [mkList, setMkList] = useState<MataKuliah[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSemester, setFilterSemester] = useState<number | "all">(sharedSemesterFilter);

  const [showModal, setShowModal] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importMode, setImportMode] = useState<"skip" | "update">("skip");
  const [editing, setEditing] = useState<MataKuliah | null>(null);
  const [form, setForm] = useState({ kode: "", nama: "", nama_en: "", sks: "3", semester: "1" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { saveScroll, restoreScroll } = useScrollRestore();

  useEffect(() => { fetchMK(); }, []);

  // Sync with shared semester filter from parent
  useEffect(() => {
    setFilterSemester(sharedSemesterFilter);
  }, [sharedSemesterFilter]);

  // Update parent when local filter changes
  useEffect(() => {
    setSharedSemesterFilter(filterSemester);
  }, [filterSemester, setSharedSemesterFilter]);

  const fetchMK = async () => {
    saveScroll();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/mata-kuliah");
      setMkList(await res.json());
    } catch (e) { console.error(e); }
    finally {
      setLoading(false);
      restoreScroll();
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ kode: "", nama: "", nama_en: "", sks: "3", semester: "1" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (mk: MataKuliah) => {
    setEditing(mk);
    setForm({ kode: mk.kode, nama: mk.nama, nama_en: mk.nama_en || "", sks: mk.sks.toString(), semester: mk.semester.toString() });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing ? { id: editing.id, ...form } : form;
      const res = await fetch("/api/admin/mata-kuliah", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setShowModal(false);
      fetchMK();
    } catch { setError("Terjadi kesalahan"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (mk: MataKuliah) => {
    if (!confirm(`Hapus "${mk.nama}"?\n\nMata kuliah yang sudah punya kelas tidak bisa dihapus.`)) return;
    const res = await fetch(`/api/admin/mata-kuliah?id=${mk.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error);
      return;
    }
    fetchMK();
  };

  const filtered = mkList.filter((mk) => {
    const matchSearch =
      mk.nama.toLowerCase().includes(search.toLowerCase()) ||
      mk.kode.toLowerCase().includes(search.toLowerCase());
    const matchSem = filterSemester === "all" || mk.semester === filterSemester;
    return matchSearch && matchSem;
  });

  const bySemester = filtered.reduce<Record<number, MataKuliah[]>>((acc, mk) => {
    if (!acc[mk.semester]) acc[mk.semester] = [];
    acc[mk.semester].push(mk);
    return acc;
  }, {});

  const totalKelas = mkList.reduce((s, m) => s + m._count.kelas, 0);
  const totalSks = mkList.reduce((s, m) => s + m.sks, 0);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Manajemen Mata Kuliah</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Tambah, edit, dan kelola daftar mata kuliah program studi
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0" }}
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 14px rgba(67,97,238,0.3)" }}
          >
            <Plus className="w-4 h-4" /> Tambah Mata Kuliah
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Total Mata Kuliah", value: mkList.length, bg: "#eef2ff", color: "#4361ee" },
          { label: "Total Kelas Aktif", value: totalKelas, bg: "#d1fae5", color: "#059669" },
          { label: "Total SKS Kurikulum", value: totalSks, bg: "#fef3c7", color: "#d97706" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-0 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: s.bg }}>
                <BookOpen className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>{s.label}</p>
                <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau kode MK..."
            className="pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none"
            style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e", width: 240 }}
          />
        </div>
        <select
          value={filterSemester === "all" ? "all" : filterSemester}
          onChange={(e) => setFilterSemester(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="px-4 py-2 rounded-xl text-sm focus:outline-none"
          style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
        >
          <option value="all">Semua Semester</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
      </div>

      {/* ── List per semester ── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: "#4361ee", borderTopColor: "transparent" }}
          />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "#cbd5e1" }} />
            <p className="font-semibold" style={{ color: "#64748b" }}>Tidak ada mata kuliah</p>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Klik "Tambah Mata Kuliah" atau "Import CSV" untuk memulai
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(bySemester)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([sem, items]) => {
            const sc = SEMESTER_COLORS[Number(sem)] ?? { bg: "#f1f5f9", color: "#64748b" };
            return (
              <div key={sem}>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: sc.bg, color: sc.color }}
                  >
                    Semester {sem}
                  </span>
                  <span className="text-xs" style={{ color: "#94a3b8" }}>
                    {items.length} mata kuliah · {items.reduce((s, m) => s + m.sks, 0)} SKS
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map((mk) => (
                    <Card key={mk.id}>
                      <CardContent className="p-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ background: sc.bg, color: sc.color }}
                            >
                              {mk.sks}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate" style={{ color: "#1a1d2e" }}>{mk.nama}</p>
                              <p className="text-xs font-mono mt-0.5" style={{ color: "#94a3b8" }}>{mk.kode}</p>
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button
                              onClick={() => openEdit(mk)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50"
                            >
                              <Edit2 className="w-3.5 h-3.5" style={{ color: "#4361ee" }} />
                            </button>
                            <button
                              onClick={() => handleDelete(mk)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />
                            </button>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: sc.bg, color: sc.color }}>
                            {mk.sks} SKS
                          </span>
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "#dbeafe", color: "#2563eb" }}>
                            {mk._count.kelas} kelas
                          </span>
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "#d1fae5", color: "#059669" }}>
                            {mk._count.cpmk} CPMK
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: Import CSV
      ═══════════════════════════════════════════════ */}
      {showImport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Import Mata Kuliah via CSV</h3>
                <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>Upload seluruh daftar mata kuliah sekaligus</p>
              </div>
              <button
                onClick={() => setShowImport(false)}
                className="p-1.5 rounded-lg transition-colors"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <X className="w-5 h-5" style={{ color: "#64748b" }} />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl text-xs space-y-1" style={{ background: "#f8faff", border: "1px solid #e9edf4" }}>
              <p className="font-bold" style={{ color: "#1a1d2e" }}>Format kolom:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5" style={{ color: "#64748b" }}>
                <span><span className="font-semibold" style={{ color: "#4361ee" }}>kode</span> — kode unik MK (e.g. IE3201)</span>
                <span><span className="font-semibold" style={{ color: "#4361ee" }}>nama</span> — nama lengkap (Indonesia)</span>
                <span><span className="font-semibold" style={{ color: "#4361ee" }}>sks</span> — jumlah SKS (1–6)</span>
                <span><span className="font-semibold" style={{ color: "#4361ee" }}>semester</span> — semester di kurikulum (1–8)</span>
                <span className="col-span-2"><span className="font-semibold" style={{ color: "#4361ee" }}>nama_en</span> — nama dalam bahasa Inggris (optional)</span>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-semibold mb-2" style={{ color: "#374151" }}>
                Jika kode MK sudah ada di sistem:
              </p>
              <div className="flex gap-3">
                {(["skip", "update"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setImportMode(m)}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={
                      importMode === m
                        ? { background: "linear-gradient(135deg, #4361ee, #7c3aed)", color: "#fff" }
                        : { background: "#f1f5f9", color: "#64748b" }
                    }
                  >
                    {m === "skip" ? "⏭ Lewati (default)" : "✏️ Update data"}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
                {importMode === "skip"
                  ? "Kode yang sudah ada tidak akan diubah, hanya tambah yang baru."
                  : "Kode yang sudah ada akan diperbarui nama, SKS, dan semesternya."}
              </p>
            </div>

            <CSVUploader
              title="Upload file CSV mata kuliah"
              endpoint="/api/admin/import/mata-kuliah"
              queryParams={{ mode: importMode }}
              templateFileName="template_mata_kuliah_ti_uns.csv"
              templateContent={CSV_TEMPLATE}
              formatInfo="kode, nama, sks, semester, nama_en (optional)"
              onSuccess={() => { fetchMK(); }}
            />

            <button
              onClick={() => setShowImport(false)}
              className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "#f1f5f9", color: "#64748b" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: Tambah / Edit Manual
      ═══════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>
                {editing ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: "#fee2e2", color: "#dc2626" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Kode MK <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.kode}
                  onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })}
                  placeholder="IE3201"
                  required
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none font-mono"
                  style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Nama Mata Kuliah (Indonesia) <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Riset Operasi I"
                  required
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Name (English) <span className="text-xs font-normal" style={{ color: "#94a3b8" }}>- optional</span>
                </label>
                <input
                  type="text"
                  value={form.nama_en}
                  onChange={(e) => setForm({ ...form, nama_en: e.target.value })}
                  placeholder="Operations Research I"
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                    SKS <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    value={form.sks}
                    onChange={(e) => setForm({ ...form, sks: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6].map((s) => (
                      <option key={s} value={s}>{s} SKS</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                    Semester <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#f1f5f9", color: "#64748b" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
                >
                  {saving ? "Menyimpan..." : editing ? "Update" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
