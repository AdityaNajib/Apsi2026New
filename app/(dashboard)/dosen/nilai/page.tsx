"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import CSVUploader from "@/components/ui/CSVUploader";
import {
  ArrowLeft, Save, Plus, Edit2, Trash2,
  Users, BookOpen, Upload, X,
} from "lucide-react";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface MataKuliah {
  kelasId: string;
  kode: string;
  nama: string;
  kelas: string;
  jumlahMahasiswa: number;
  statusNilai: string;
}

interface Mahasiswa {
  id: string;
  nim: string;
  nama: string;
  angkatan: string;
  status: string;
}

interface KomponenNilai {
  id: string;
  nama: string;
  bobot: number;
}

interface NilaiData {
  [mahasiswaId: string]: {
    [komponenId: string]: number | null;
  };
}

// ─── Selector kelas ────────────────────────────────────────────────────────────
function SelectMataKuliahCard() {
  const router = useRouter();
  const [mataKuliah, setMataKuliah] = useState<MataKuliah[]>([]);
  const [loading, setLoading] = useState(true);
  const { saveScroll, restoreScroll } = useScrollRestore();

  useEffect(() => {
    saveScroll();
    fetch("/api/dosen/mata-kuliah")
      .then((r) => r.json())
      .then((data) => setMataKuliah(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => { setLoading(false); restoreScroll(); });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (mataKuliah.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <p className="font-semibold" style={{ color: "#64748b" }}>Tidak ada mata kuliah yang diampu</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {mataKuliah.map((mk) => (
        <div
          key={mk.kelasId}
          className="cursor-pointer"
          onClick={() => router.push(`/dosen/nilai?kelasId=${mk.kelasId}`)}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-0 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "#ede9fe" }}>
                <BookOpen className="w-6 h-6" style={{ color: "#7c3aed" }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base truncate" style={{ color: "#1a1d2e" }}>{mk.nama}</h3>
                <p className="text-sm" style={{ color: "#94a3b8" }}>{mk.kode} · Kelas {mk.kelas}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 rounded-lg"
                    style={{ background: "#dbeafe", color: "#2563eb" }}>
                    {mk.jumlahMahasiswa} Mahasiswa
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg"
                    style={{
                      background: mk.statusNilai === "Siap Input Nilai" ? "#d1fae5" : "#fef3c7",
                      color: mk.statusNilai === "Siap Input Nilai" ? "#059669" : "#d97706",
                    }}>
                    {mk.statusNilai}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

// ─── Konten utama input nilai ──────────────────────────────────────────────────
function NilaiPageContent() {
  const searchParams = useSearchParams();
  const kelasId = searchParams.get("kelasId");

  const [mahasiswa, setMahasiswa] = useState<Mahasiswa[]>([]);
  const [komponenNilai, setKomponenNilai] = useState<KomponenNilai[]>([]);
  const [nilaiData, setNilaiData] = useState<NilaiData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKomponenModal, setShowKomponenModal] = useState(false);
  const [editingKomponen, setEditingKomponen] = useState<KomponenNilai | null>(null);
  const [komponenForm, setKomponenForm] = useState({ nama: "", bobot: "" });
  const [showCSV, setShowCSV] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { saveScroll, restoreScroll } = useScrollRestore();

  useEffect(() => {
    if (kelasId) fetchData();
  }, [kelasId]);

  const fetchData = async () => {
    if (!kelasId) return;
    saveScroll();
    try {
      setLoading(true);
      const res = await fetch(`/api/dosen/mahasiswa/${kelasId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const mahasiswaArr: Mahasiswa[] = Array.isArray(data.mahasiswa) ? data.mahasiswa : [];
      const komponenArr: KomponenNilai[] = Array.isArray(data.komponenNilai) ? data.komponenNilai : [];

      setMahasiswa(mahasiswaArr);
      setKomponenNilai(komponenArr);

      const nilaiTemp: NilaiData = {};
      mahasiswaArr.forEach((mhs) => { nilaiTemp[mhs.id] = {}; });

      if (mahasiswaArr.length > 0 && komponenArr.length > 0) {
        const batchRes = await fetch(`/api/dosen/nilai-batch?kelasId=${kelasId}`);
        if (batchRes.ok) {
          const batchData: Record<string, Record<string, number>> = await batchRes.json();
          mahasiswaArr.forEach((mhs) => {
            komponenArr.forEach((k) => {
              nilaiTemp[mhs.id][k.id] = batchData[mhs.id]?.[k.id] ?? null;
            });
          });
        }
      }

      setNilaiData(nilaiTemp);
    } catch (error) {
      console.error("Error fetching data:", error);
      setMahasiswa([]);
      setKomponenNilai([]);
    } finally {
      setLoading(false);
      restoreScroll();
    }
  };

  const handleNilaiChange = (mahasiswaId: string, komponenId: string, val: string) => {
    setNilaiData((prev) => ({
      ...prev,
      [mahasiswaId]: {
        ...prev[mahasiswaId],
        [komponenId]: val === "" ? null : parseFloat(val),
      },
    }));
  };

  // Batch save — satu request
  const saveAllNilai = async () => {
    try {
      setSaving(true);
      const items: { mahasiswaId: string; komponenId: string; nilai: number }[] = [];

      for (const mhsId in nilaiData) {
        for (const kompId in nilaiData[mhsId]) {
          const nilai = nilaiData[mhsId][kompId];
          if (nilai !== null && nilai !== undefined && !isNaN(nilai)) {
            items.push({ mahasiswaId: mhsId, komponenId: kompId, nilai });
          }
        }
      }

      if (items.length === 0) return;

      const res = await fetch("/api/dosen/nilai-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving nilai:", error);
      alert(`Gagal menyimpan nilai: ${error instanceof Error ? error.message : "Error tidak diketahui"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleKomponenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = editingKomponen
        ? await fetch("/api/dosen/komponen-nilai", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: editingKomponen.id,
              nama: komponenForm.nama,
              bobot: parseFloat(komponenForm.bobot),
            }),
          })
        : await fetch("/api/dosen/komponen-nilai", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              kelasId,
              nama: komponenForm.nama,
              bobot: parseFloat(komponenForm.bobot),
            }),
          });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menyimpan komponen nilai");
      }

      setShowKomponenModal(false);
      setEditingKomponen(null);
      setKomponenForm({ nama: "", bobot: "" });
      await fetchData();
    } catch (error) {
      console.error("Error saving komponen:", error);
      alert(error instanceof Error ? error.message : "Gagal menyimpan komponen nilai");
    }
  };

  const deleteKomponen = async (id: string) => {
    if (!confirm("Yakin ingin menghapus komponen nilai ini? Semua nilai terkait akan ikut terhapus.")) return;
    try {
      await fetch(`/api/dosen/komponen-nilai?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch {
      alert("Gagal menghapus komponen nilai");
    }
  };

  const totalBobot = komponenNilai.reduce((s, k) => s + k.bobot, 0);

  // Buat template CSV dinamis sesuai komponen yang ada
  const csvTemplateContent = [
    `nim,${komponenNilai.map((k) => k.nama).join(",")}`,
    `I0323001,${komponenNilai.map(() => "85").join(",")}`,
    `I0323002,${komponenNilai.map(() => "90").join(",")}`,
  ].join("\n");

  const csvFormatInfo = komponenNilai.length > 0
    ? `nim, ${komponenNilai.map((k) => `${k.nama} (0-100)`).join(", ")}`
    : "nim, <komponen1>, <komponen2>, ...";

  // ── Pilih kelas dulu ──
  if (!kelasId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Input Nilai Mahasiswa</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Pilih mata kuliah untuk input nilai</p>
        </div>
        <SelectMataKuliahCard />
      </div>
    );
  }

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
        <div className="flex items-center gap-4">
          <a
            href="/dosen/nilai"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "#f1f5f9", color: "#64748b" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#e2e8f0"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Input Nilai Mahasiswa</h2>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Kelola komponen nilai dan input nilai mahasiswa
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {komponenNilai.length > 0 && (
            <button
              onClick={() => setShowCSV(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0" }}
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </button>
          )}
          <button
            onClick={saveAllNilai}
            disabled={saving || komponenNilai.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-all"
            style={{ background: saveSuccess ? "#059669" : "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            <Save className="w-4 h-4" />
            {saving ? "Menyimpan..." : saveSuccess ? "Tersimpan ✓" : "Simpan Semua Nilai"}
          </button>
        </div>
      </div>

      {/* ── Modal Import CSV ── */}
      {showCSV && kelasId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>Import Nilai via CSV</h3>
                <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
                  Template otomatis menyesuaikan komponen kelas ini
                </p>
              </div>
              <button
                onClick={() => setShowCSV(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "#64748b" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info komponen */}
            <div className="flex flex-wrap gap-2 mb-4">
              {komponenNilai.map((k) => (
                <span key={k.id} className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                  style={{ background: "#eef2ff", color: "#4361ee" }}>
                  {k.nama} ({k.bobot}%)
                </span>
              ))}
            </div>

            <CSVUploader
              title="Upload file CSV nilai mahasiswa"
              endpoint="/api/dosen/import/nilai"
              extraFields={{ kelasId }}
              templateFileName={`template_nilai_${kelasId}.csv`}
              templateContent={csvTemplateContent}
              formatInfo={csvFormatInfo}
              onSuccess={() => { fetchData(); setShowCSV(false); }}
            />
          </div>
        </div>
      )}

      {/* ── Komponen Penilaian ── */}
      <Card>
        <CardHeader>
          <CardTitle>Komponen Penilaian</CardTitle>
          <button
            onClick={() => {
              setShowKomponenModal(true);
              setEditingKomponen(null);
              setKomponenForm({ nama: "", bobot: "" });
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            <Plus className="w-4 h-4" />
            Tambah Komponen
          </button>
        </CardHeader>
        <CardContent>
          {komponenNilai.length === 0 ? (
            <p className="text-sm text-center py-6" style={{ color: "#94a3b8" }}>
              Belum ada komponen penilaian. Tambahkan dulu sebelum input nilai.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
              {komponenNilai.map((komponen) => (
                <div key={komponen.id} className="p-4 rounded-xl border"
                  style={{ background: "#f8faff", borderColor: "#e9edf4" }}>
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-sm" style={{ color: "#1a1d2e" }}>{komponen.nama}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingKomponen(komponen);
                          setKomponenForm({ nama: komponen.nama, bobot: komponen.bobot.toString() });
                          setShowKomponenModal(true);
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "#dbeafe", color: "#2563eb" }}
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteKomponen(komponen.id)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: "#fee2e2", color: "#dc2626" }}
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: "#4361ee" }}>{komponen.bobot}%</p>
                </div>
              ))}
            </div>
          )}

          <div className="p-3 rounded-xl"
            style={{ background: totalBobot === 100 ? "#d1fae5" : "#fee2e2" }}>
            <p className="text-sm font-semibold"
              style={{ color: totalBobot === 100 ? "#059669" : "#dc2626" }}>
              Total Bobot: {totalBobot}%
              {totalBobot === 100 ? " ✓ Sudah 100%" : " ⚠ Harus 100%"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabel Nilai ── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Daftar Nilai Mahasiswa ({mahasiswa.length} orang)
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {komponenNilai.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
              Tambahkan komponen penilaian terlebih dahulu
            </p>
          ) : mahasiswa.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "#94a3b8" }}>
              Belum ada mahasiswa aktif terdaftar di kelas ini
            </p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider sticky left-0 bg-white pr-3"
                      style={{ color: "#94a3b8" }}>NIM</th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider sticky left-24 bg-white pr-4"
                      style={{ color: "#94a3b8" }}>Nama Mahasiswa</th>
                    {komponenNilai.map((k) => (
                      <th key={k.id} className="pb-3 text-center text-xs font-semibold uppercase tracking-wider min-w-[100px]"
                        style={{ color: "#94a3b8" }}>
                        {k.nama}<br />
                        <span style={{ color: "#4361ee" }}>({k.bobot}%)</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mahasiswa.map((mhs) => (
                    <tr key={mhs.id} style={{ borderBottom: "1px solid #f8faff" }}>
                      <td className="py-3 pr-3 sticky left-0 bg-white">
                        <span className="text-xs font-bold px-2 py-1 rounded-lg"
                          style={{ background: "#eef2ff", color: "#4361ee" }}>
                          {mhs.nim}
                        </span>
                      </td>
                      <td className="py-3 pr-6 font-medium sticky left-24 bg-white"
                        style={{ color: "#1a1d2e" }}>
                        {mhs.nama}
                      </td>
                      {komponenNilai.map((k) => (
                        <td key={k.id} className="py-3 px-2 text-center">
                          <input
                            type="number"
                            min="0" max="100" step="0.01"
                            value={nilaiData[mhs.id]?.[k.id] ?? ""}
                            onChange={(e) => handleNilaiChange(mhs.id, k.id, e.target.value)}
                            className="w-24 px-2 py-1.5 rounded-lg text-center text-sm focus:outline-none"
                            style={{
                              background: "#f1f5f9",
                              border: "1.5px solid #e2e8f0",
                              color: "#1a1d2e",
                            }}
                            onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#4361ee"; (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                            onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
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

      {/* ── Modal Tambah/Edit Komponen ── */}
      {showKomponenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowKomponenModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4" style={{ color: "#1a1d2e" }}>
              {editingKomponen ? "Edit Komponen Nilai" : "Tambah Komponen Nilai"}
            </h3>
            <form onSubmit={handleKomponenSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Nama Komponen
                </label>
                <input
                  type="text"
                  value={komponenForm.nama}
                  onChange={(e) => setKomponenForm({ ...komponenForm, nama: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  placeholder="Contoh: UTS, UAS, Tugas, Kuis"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Bobot (%)
                </label>
                <input
                  type="number"
                  min="0" max="100" step="0.01"
                  value={komponenForm.bobot}
                  onChange={(e) => setKomponenForm({ ...komponenForm, bobot: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  placeholder="Contoh: 30"
                  required
                />
                {komponenNilai.length > 0 && (
                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    Sisa bobot tersedia:{" "}
                    <span className="font-semibold" style={{ color: "#4361ee" }}>
                      {editingKomponen
                        ? 100 - totalBobot + editingKomponen.bobot
                        : 100 - totalBobot}%
                    </span>
                  </p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowKomponenModal(false); setEditingKomponen(null); setKomponenForm({ nama: "", bobot: "" }); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: "#f1f5f9", color: "#64748b" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
                >
                  {editingKomponen ? "Update" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page wrapper ──────────────────────────────────────────────────────────────
export default function NilaiPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
      </div>
    }>
      <NilaiPageContent />
    </Suspense>
  );
}
