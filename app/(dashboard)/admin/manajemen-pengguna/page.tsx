"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import CSVUploader from "@/components/ui/CSVUploader";
import {
  Users, GraduationCap, Plus, Edit2, Trash2, X,
  Search, ChevronDown, Upload,
} from "lucide-react";
import { useScrollRestore } from "@/lib/useScrollRestore";

// ─── Types ────────────────────────────────────────────────────────────────────
interface DosenItem {
  id: string; userId: string; name: string; email: string;
  nidn: string; createdAt: string;
}
interface MhsItem {
  id: string; userId: string; name: string; email: string;
  nim: string; angkatan: string; status: string; createdAt: string;
}

const STATUS_OPTIONS = ['AKTIF', 'CUTI', 'LULUS', 'NON_AKTIF'] as const;
type MhsStatus = typeof STATUS_OPTIONS[number];

const STATUS_STYLE: Record<MhsStatus, { bg: string; color: string; label: string }> = {
  AKTIF:     { bg: '#d1fae5', color: '#059669', label: 'Aktif' },
  CUTI:      { bg: '#fef3c7', color: '#d97706', label: 'Cuti' },
  LULUS:     { bg: '#dbeafe', color: '#2563eb', label: 'Lulus' },
  NON_AKTIF: { bg: '#fee2e2', color: '#dc2626', label: 'Non-Aktif' },
};

const ANGKATAN_LIST = ['2022', '2023', '2024', '2025', '2026'];

// ─── Sub-components ───────────────────────────────────────────────────────────

