"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import CSVUploader from "@/components/ui/CSVUploader";
import { ArrowLeft, Save, BookOpen, Users, Upload, X, Plus, Edit2, Trash2 } from "lucide-react";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface KomponenNilai { id: string; nama: string; bobot: number; }
interface MahasiswaRow {
  mahasiswaId: string;
  nim: string;
  name: string;
  nilaiMap: Record<string, number | null>;
}
interface KelasInfo { id: string; nama: string; mataKuliah: string; kode: string; }

interface InputNilaiContentProps {
  goToMataKuliah: (semester: number) => void;
}

function InputNilaiContent({ goToMataKuliah }: InputNilaiContentProps) {
  const searchParams = useSearchParams();
  const kelasId = searchParams.get('kelasId');

  const [kelasInfo, setKelasInfo] = useState<KelasInfo | null>(null);
  const [komponen, setKomponen] = useState<KomponenNilai[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<MahasiswaRow[]>([]);
  const [nilaiData, setNilaiData] = useState<Record<string, Record<string, number | null>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kelasList, setKelasList] = useState<any[]>([]);
  const [showCSV, setShowCSV] = useState(false);
  const [showKomponenCSV, setShowKomponenCSV] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<number | "all">("all");
  const [totalMahasiswaUnik, setTotalMahasiswaUnik] = useState(0);
  
  // State untuk manage komponen penilaian
  const [showKomponenModal, setShowKomponenModal] = useState(false);
  const [editingKomponen, setEditingKomponen] = useState<KomponenNilai | null>(null);
  const [komponenForm, setKomponenForm] = useState({ nama: "", bobot: "" });
  const [komponenSaving, setKomponenSaving] = useState(false);
  const [komponenError, setKomponenError] = useState("");

  const { saveScroll, restoreScroll } = useScrollRestore();

  useEffect(() => {
    if (kelasId) {
      fetchNilai(kelasId);
    } else {
      Promise.all([
        fetch('/api/admin/kelas').then(r => r.json()),
        fetch('/api/admin/kelas/stats').then(r => r.json())
      ]).then(([kelasData, statsData]) => {
        setKelasList(Array.isArray(kelasData) ? kelasData : []);
        setTotalMahasiswaUnik(statsData.totalMahasiswaUnik || 0);
      }).finally(() => setLoading(false));
    }
  }, [kelasId]);

  const fetchNilai = async (id: string) => {
    saveScroll();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/nilai?kelasId=${id}`);
      const data = await res.json();
      setKelasInfo(data.kelas);
      setKomponen(data.komponenNilai ?? []);
      setMahasiswaList(data.mahasiswaList ?? []);
      const init: typeof nilaiData = {};
      (data.mahasiswaList ?? []).forEach((m: MahasiswaRow) => {
        init[m.mahasiswaId] = { ...m.nilaiMap };
      });
      setNilaiData(init);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      restoreScroll();
    }
  };

  const handleChange = (mahasiswaId: string, komponenId: string, val: string) => {
    setNilaiData((prev) => ({
      ...prev,
      [mahasiswaId]: {
        ...prev[mahasiswaId],
        [komponenId]: val === "" ? null : parseFloat(val),
      },
    }));
  };

  const [saveSuccess, setSaveSuccess] = useState(false);

  const saveAll = async () => {
    setSaving(true);
    try {
      const items: { mahasiswaId: string; komponenId: string; nilai: number }[] = [];
      Object.entries(nilaiData).forEach(([mahasiswaId, map]) => {
        Object.entries(map).forEach(([komponenId, nilai]) => {
          if (nilai !== null && nilai !== undefined && !isNaN(Number(nilai))) {
            items.push({ mahasiswaId, komponenId, nilai: Number(nilai) });
          }
        });
      });

      if (items.length === 0) return;

      // Kirim semua sekaligus via batch
      await Promise.all(
        items.map((item) =>
          fetch('/api/admin/nilai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
          })
        )
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      alert('Gagal menyimpan nilai');
    } finally {
      setSaving(false);
    }
  };

  // Handler untuk manage komponen penilaian
  const handleKomponenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelasId) return;
    setKomponenSaving(true);
    setKomponenError("");

    try {
      const res = editingKomponen
        ? await fetch("/api/admin/komponen-nilai", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: editingKomponen.id,
              nama: komponenForm.nama,
              bobot: parseFloat(komponenForm.bobot),
            }),
          })
        : await fetch("/api/admin/komponen-nilai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kelasId,
              nama: komponenForm.nama,
              bobot: parseFloat(komponenForm.bobot),
            }),
          });

      const resData = await res.json();
      if (!res.ok) {
        setKomponenError(resData.error || "Gagal menyimpan komponen nilai");
        return;
      }

      setShowKomponenModal(false);
      setEditingKomponen(null);
      setKomponenForm({ nama: "", bobot: "" });
      setKomponenError("");
      await fetchNilai(kelasId);
    } catch (error) {
      console.error("Error saving komponen:", error);
      setKomponenError(error instanceof Error ? error.message : "Gagal menyimpan komponen nilai");
    } finally {
      setKomponenSaving(false);
    }
  };

  const deleteKomponen = async (id: string) => {
    if (!confirm("Yakin ingin menghapus komponen nilai ini? Semua nilai terkait akan ikut terhapus.")) return;
    if (!kelasId) return;

    try {
      const res = await fetch(`/api/admin/komponen-nilai?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Gagal menghapus");
        return;
      }
      await fetchNilai(kelasId);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menghapus komponen nilai");
    }
  };

  const openEditKomponen = (k: KomponenNilai) => {
    setEditingKomponen(k);
    setKomponenForm({ nama: k.nama, bobot: k.bobot.toString() });
    setKomponenError("");
    setShowKomponenModal(true);
  };

  const openAddKomponen = () => {
    setEditingKomponen(null);
    setKomponenForm({ nama: "", bobot: "" });
    setKomponenError("");
    setShowKomponenModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
      </div>
    );
  }

  // No kelasId → show kelas selector
  if (!kelasId) {
    const filteredKelas = selectedSemester === "all" 
      ? kelasList 
      : kelasList.filter(k => k.mataKuliah.semester === selectedSemester);
    
    // Group by semester
    const bySemester = filteredKelas.reduce((acc, kelas) => {
      const sem = kelas.mataKuliah.semester;
      if (!acc[sem]) acc[sem] = [];
      acc[sem].push(kelas);
      return acc;
    }, {} as Record<number, typeof kelasList>);

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
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Input Nilai Mahasiswa</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Pilih kelas untuk mulai input nilai</p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { label: "Total Kelas", value: kelasList.length, bg: "#eef2ff", color: "#4361ee", icon: BookOpen },
            { label: "Mahasiswa Aktif", value: totalMahasiswaUnik, bg: "#d1fae5", color: "#059669", icon: Users },
            { label: "Siap Input", value: kelasList.filter(k => k.jumlahMahasiswa > 0).length, bg: "#fef3c7", color: "#d97706", icon: Upload },
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
        
        {/* Semester Filter */}
        <div className="flex flex-wrap gap-3">
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
        
        {/* Kelas List per semester */}
        {filteredKelas.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "#cbd5e1" }} />
              <p className="font-semibold" style={{ color: "#64748b" }}>Tidak ada kelas</p>
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                Buat kelas terlebih dahulu di menu Akademik
              </p>
            </CardContent>
          </Card>
        ) : (
          (Object.entries(bySemester) as [string, any[]][])
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
                      {items.length} kelas
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map((k) => (
                      <a key={k.id} href={`/admin/akademik?tab=input-nilai&kelasId=${k.id}`}>
                        <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
                          <CardContent className="p-0">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold" style={{ background: sc.bg, color: sc.color }}>
                                {k.nama}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-sm truncate" style={{ color: "#1a1d2e" }}>{k.mataKuliah.nama}</p>
                                <p className="text-xs font-mono mt-0.5" style={{ color: "#94a3b8" }}>{k.mataKuliah.kode} · Kelas {k.nama}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "#dbeafe", color: "#2563eb" }}>
                                    {k.jumlahMahasiswa} mhs
                                  </span>
                                  <span className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ background: "#d1fae5", color: "#059669" }}>
                                    {k.mataKuliah.sks} SKS
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    ))}
                  </div>
                </div>
              );
            })
        )}
      </div>
    );
  }

  const totalBobot = komponen.reduce((s, k) => s + k.bobot, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/admin/akademik?tab=input-nilai"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "#f1f5f9", color: "#64748b" }}>
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Input Nilai</h2>
            {kelasInfo && (
              <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
                {kelasInfo.kode} — {kelasInfo.mataKuliah} · Kelas {kelasInfo.nama}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={openAddKomponen}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#ede9fe", color: "#7c3aed", border: "1px solid #ddd6fe" }}
          >
            <Plus className="w-4 h-4" />
            Tambah Komponen
          </button>
          <button
            onClick={() => setShowKomponenCSV(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a" }}
          >
            <Upload className="w-4 h-4" />
            Import Komponen
          </button>
          {komponen.length > 0 && (
            <button
              onClick={() => setShowCSV(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0" }}
            >
              <Upload className="w-4 h-4" />
              Import Nilai
            </button>
          )}
          <button
            onClick={saveAll}
            disabled={saving || komponen.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: saveSuccess ? "#059669" : "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : saveSuccess ? "Tersimpan ✓" : "Simpan Semua"}
          </button>
        </div>
      </div>

      {/* Modal CSV Nilai */}
      {showCSV && kelasId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Import Nilai via CSV</h3>
                {kelasInfo && (
                  <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
                    {kelasInfo.kode} — {kelasInfo.mataKuliah} · Kelas {kelasInfo.nama}
                  </p>
                )}
              </div>
              <button onClick={() => setShowCSV(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <CSVUploader
              title="Upload file CSV nilai mahasiswa"
              endpoint="/api/admin/import/nilai"
              extraFields={{ kelasId }}
              templateFileName="template_nilai.csv"
              templateContent={`nim,${komponen.map((k) => k.nama).join(',')}\nI0323001,${komponen.map(() => '85').join(',')}\nI0323002,${komponen.map(() => '90').join(',')}`}
              formatInfo={`nim, ${komponen.map((k) => `${k.nama} (0-100)`).join(', ')}`}
              onSuccess={() => { fetchNilai(kelasId); setShowCSV(false); }}
            />
          </div>
        </div>
      )}

      {/* Modal CSV Komponen Nilai */}
      {showKomponenCSV && kelasId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Import Komponen Nilai via CSV</h3>
                {kelasInfo && (
                  <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
                    {kelasInfo.kode} — {kelasInfo.mataKuliah} · Kelas {kelasInfo.nama}
                  </p>
                )}
              </div>
              <button onClick={() => setShowKomponenCSV(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <CSVUploader
              title="Upload file CSV komponen nilai"
              endpoint="/api/admin/import/komponen-nilai"
              extraFields={{ kelasId }}
              templateFileName="template_komponen_nilai.csv"
              templateContent="nama,bobot\nUTS,30\nUAS,40\nTugas,20\nKuis,10"
              formatInfo="nama, bobot (0-100, total harus 100%)"
              onSuccess={() => { fetchNilai(kelasId); setShowKomponenCSV(false); }}
            />
          </div>
        </div>
      )}

      {/* Bobot info dengan action buttons */}
      {komponen.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 mb-3">
              {komponen.map((k) => (
                <div key={k.id} className="px-3 py-2 rounded-xl text-sm flex items-center gap-2 group" style={{ background: "#f1f5f9" }}>
                  <span className="font-semibold" style={{ color: "#1a1d2e" }}>{k.nama}</span>
                  <span className="font-bold" style={{ color: "#4361ee" }}>{k.bobot}%</span>
                  <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditKomponen(k)}
                      className="p-1 rounded hover:bg-blue-100"
                      title="Edit komponen"
                    >
                      <Edit2 className="w-3 h-3" style={{ color: "#4361ee" }} />
                    </button>
                    <button
                      onClick={() => deleteKomponen(k.id)}
                      className="p-1 rounded hover:bg-red-100"
                      title="Hapus komponen"
                    >
                      <Trash2 className="w-3 h-3" style={{ color: "#dc2626" }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: totalBobot === 100 ? "#059669" : "#dc2626" }}
            >
              Total bobot: {totalBobot}% {totalBobot === 100 ? "✓" : "⚠ Harus 100%"}
            </p>
          </CardContent>
        </Card>
      )}

      {komponen.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="font-semibold" style={{ color: "#64748b" }}>Belum ada komponen nilai untuk kelas ini</p>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Minta dosen untuk menambahkan komponen penilaian terlebih dahulu</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Nilai Mahasiswa ({mahasiswaList.length} orang)
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mahasiswaList.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>Belum ada mahasiswa aktif terdaftar</p>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                      <th className="pb-3 text-left text-xs font-semibold uppercase sticky left-0 bg-white" style={{ color: "#94a3b8" }}>NIM</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase sticky left-24 bg-white pr-4" style={{ color: "#94a3b8" }}>Nama</th>
                      {komponen.map((k) => (
                        <th key={k.id} className="pb-3 text-center text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>
                          {k.nama}<br />
                          <span style={{ color: "#4361ee" }}>({k.bobot}%)</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mahasiswaList.map((mhs) => (
                      <tr key={mhs.mahasiswaId} style={{ borderBottom: "1px solid #f8faff" }}>
                        <td className="py-3 pr-4 sticky left-0 bg-white">
                          <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "#eef2ff", color: "#4361ee" }}>{mhs.nim}</span>
                        </td>
                        <td className="py-3 pr-6 font-medium sticky left-24 bg-white" style={{ color: "#1a1d2e" }}>{mhs.name}</td>
                        {komponen.map((k) => (
                          <td key={k.id} className="py-3 px-2 text-center">
                            <input
                              type="number"
                              min="0" max="100" step="0.01"
                              value={nilaiData[mhs.mahasiswaId]?.[k.id] ?? ""}
                              onChange={(e) => handleChange(mhs.mahasiswaId, k.id, e.target.value)}
                              className="w-20 px-2 py-1.5 rounded-lg text-center text-sm focus:outline-none"
                              style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                              placeholder="0-100"
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal Form Komponen Penilaian */}
      {showKomponenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>
                {editingKomponen ? "Edit Komponen Penilaian" : "Tambah Komponen Penilaian"}
              </h3>
              <button onClick={() => setShowKomponenModal(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {komponenError && (
              <div className="mb-4 p-3 rounded-xl text-sm" style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}>
                {komponenError}
              </div>
            )}

            <form onSubmit={handleKomponenSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Nama Komponen <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  value={komponenForm.nama}
                  onChange={(e) => setKomponenForm({ ...komponenForm, nama: e.target.value })}
                  placeholder="UTS, UAS, Tugas, Kuis, dll"
                  required
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#4361ee"; e.currentTarget.style.background = "#fff"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Bobot (%) <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={komponenForm.bobot}
                  onChange={(e) => setKomponenForm({ ...komponenForm, bobot: e.target.value })}
                  placeholder="0-100"
                  required
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#4361ee"; e.currentTarget.style.background = "#fff"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                />
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                  Total semua komponen harus 100%{" "}
                  {komponen.length > 0 && (
                    <span style={{ color: "#4361ee", fontWeight: 600 }}>
                      (sisa: {editingKomponen
                        ? 100 - komponen.reduce((s, k) => s + k.bobot, 0) + editingKomponen.bobot
                        : 100 - komponen.reduce((s, k) => s + k.bobot, 0)}%)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowKomponenModal(false); setKomponenError(""); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#f1f5f9", color: "#64748b" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={komponenSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
                >
                  {komponenSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.4)", borderTopColor: "#fff" }} />
                      Menyimpan...
                    </>
                  ) : (
                    editingKomponen ? "Update" : "Tambah"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface InputNilaiTabProps {
  goToMataKuliah: (semester: number) => void;
}

export default function InputNilaiTab({ goToMataKuliah }: InputNilaiTabProps) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
      </div>
    }>
      <InputNilaiContent goToMataKuliah={goToMataKuliah} />
    </Suspense>
  );
}
