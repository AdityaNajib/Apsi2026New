"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import CSVUploader from "@/components/ui/CSVUploader";
import {
  BookOpen, Users, Plus, Trash2, UserPlus, UserMinus,
  ChevronDown, ChevronUp, X, GraduationCap, Upload, Search, School,
} from "lucide-react";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface MataKuliah { id: string; kode: string; nama: string; sks: number; semester: number; }
interface Dosen { id: string; name: string; nidn: string; email: string; }
interface MahasiswaOption { id: string; nim: string; name: string; angkatan: string; }

interface KelasItem {
  id: string;
  nama: string;
  tahunAjaran: string;
  semester: string;
  mataKuliah: { id: string; kode: string; nama: string; sks: number; semester: number };
  dosen: { id: string; pengampuId: string; name: string; nidn: string }[];
  jumlahMahasiswa: number;
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

// Template CSV import kelas
const KELAS_TEMPLATE = `kode_mk,nama_kelas,tahun_ajaran,semester,nidn_dosen
IE3201,A,2026/2027,Ganjil,0012345678
IE3201,B,2026/2027,Ganjil,0012345678|0087654321
IE3202,A,2026/2027,Ganjil,`;

// Template CSV import mahasiswa ke kelas (nim saja)
const MHS_KELAS_TEMPLATE = `nim
I0323001
I0323002
I0323003`;

interface ManajemenKelasTabProps {
  goToMataKuliah: (semester: number) => void;
}

export default function ManajemenKelasTab({ goToMataKuliah }: ManajemenKelasTabProps) {
  const [kelasList, setKelasList] = useState<KelasItem[]>([]);
  const [mkOptions, setMkOptions] = useState<MataKuliah[]>([]);
  const [dosenOptions, setDosenOptions] = useState<Dosen[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedKelas, setExpandedKelas] = useState<string | null>(null);
  const [mahasiswaKelas, setMahasiswaKelas] = useState<Record<string, MahasiswaOption[]>>({});
  const [selectedSemester, setSelectedSemester] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const [totalMahasiswaUnik, setTotalMahasiswaUnik] = useState(0);

  // Modal states
  const [showAddKelas, setShowAddKelas] = useState(false);
  const [showImportKelas, setShowImportKelas] = useState(false);
  const [showAddDosen, setShowAddDosen] = useState<string | null>(null);
  const [showAddMahasiswa, setShowAddMahasiswa] = useState<string | null>(null);
  const [showImportMahasiswa, setShowImportMahasiswa] = useState<string | null>(null);
  const [mahasiswaNotIn, setMahasiswaNotIn] = useState<MahasiswaOption[]>([]);

  const [kelasForm, setKelasForm] = useState({
    mkId: "", nama: "", tahunAjaran: "2026/2027", semester: "Ganjil",
  });
  const [selectedDosenId, setSelectedDosenId] = useState("");
  const [selectedMhsId, setSelectedMhsId] = useState("");

  const { saveScroll, restoreScroll } = useScrollRestore();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    saveScroll();
    setLoading(true);
    try {
      const [kelasRes, mkRes, dosenRes, statsRes] = await Promise.all([
        fetch('/api/admin/kelas'),
        fetch('/api/admin/options?type=mk'),
        fetch('/api/admin/options?type=dosen'),
        fetch('/api/admin/kelas/stats'),
      ]);
      setKelasList(await kelasRes.json());
      setMkOptions(await mkRes.json());
      setDosenOptions(await dosenRes.json());
      const stats = await statsRes.json();
      setTotalMahasiswaUnik(stats.totalMahasiswaUnik || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      restoreScroll();
    }
  };

  // Filter kelas by semester and search
  const filtered = kelasList.filter(k => {
    const semMatch = selectedSemester === "all" || k.mataKuliah.semester === selectedSemester;
    const searchMatch = search === "" || 
      k.mataKuliah.nama.toLowerCase().includes(search.toLowerCase()) ||
      k.mataKuliah.kode.toLowerCase().includes(search.toLowerCase()) ||
      k.nama.toLowerCase().includes(search.toLowerCase());
    return semMatch && searchMatch;
  });

  // Group by semester
  const bySemester = filtered.reduce((acc, kelas) => {
    const sem = kelas.mataKuliah.semester;
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(kelas);
    return acc;
  }, {} as Record<number, KelasItem[]>);

  const fetchMahasiswaKelas = async (kelasId: string) => {
    const res = await fetch(`/api/admin/kelas/mahasiswa?kelasId=${kelasId}`);
    const data = await res.json();
    setMahasiswaKelas((prev) => ({ ...prev, [kelasId]: data }));
  };

  const toggleExpand = (kelasId: string) => {
    if (expandedKelas === kelasId) {
      setExpandedKelas(null);
    } else {
      setExpandedKelas(kelasId);
      fetchMahasiswaKelas(kelasId);
    }
  };

  const handleCreateKelas = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/kelas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(kelasForm),
    });
    if (res.ok) {
      setShowAddKelas(false);
      setKelasForm({ mkId: "", nama: "", tahunAjaran: "2026/2027", semester: "Ganjil" });
      fetchAll();
    } else {
      const err = await res.json();
      alert(err.error || 'Gagal membuat kelas');
    }
  };

  const handleDeleteKelas = async (id: string, nama: string) => {
    if (!confirm(`Hapus Kelas ${nama}? Semua data nilai dan KRS akan ikut terhapus.`)) return;
    await fetch(`/api/admin/kelas?id=${id}`, { method: 'DELETE' });
    fetchAll();
  };

  const handleAddDosen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddDosen || !selectedDosenId) return;
    const res = await fetch('/api/admin/kelas/pengampu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kelasId: showAddDosen, dosenId: selectedDosenId }),
    });
    if (res.ok) {
      setShowAddDosen(null);
      setSelectedDosenId("");
      fetchAll();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const handleRemoveDosen = async (pengampuId: string) => {
    if (!confirm('Lepas dosen dari kelas ini?')) return;
    await fetch(`/api/admin/kelas/pengampu?id=${pengampuId}`, { method: 'DELETE' });
    fetchAll();
  };

  const openAddMahasiswa = async (kelasId: string) => {
    const res = await fetch(`/api/admin/options?type=mahasiswa-not-in-kelas&kelasId=${kelasId}`);
    const data = await res.json();
    setMahasiswaNotIn(data);
    setShowAddMahasiswa(kelasId);
    setSelectedMhsId("");
  };

  const handleAddMahasiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddMahasiswa || !selectedMhsId) return;
    const res = await fetch('/api/admin/kelas/mahasiswa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kelasId: showAddMahasiswa, mahasiswaId: selectedMhsId }),
    });
    if (res.ok) {
      setShowAddMahasiswa(null);
      fetchMahasiswaKelas(showAddMahasiswa);
      fetchAll();
    } else {
      const err = await res.json();
      alert(err.error);
    }
  };

  const handleRemoveMahasiswa = async (krsId: string, kelasId: string) => {
    if (!confirm('Keluarkan mahasiswa dari kelas ini?')) return;
    await fetch(`/api/admin/kelas/mahasiswa?krsId=${krsId}`, { method: 'DELETE' });
    fetchMahasiswaKelas(kelasId);
    fetchAll();
  };

  const getKelasById = (id: string) => kelasList.find((k) => k.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start gap-3 justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Manajemen Kelas</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Kelola kelas, dosen pengampu, dan mahasiswa terdaftar
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowImportKelas(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0" }}
          >
            <Upload className="w-4 h-4" />
            Import Kelas CSV
          </button>
          <button
            onClick={() => setShowAddKelas(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 14px rgba(67,97,238,0.3)" }}
          >
            <Plus className="w-4 h-4" />
            Tambah Kelas
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: "Total Kelas", value: kelasList.length, bg: "#eef2ff", color: "#4361ee", icon: School },
          { label: "Mahasiswa Aktif", value: totalMahasiswaUnik, bg: "#d1fae5", color: "#059669", icon: Users },
          { label: "Mata Kuliah Aktif", value: new Set(kelasList.map(k => k.mataKuliah.id)).size, bg: "#fef3c7", color: "#d97706", icon: BookOpen },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-0 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
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
            placeholder="Cari mata kuliah atau kelas..."
            className="pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none"
            style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e", width: 260 }}
          />
        </div>
        <select
          value={selectedSemester === "all" ? "all" : selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="px-4 py-2 rounded-xl text-sm focus:outline-none"
          style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
        >
          <option value="all">Semua Semester</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
      </div>

      {/* ── Kelas List per semester ── */}
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
            <School className="w-12 h-12 mx-auto mb-4" style={{ color: "#cbd5e1" }} />
            <p className="font-semibold" style={{ color: "#64748b" }}>Tidak ada kelas</p>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Klik "Tambah Kelas" atau "Import CSV" untuk memulai
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
                  <button
                    onClick={() => goToMataKuliah(Number(sem))}
                    className="text-xs font-bold px-3 py-1 rounded-full hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ background: sc.bg, color: sc.color }}
                    title={`Lihat mata kuliah semester ${sem}`}
                  >
                    Semester {sem}
                  </button>
                  <span className="text-xs" style={{ color: "#94a3b8" }}>
                    {items.length} kelas · {items.reduce((s, k) => s + k.jumlahMahasiswa, 0)} mhs aktif
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map((kelas) => (
                    <Card key={kelas.id}>
                      <CardContent className="p-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                              style={{ background: sc.bg, color: sc.color }}
                            >
                              {kelas.nama}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate" style={{ color: "#1a1d2e" }}>{kelas.mataKuliah.nama}</p>
                              <p className="text-xs font-mono mt-0.5" style={{ color: "#94a3b8" }}>{kelas.mataKuliah.kode} · Kelas {kelas.nama}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteKelas(kelas.id, kelas.nama)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "#dbeafe", color: "#2563eb" }}>
                            {kelas.jumlahMahasiswa} mhs aktif
                          </span>
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "#d1fae5", color: "#059669" }}>
                            {kelas.dosen.length} dosen
                          </span>
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: sc.bg, color: sc.color }}>
                            {kelas.tahunAjaran}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleExpand(kelas.id)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors"
                          style={{ background: "#f8fafc", color: "#64748b" }}
                        >
                          {expandedKelas === kelas.id ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Tutup Detail
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Lihat Detail
                            </>
                          )}
                        </button>
                        {expandedKelas === kelas.id && (
                          <div className="mt-3 pt-3 border-t space-y-3" style={{ borderColor: "#f1f5f9" }}>
                            {/* Dosen list */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold" style={{ color: "#1a1d2e" }}>Dosen Pengampu</p>
                                <button
                                  onClick={() => setShowAddDosen(kelas.id)}
                                  className="text-xs font-semibold flex items-center gap-1"
                                  style={{ color: "#4361ee" }}
                                >
                                  <UserPlus className="w-3 h-3" />
                                  Tambah
                                </button>
                              </div>
                              {kelas.dosen.length === 0 ? (
                                <p className="text-xs" style={{ color: "#94a3b8" }}>Belum ada dosen</p>
                              ) : (
                                <div className="space-y-1">
                                  {kelas.dosen.map((d) => (
                                    <div key={d.pengampuId} className="flex items-center justify-between text-xs p-2 rounded-lg" style={{ background: "#f8fafc" }}>
                                      <span style={{ color: "#1a1d2e" }}>{d.name}</span>
                                      <button
                                        onClick={() => handleRemoveDosen(d.pengampuId)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <UserMinus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* Mahasiswa list */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-bold" style={{ color: "#1a1d2e" }}>Mahasiswa Aktif ({mahasiswaKelas[kelas.id]?.length || 0})</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setShowImportMahasiswa(kelas.id)}
                                    className="text-xs font-semibold flex items-center gap-1"
                                    style={{ color: "#059669" }}
                                  >
                                    <Upload className="w-3 h-3" />
                                    Import
                                  </button>
                                  <button
                                    onClick={() => openAddMahasiswa(kelas.id)}
                                    className="text-xs font-semibold flex items-center gap-1"
                                    style={{ color: "#4361ee" }}
                                  >
                                    <UserPlus className="w-3 h-3" />
                                    Tambah
                                  </button>
                                </div>
                              </div>
                              {!mahasiswaKelas[kelas.id] || mahasiswaKelas[kelas.id].length === 0 ? (
                                <p className="text-xs" style={{ color: "#94a3b8" }}>Belum ada mahasiswa aktif</p>
                              ) : (
                                <div className="max-h-32 overflow-y-auto space-y-1">
                                  {mahasiswaKelas[kelas.id].map((mhs) => (
                                    <div key={mhs.id} className="flex items-center justify-between text-xs p-2 rounded-lg" style={{ background: "#f8fafc" }}>
                                      <span style={{ color: "#1a1d2e" }}>{mhs.nim} - {mhs.name}</span>
                                      <button
                                        onClick={() => handleRemoveMahasiswa(mhs.id, kelas.id)}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <UserMinus className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: Import Kelas CSV
      ═══════════════════════════════════════════════ */}
      {showImportKelas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Import Kelas via CSV</h3>
                <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
                  Buat banyak kelas + assign dosen sekaligus
                </p>
              </div>
              <button
                onClick={() => setShowImportKelas(false)}
                className="p-1.5 rounded-lg transition-colors"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <X className="w-5 h-5" style={{ color: "#64748b" }} />
              </button>
            </div>

            {/* Info kolom */}
            <div className="mb-4 p-3 rounded-xl text-xs space-y-1" style={{ background: "#f8faff", border: "1px solid #e9edf4" }}>
              <p className="font-bold" style={{ color: "#1a1d2e" }}>Keterangan kolom:</p>
              <ul className="space-y-0.5" style={{ color: "#64748b" }}>
                <li><span className="font-semibold text-indigo-600">kode_mk</span> — kode mata kuliah yang sudah ada di sistem</li>
                <li><span className="font-semibold text-indigo-600">nama_kelas</span> — label kelas, misal A, B, Reguler</li>
                <li><span className="font-semibold text-indigo-600">tahun_ajaran</span> — format 2026/2027</li>
                <li><span className="font-semibold text-indigo-600">semester</span> — Ganjil atau Genap</li>
                <li><span className="font-semibold text-indigo-600">nidn_dosen</span> — NIDN dosen (boleh kosong); multi-dosen pisah dengan <code>|</code></li>
              </ul>
            </div>

            <CSVUploader
              title="Upload file CSV kelas"
              endpoint="/api/admin/import/kelas"
              templateFileName="template_import_kelas.csv"
              templateContent={KELAS_TEMPLATE}
              formatInfo="kode_mk, nama_kelas, tahun_ajaran, semester, nidn_dosen"
              onSuccess={() => { fetchAll(); }}
            />

            <button
              onClick={() => setShowImportKelas(false)}
              className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "#f1f5f9", color: "#64748b" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: Import Mahasiswa ke Kelas CSV
      ═══════════════════════════════════════════════ */}
      {showImportMahasiswa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Import Mahasiswa ke Kelas</h3>
                {getKelasById(showImportMahasiswa) && (
                  <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
                    {getKelasById(showImportMahasiswa)!.mataKuliah.nama} — Kelas {getKelasById(showImportMahasiswa)!.nama}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowImportMahasiswa(null)}
                className="p-1.5 rounded-lg transition-colors"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <X className="w-5 h-5" style={{ color: "#64748b" }} />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: "#f8faff", border: "1px solid #e9edf4" }}>
              <p style={{ color: "#64748b" }}>
                Upload CSV berisi kolom <span className="font-semibold text-indigo-600">nim</span> satu per baris.
                Mahasiswa yang sudah terdaftar di kelas ini akan dilewati otomatis.
              </p>
            </div>

            <CSVUploader
              title="Upload daftar NIM mahasiswa"
              endpoint="/api/admin/import/kelas-mahasiswa"
              extraFields={{ kelasId: showImportMahasiswa }}
              templateFileName="template_mahasiswa_kelas.csv"
              templateContent={MHS_KELAS_TEMPLATE}
              formatInfo="nim"
              onSuccess={() => {
                fetchMahasiswaKelas(showImportMahasiswa!);
                fetchAll();
              }}
            />

            <button
              onClick={() => setShowImportMahasiswa(null)}
              className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "#f1f5f9", color: "#64748b" }}
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: Tambah Kelas Manual
      ═══════════════════════════════════════════════ */}
      {showAddKelas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Tambah Kelas Baru</h3>
              <button onClick={() => setShowAddKelas(false)}>
                <X className="w-5 h-5" style={{ color: "#64748b" }} />
              </button>
            </div>
            <form onSubmit={handleCreateKelas} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Mata Kuliah</label>
                <select
                  value={kelasForm.mkId}
                  onChange={(e) => setKelasForm({ ...kelasForm, mkId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  required
                >
                  <option value="">Pilih Mata Kuliah</option>
                  {mkOptions.map((mk) => (
                    <option key={mk.id} value={mk.id}>
                      {mk.kode} — {mk.nama} ({mk.sks} SKS, Sem {mk.semester})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Nama Kelas (A/B/C...)</label>
                <input
                  type="text"
                  value={kelasForm.nama}
                  onChange={(e) => setKelasForm({ ...kelasForm, nama: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  placeholder="A"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Tahun Ajaran</label>
                <input
                  type="text"
                  value={kelasForm.tahunAjaran}
                  onChange={(e) => setKelasForm({ ...kelasForm, tahunAjaran: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  placeholder="2026/2027"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Semester</label>
                <select
                  value={kelasForm.semester}
                  onChange={(e) => setKelasForm({ ...kelasForm, semester: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  required
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddKelas(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#f1f5f9", color: "#64748b" }}>
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                  Buat Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: Tambah Dosen Manual
      ═══════════════════════════════════════════════ */}
      {showAddDosen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "#1a1d2e" }}>Tambah Dosen Pengampu</h3>
              <button onClick={() => setShowAddDosen(null)}>
                <X className="w-5 h-5" style={{ color: "#64748b" }} />
              </button>
            </div>
            <form onSubmit={handleAddDosen} className="space-y-4">
              <select
                value={selectedDosenId}
                onChange={(e) => setSelectedDosenId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                required
              >
                <option value="">Pilih Dosen</option>
                {dosenOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} — {d.nidn}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddDosen(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#f1f5f9", color: "#64748b" }}>
                  Batal
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          MODAL: Tambah Mahasiswa Manual
      ═══════════════════════════════════════════════ */}
      {showAddMahasiswa && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: "#1a1d2e" }}>Tambah Mahasiswa ke Kelas</h3>
              <button onClick={() => setShowAddMahasiswa(null)}>
                <X className="w-5 h-5" style={{ color: "#64748b" }} />
              </button>
            </div>
            <form onSubmit={handleAddMahasiswa} className="space-y-4">
              <select
                value={selectedMhsId}
                onChange={(e) => setSelectedMhsId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                required
              >
                <option value="">Pilih Mahasiswa</option>
                {mahasiswaNotIn.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nim} — {m.name} (Angkatan {m.angkatan})
                  </option>
                ))}
              </select>
              {mahasiswaNotIn.length === 0 && (
                <p className="text-xs text-center" style={{ color: "#94a3b8" }}>
                  Semua mahasiswa sudah terdaftar di kelas ini
                </p>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowAddMahasiswa(null)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#f1f5f9", color: "#64748b" }}>
                  Batal
                </button>
                <button type="submit" disabled={mahasiswaNotIn.length === 0}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