function InputField({ label, value, onChange, placeholder, type = "text", required = true }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} required={required}
        className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
        style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "#4361ee"; e.currentTarget.style.background = "#fff"; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManajemenPenggunaPage() {
  const [activeTab, setActiveTab] = useState<'dosen' | 'mahasiswa'>('dosen');

  const { saveScroll, restoreScroll } = useScrollRestore();

  // ── DOSEN state ──
  const [dosenList, setDosenList] = useState<DosenItem[]>([]);
  const [dosenLoading, setDosenLoading] = useState(true);
  const [dosenSearch, setDosenSearch] = useState('');
  const [showDosenModal, setShowDosenModal] = useState(false);
  const [showDosenCSV, setShowDosenCSV] = useState(false);
  const [editingDosen, setEditingDosen] = useState<DosenItem | null>(null);
  const [dosenForm, setDosenForm] = useState({ name: '', email: '', nidn: '' });
  const [dosenError, setDosenError] = useState('');
  const [dosenSaving, setDosenSaving] = useState(false);

  // ── MAHASISWA state ──
  const [mhsList, setMhsList] = useState<MhsItem[]>([]);
  const [mhsLoading, setMhsLoading] = useState(true);
  const [mhsSearch, setMhsSearch] = useState('');
  const [mhsAngkatan, setMhsAngkatan] = useState('all');
  const [showMhsModal, setShowMhsModal] = useState(false);
  const [showMhsCSV, setShowMhsCSV] = useState(false);
  const [editingMhs, setEditingMhs] = useState<MhsItem | null>(null);
  const [mhsForm, setMhsForm] = useState({ name: '', email: '', nim: '', angkatan: '2023', status: 'AKTIF' });
  const [mhsError, setMhsError] = useState('');
  const [mhsSaving, setMhsSaving] = useState(false);
  const [expandedAngkatan, setExpandedAngkatan] = useState<string | null>('2023');
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // ── Fetch ──
  const fetchDosen = useCallback(async () => {
    saveScroll();
    setDosenLoading(true);
    try {
      const res = await fetch('/api/admin/pengguna/dosen');
      setDosenList(await res.json());
    } catch (e) { console.error(e); }
    finally { setDosenLoading(false); restoreScroll(); }
  }, [saveScroll, restoreScroll]);

  const fetchMhs = useCallback(async () => {
    saveScroll();
    setMhsLoading(true);
    try {
      const url = mhsAngkatan === 'all'
        ? '/api/admin/pengguna/mahasiswa'
        : `/api/admin/pengguna/mahasiswa?angkatan=${mhsAngkatan}`;
      const res = await fetch(url);
      setMhsList(await res.json());
    } catch (e) { console.error(e); }
    finally { setMhsLoading(false); restoreScroll(); }
  }, [mhsAngkatan, saveScroll, restoreScroll]);

  useEffect(() => { fetchDosen(); }, [fetchDosen]);
  useEffect(() => { fetchMhs(); }, [fetchMhs]);

  // ── DOSEN handlers ──
  const openAddDosen = () => {
    setEditingDosen(null);
    setDosenForm({ name: '', email: '', nidn: '' });
    setDosenError('');
    setShowDosenModal(true);
  };
  const openEditDosen = (d: DosenItem) => {
    setEditingDosen(d);
    setDosenForm({ name: d.name, email: d.email, nidn: d.nidn });
    setDosenError('');
    setShowDosenModal(true);
  };
  const submitDosen = async (e: React.FormEvent) => {
    e.preventDefault();
    setDosenSaving(true); setDosenError('');
    try {
      const url = '/api/admin/pengguna/dosen';
      const method = editingDosen ? 'PUT' : 'POST';
      const body = editingDosen
        ? { dosenId: editingDosen.id, ...dosenForm }
        : dosenForm;
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setDosenError(data.error); return; }
      setShowDosenModal(false);
      fetchDosen();
    } catch { setDosenError('Terjadi kesalahan'); }
    finally { setDosenSaving(false); }
  };
  const deleteDosen = async (d: DosenItem) => {
    if (!confirm(`Hapus dosen ${d.name}? Tindakan ini tidak bisa dibatalkan.`)) return;
    const res = await fetch(`/api/admin/pengguna/dosen?dosenId=${d.id}`, { method: 'DELETE' });
    if (!res.ok) { const err = await res.json(); alert(err.error); return; }
    fetchDosen();
  };

  // ── MAHASISWA handlers ──
  const openAddMhs = () => {
    setEditingMhs(null);
    setMhsForm({ name: '', email: '', nim: '', angkatan: expandedAngkatan ?? '2023', status: 'AKTIF' });
    setMhsError('');
    setShowMhsModal(true);
  };
  const openEditMhs = (m: MhsItem) => {
    setEditingMhs(m);
    setMhsForm({ name: m.name, email: m.email, nim: m.nim, angkatan: m.angkatan, status: m.status });
    setMhsError('');
    setShowMhsModal(true);
  };
  const submitMhs = async (e: React.FormEvent) => {
    e.preventDefault();
    setMhsSaving(true); setMhsError('');
    try {
      const url = '/api/admin/pengguna/mahasiswa';
      const method = editingMhs ? 'PUT' : 'POST';
      const body = editingMhs
        ? { mahasiswaId: editingMhs.id, ...mhsForm }
        : { name: mhsForm.name, email: mhsForm.email, nim: mhsForm.nim, angkatan: mhsForm.angkatan };
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setMhsError(data.error); return; }
      setShowMhsModal(false);
      fetchMhs();
    } catch { setMhsError('Terjadi kesalahan'); }
    finally { setMhsSaving(false); }
  };
  const deleteMhs = async (m: MhsItem) => {
    if (!confirm(`Hapus mahasiswa ${m.name} (${m.nim})? Termasuk semua nilai dan KRS.`)) return;
    const res = await fetch(`/api/admin/pengguna/mahasiswa?mahasiswaId=${m.id}`, { method: 'DELETE' });
    if (!res.ok) { const err = await res.json(); alert(err.error); return; }
    fetchMhs();
  };

  // Quick status update langsung dari tabel
  const updateStatus = async (m: MhsItem, newStatus: string) => {
    setUpdatingStatus(m.id);
    try {
      const res = await fetch('/api/admin/pengguna/mahasiswa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mahasiswaId: m.id, status: newStatus }),
      });
      if (!res.ok) { const err = await res.json(); alert(err.error); return; }
      // Update local state tanpa refetch
      setMhsList((prev) => prev.map((mhs) =>
        mhs.id === m.id ? { ...mhs, status: newStatus } : mhs
      ));
    } catch { alert('Gagal mengubah status'); }
    finally { setUpdatingStatus(null); }
  };

  // ── Filter ──
  const filteredDosen = dosenList.filter((d) =>
    d.name.toLowerCase().includes(dosenSearch.toLowerCase()) ||
    d.email.toLowerCase().includes(dosenSearch.toLowerCase()) ||
    d.nidn.includes(dosenSearch)
  );

  const filteredMhs = mhsList.filter((m) =>
    m.name.toLowerCase().includes(mhsSearch.toLowerCase()) ||
    m.nim.toLowerCase().includes(mhsSearch.toLowerCase()) ||
    m.email.toLowerCase().includes(mhsSearch.toLowerCase())
  );

  // Group mahasiswa by angkatan
  const mhsByAngkatan: Record<string, MhsItem[]> = {};
  ANGKATAN_LIST.forEach((a) => { mhsByAngkatan[a] = []; });
  filteredMhs.forEach((m) => {
    if (!mhsByAngkatan[m.angkatan]) mhsByAngkatan[m.angkatan] = [];
    mhsByAngkatan[m.angkatan].push(m);
  });

  // ── Render ──
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Manajemen Pengguna</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Kelola akun dosen dan mahasiswa</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={activeTab === 'dosen' ? () => setShowDosenCSV(true) : () => setShowMhsCSV(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
            style={{ background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0" }}
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={activeTab === 'dosen' ? openAddDosen : openAddMhs}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 14px rgba(67,97,238,0.3)" }}
          >
            <Plus className="w-4 h-4" />
            Tambah {activeTab === 'dosen' ? 'Dosen' : 'Mahasiswa'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#dbeafe" }}>
              <Users className="w-5 h-5" style={{ color: "#2563eb" }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: "#94a3b8" }}>Total Dosen</p>
              <p className="text-xl font-bold" style={{ color: "#1a1d2e" }}>{dosenList.length}</p>
            </div>
          </CardContent>
        </Card>
        {ANGKATAN_LIST.map((a) => {
          const count = mhsList.filter((m) => m.angkatan === a).length;
          return (
            <Card key={a}>
              <CardContent className="p-0 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#ede9fe" }}>
                  <GraduationCap className="w-5 h-5" style={{ color: "#7c3aed" }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>Angkatan {a}</p>
                  <p className="text-xl font-bold" style={{ color: "#1a1d2e" }}>{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "#f1f5f9" }}>
        {([
          { key: 'dosen', label: 'Dosen', icon: Users },
          { key: 'mahasiswa', label: 'Mahasiswa', icon: GraduationCap },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={activeTab === tab.key
              ? { background: "#fff", color: "#4361ee", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }
              : { color: "#94a3b8" }
            }
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── DOSEN TAB ── */}
      {activeTab === 'dosen' && (
        <Card>
          <CardHeader>
            <CardTitle>Daftar Dosen</CardTitle>
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
              <input
                type="text" value={dosenSearch} onChange={(e) => setDosenSearch(e.target.value)}
                placeholder="Cari nama, email, NIDN..."
                className="pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none"
                style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e", width: "260px" }}
              />
            </div>
          </CardHeader>
          <CardContent>
            {dosenLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
              </div>
            ) : filteredDosen.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "#cbd5e1" }} />
                <p className="font-semibold" style={{ color: "#64748b" }}>Belum ada dosen</p>
                <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Klik "Tambah Dosen" untuk menambahkan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                      {["Nama Dosen", "Email Login", "NIDN", "Aksi"].map((h) => (
                        <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDosen.map((d) => (
                      <tr key={d.id} style={{ borderBottom: "1px solid #f8faff" }}>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                              style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                              {d.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-semibold" style={{ color: "#1a1d2e" }}>{d.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 text-sm" style={{ color: "#64748b" }}>{d.email}</td>
                        <td className="py-3.5 pr-4">
                          <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "#dbeafe", color: "#2563eb" }}>{d.nidn}</span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex gap-2">
                            <button onClick={() => openEditDosen(d)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50">
                              <Edit2 className="w-4 h-4" style={{ color: "#4361ee" }} />
                            </button>
                            <button onClick={() => deleteDosen(d)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50">
                              <Trash2 className="w-4 h-4" style={{ color: "#dc2626" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── MAHASISWA TAB ── */}
      {activeTab === 'mahasiswa' && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
              <input
                type="text" value={mhsSearch} onChange={(e) => setMhsSearch(e.target.value)}
                placeholder="Cari nama, NIM, email..."
                className="pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none"
                style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e", width: "260px" }}
              />
            </div>
            <select
              value={mhsAngkatan}
              onChange={(e) => setMhsAngkatan(e.target.value)}
              className="px-4 py-2 rounded-xl text-sm focus:outline-none"
              style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
            >
              <option value="all">Semua Angkatan</option>
              {ANGKATAN_LIST.map((a) => (
                <option key={a} value={a}>Angkatan {a}</option>
              ))}
            </select>
          </div>

          {mhsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
            </div>
          ) : (
            /* Per-angkatan accordion */
            ANGKATAN_LIST.map((angkatan) => {
              const items = mhsByAngkatan[angkatan] ?? [];
              if (mhsAngkatan !== 'all' && mhsAngkatan !== angkatan) return null;
              const isOpen = expandedAngkatan === angkatan;

              return (
                <Card key={angkatan}>
                  <CardContent className="p-0">
                    {/* Accordion header */}
                    <button
                      className="w-full flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-colors"
                      onClick={() => setExpandedAngkatan(isOpen ? null : angkatan)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
                          style={{ background: "#ede9fe", color: "#7c3aed" }}>
                          {angkatan.slice(2)}
                        </div>
                        <div className="text-left">
                          <p className="font-bold" style={{ color: "#1a1d2e" }}>Angkatan {angkatan}</p>
                          <p className="text-xs" style={{ color: "#94a3b8" }}>{items.length} mahasiswa</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: items.length > 0 ? "#dbeafe" : "#f1f5f9", color: items.length > 0 ? "#2563eb" : "#94a3b8" }}>
                          {items.length} mhs
                        </span>
                        <ChevronDown className="w-4 h-4 transition-transform" style={{
                          color: "#94a3b8",
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }} />
                      </div>
                    </button>

                    {/* Accordion content */}
                    {isOpen && (
                      <div className="border-t px-5 pb-5" style={{ borderColor: "#f1f5f9" }}>
                        {items.length === 0 ? (
                          <div className="text-center py-8">
                            <GraduationCap className="w-8 h-8 mx-auto mb-2" style={{ color: "#cbd5e1" }} />
                            <p className="text-sm" style={{ color: "#94a3b8" }}>Belum ada mahasiswa angkatan {angkatan}</p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto mt-4">
                            <table className="w-full text-sm">
                              <thead>
                                <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                                  {["NIM", "Nama Mahasiswa", "Email Login", "Status", "Aksi"].map((h) => (
                                    <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {items.map((m) => {
                                  const statusStyle = STATUS_STYLE[m.status as MhsStatus] ?? STATUS_STYLE.AKTIF;
                                  return (
                                  <tr key={m.id} style={{ borderBottom: "1px solid #f8faff" }}>
                                    <td className="py-3 pr-4">
                                      <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "#eef2ff", color: "#4361ee" }}>{m.nim}</span>
                                    </td>
                                    <td className="py-3 pr-4 font-semibold" style={{ color: "#1a1d2e" }}>{m.name}</td>
                                    <td className="py-3 pr-4 text-sm" style={{ color: "#64748b" }}>{m.email}</td>
                                    <td className="py-3 pr-4">
                                      {/* Dropdown status langsung */}
                                      <div className="relative inline-flex items-center">
                                        <select
                                          value={m.status}
                                          disabled={updatingStatus === m.id}
                                          onChange={(e) => updateStatus(m, e.target.value)}
                                          className="appearance-none text-xs font-semibold pl-2.5 pr-7 py-1.5 rounded-lg cursor-pointer focus:outline-none transition-all disabled:opacity-60"
                                          style={{
                                            background: statusStyle.bg,
                                            color: statusStyle.color,
                                            border: `1.5px solid ${statusStyle.color}30`,
                                          }}
                                        >
                                          {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>{STATUS_STYLE[s].label}</option>
                                          ))}
                                        </select>
                                        {updatingStatus === m.id ? (
                                          <div className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-t-transparent rounded-full animate-spin"
                                            style={{ borderColor: statusStyle.color, borderTopColor: 'transparent' }} />
                                        ) : (
                                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none"
                                            style={{ color: statusStyle.color }} />
                                        )}
                                      </div>
                                    </td>
                                    <td className="py-3">
                                      <div className="flex gap-2">
                                        <button onClick={() => openEditMhs(m)}
                                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50">
                                          <Edit2 className="w-4 h-4" style={{ color: "#4361ee" }} />
                                        </button>
                                        <button onClick={() => deleteMhs(m)}
                                          className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50">
                                          <Trash2 className="w-4 h-4" style={{ color: "#dc2626" }} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* ── MODAL DOSEN ── */}
      {showDosenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>
                {editingDosen ? 'Edit Dosen' : 'Tambah Dosen Baru'}
              </h3>
              <button onClick={() => setShowDosenModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {dosenError && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: "#fee2e2", color: "#dc2626" }}>
                {dosenError}
              </div>
            )}

            <form onSubmit={submitDosen} className="space-y-4">
              <InputField label="Nama Lengkap" value={dosenForm.name}
                onChange={(v) => setDosenForm({ ...dosenForm, name: v })}
                placeholder="Dr. Nama Dosen, S.T., M.T." />

              <InputField label="Email Login" value={dosenForm.email} type="email"
                onChange={(v) => setDosenForm({ ...dosenForm, email: v })}
                placeholder="nama@staff.uns.ac.id" />
              <p className="text-xs -mt-2" style={{ color: "#94a3b8" }}>Harus menggunakan domain @staff.uns.ac.id</p>

              <InputField label="NIDN" value={dosenForm.nidn}
                onChange={(v) => setDosenForm({ ...dosenForm, nidn: v })}
                placeholder="0612108901" />

              <div className="p-3 rounded-xl text-xs" style={{ background: "#f0fdf4", color: "#059669" }}>
                🔑 Password default: <strong>password123</strong> — bisa diubah setelah login
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowDosenModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#f1f5f9", color: "#64748b" }}>Batal</button>
                <button type="submit" disabled={dosenSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                  {dosenSaving ? 'Menyimpan...' : editingDosen ? 'Update' : 'Tambah Dosen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL MAHASISWA ── */}
      {showMhsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>
                {editingMhs ? 'Edit Mahasiswa' : 'Tambah Mahasiswa Baru'}
              </h3>
              <button onClick={() => setShowMhsModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {mhsError && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: "#fee2e2", color: "#dc2626" }}>
                {mhsError}
              </div>
            )}

            <form onSubmit={submitMhs} className="space-y-4">
              <InputField label="Nama Lengkap" value={mhsForm.name}
                onChange={(v) => setMhsForm({ ...mhsForm, name: v })}
                placeholder="Nama Mahasiswa" />

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                  NIM <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text" value={mhsForm.nim} onChange={(e) => setMhsForm({ ...mhsForm, nim: e.target.value })}
                  placeholder="I0323001" required
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e", fontFamily: "monospace" }}
                />
              </div>

              <InputField label="Email Login" value={mhsForm.email} type="email"
                onChange={(v) => setMhsForm({ ...mhsForm, email: v })}
                placeholder="nim@student.uns.ac.id" />
              <p className="text-xs -mt-2" style={{ color: "#94a3b8" }}>Harus menggunakan domain @student.uns.ac.id</p>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Angkatan <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <div className="flex gap-2">
                  {ANGKATAN_LIST.map((a) => (
                    <button
                      key={a} type="button"
                      onClick={() => setMhsForm({ ...mhsForm, angkatan: a })}
                      className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                      style={mhsForm.angkatan === a
                        ? { background: "linear-gradient(135deg, #4361ee, #7c3aed)", color: "#fff" }
                        : { background: "#f1f5f9", color: "#64748b" }
                      }
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {editingMhs && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                    Status <span style={{ color: "#dc2626" }}>*</span>
                  </label>
                  <select
                    value={mhsForm.status}
                    onChange={(e) => setMhsForm({ ...mhsForm, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_STYLE[s].label}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-3 rounded-xl text-xs" style={{ background: "#f0fdf4", color: "#059669" }}>
                🔑 Password default: <strong>password123</strong> — bisa diubah setelah login
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowMhsModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#f1f5f9", color: "#64748b" }}>Batal</button>
                <button type="submit" disabled={mhsSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                  {mhsSaving ? 'Menyimpan...' : editingMhs ? 'Update' : 'Tambah Mahasiswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL CSV DOSEN ── */}
      {showDosenCSV && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Import Dosen via CSV</h3>
              <button onClick={() => setShowDosenCSV(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <CSVUploader
              title="Upload file CSV data dosen"
              endpoint="/api/admin/import/dosen"
              templateFileName="template_dosen.csv"
              templateContent={`name,email,nidn\nDr. Nama Dosen S.T. M.T.,nama@staff.uns.ac.id,0612108901\nDr. Dosen Kedua S.T. M.Eng.,dosen2@staff.uns.ac.id,0615109002`}
              formatInfo="name, email (@staff.uns.ac.id), nidn"
              onSuccess={() => { fetchDosen(); setShowDosenCSV(false); }}
            />
          </div>
        </div>
      )}

      {/* ── MODAL CSV MAHASISWA ── */}
      {showMhsCSV && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Import Mahasiswa via CSV</h3>
              <button onClick={() => setShowMhsCSV(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <CSVUploader
              title="Upload file CSV data mahasiswa"
              endpoint="/api/admin/import/mahasiswa"
              templateFileName="template_mahasiswa.csv"
              templateContent={`name,email,nim,angkatan\nAditya Pratama,aditya@student.uns.ac.id,I0323001,2023\nBudi Santoso,budi@student.uns.ac.id,I0323002,2023\nCitra Dewi,citra@student.uns.ac.id,I0322001,2022`}
              formatInfo="name, email (@student.uns.ac.id), nim, angkatan (2022/2023/2024/2025)"
              onSuccess={() => { fetchMhs(); setShowMhsCSV(false); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
