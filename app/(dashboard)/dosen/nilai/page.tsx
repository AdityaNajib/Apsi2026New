"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ArrowLeft, Save, Plus, Edit2, Trash2, Users } from "lucide-react";

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

  useEffect(() => {
    if (kelasId) {
      fetchData();
    }
  }, [kelasId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dosen/mahasiswa/${kelasId}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setMahasiswa(Array.isArray(data.mahasiswa) ? data.mahasiswa : []);
      setKomponenNilai(Array.isArray(data.komponenNilai) ? data.komponenNilai : []);

      // Fetch existing nilai
      const nilaiTemp: NilaiData = {};
      for (const mhs of (Array.isArray(data.mahasiswa) ? data.mahasiswa : [])) {
        nilaiTemp[mhs.id] = {};
        for (const komponen of (Array.isArray(data.komponenNilai) ? data.komponenNilai : [])) {
          try {
            const nilaiRes = await fetch(
              `/api/dosen/nilai?mahasiswaId=${mhs.id}&komponenId=${komponen.id}`
            );
            if (nilaiRes.ok) {
              const nilaiData = await nilaiRes.json();
              nilaiTemp[mhs.id][komponen.id] = nilaiData?.nilai ?? null;
            }
          } catch (err) {
            console.error('Error fetching nilai:', err);
            nilaiTemp[mhs.id][komponen.id] = null;
          }
        }
      }
      setNilaiData(nilaiTemp);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to fetch data'}`);
      setMahasiswa([]);
      setKomponenNilai([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNilaiChange = (mahasiswaId: string, komponenId: string, nilai: string) => {
    setNilaiData((prev) => ({
      ...prev,
      [mahasiswaId]: {
        ...prev[mahasiswaId],
        [komponenId]: nilai === "" ? null : parseFloat(nilai),
      },
    }));
  };

  const saveNilai = async (mahasiswaId: string, komponenId: string) => {
    try {
      setSaving(true);
      const nilai = nilaiData[mahasiswaId]?.[komponenId];
      
      if (nilai === null || nilai === undefined) {
        return;
      }

      await fetch("/api/dosen/nilai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mahasiswaId, komponenId, nilai }),
      });

      alert("Nilai berhasil disimpan!");
    } catch (error) {
      console.error("Error saving nilai:", error);
      alert("Gagal menyimpan nilai");
    } finally {
      setSaving(false);
    }
  };

  const saveAllNilai = async () => {
    try {
      setSaving(true);
      const promises = [];

      for (const mhsId in nilaiData) {
        for (const kompId in nilaiData[mhsId]) {
          const nilai = nilaiData[mhsId][kompId];
          if (nilai !== null && nilai !== undefined) {
            promises.push(
              fetch("/api/dosen/nilai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  mahasiswaId: mhsId,
                  komponenId: kompId,
                  nilai,
                }),
              })
            );
          }
        }
      }

      await Promise.all(promises);
      alert("Semua nilai berhasil disimpan!");
    } catch (error) {
      console.error("Error saving all nilai:", error);
      alert("Gagal menyimpan nilai");
    } finally {
      setSaving(false);
    }
  };

  const handleKomponenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingKomponen) {
        // Update
        await fetch("/api/dosen/komponen-nilai", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingKomponen.id,
            nama: komponenForm.nama,
            bobot: parseFloat(komponenForm.bobot),
          }),
        });
      } else {
        // Create
        await fetch("/api/dosen/komponen-nilai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kelasId,
            nama: komponenForm.nama,
            bobot: parseFloat(komponenForm.bobot),
          }),
        });
      }

      setShowKomponenModal(false);
      setEditingKomponen(null);
      setKomponenForm({ nama: "", bobot: "" });
      fetchData();
    } catch (error) {
      console.error("Error saving komponen:", error);
      alert("Gagal menyimpan komponen nilai");
    }
  };

  const deleteKomponen = async (id: string) => {
    if (!confirm("Yakin ingin menghapus komponen nilai ini?")) return;

    try {
      await fetch(`/api/dosen/komponen-nilai?id=${id}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting komponen:", error);
      alert("Gagal menghapus komponen nilai");
    }
  };

  const totalBobot = komponenNilai.reduce((sum, k) => sum + k.bobot, 0);

  if (!kelasId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>
            Input Nilai Mahasiswa
          </h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Kelola komponen nilai dan input nilai mahasiswa
          </p>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "#fee2e2" }}>
              <svg className="w-8 h-8" style={{ color: "#dc2626" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="text-lg font-semibold mb-2" style={{ color: "#1a1d2e" }}>
              Kelas Tidak Dipilih
            </p>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>
              Silakan pilih mata kuliah dari halaman Mata Kuliah Ampu terlebih dahulu.
            </p>
            <a
              href="/dosen/matakuliah"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white"
              style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Mata Kuliah Ampu
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/dosen/matakuliah"
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "#f1f5f9", color: "#64748b" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </a>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>
              Input Nilai Mahasiswa
            </h2>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Kelola komponen nilai dan input nilai mahasiswa
            </p>
          </div>
        </div>
        <button
          onClick={saveAllNilai}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
        >
          <Save className="w-4 h-4" />
          {saving ? "Menyimpan..." : "Simpan Semua Nilai"}
        </button>
      </div>

      {/* Komponen Nilai Management */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {komponenNilai.map((komponen) => (
              <div
                key={komponen.id}
                className="p-4 rounded-xl border"
                style={{ background: "#f8faff", borderColor: "#e9edf4" }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold" style={{ color: "#1a1d2e" }}>
                      {komponen.nama}
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: "#4361ee" }}>
                      {komponen.bobot}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingKomponen(komponen);
                        setKomponenForm({ nama: komponen.nama, bobot: komponen.bobot.toString() });
                        setShowKomponenModal(true);
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "#dbeafe", color: "#2563eb" }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteKomponen(komponen.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: "#fee2e2", color: "#dc2626" }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl" style={{ background: totalBobot === 100 ? "#d1fae5" : "#fee2e2" }}>
            <p className="text-sm font-semibold" style={{ color: totalBobot === 100 ? "#059669" : "#dc2626" }}>
              Total Bobot: {totalBobot}% {totalBobot === 100 ? "✓ Sudah 100%" : "⚠ Harus 100%"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Nilai Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Daftar Nilai Mahasiswa ({mahasiswa.length} mahasiswa)
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mahasiswa.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "#cbd5e1" }} />
              <p className="text-sm font-medium" style={{ color: "#64748b" }}>
                Belum ada mahasiswa terdaftar di kelas ini
              </p>
            </div>
          ) : (
            <div className="w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider sticky left-0 bg-white" style={{ color: "#94a3b8" }}>
                      NIM
                    </th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider sticky left-24 bg-white" style={{ color: "#94a3b8" }}>
                      Nama Mahasiswa
                    </th>
                    {komponenNilai.map((komponen) => (
                      <th key={komponen.id} className="pb-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                        {komponen.nama}
                        <br />
                        <span style={{ color: "#4361ee" }}>({komponen.bobot}%)</span>
                      </th>
                    ))}
                    <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mahasiswa.map((mhs) => (
                    <tr key={mhs.id} style={{ borderBottom: "1px solid #f8faff" }}>
                      <td className="py-3 pr-4 sticky left-0 bg-white">
                        <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "#eef2ff", color: "#4361ee" }}>
                          {mhs.nim}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-medium sticky left-24 bg-white" style={{ color: "#1a1d2e" }}>
                        {mhs.nama}
                      </td>
                      {komponenNilai.map((komponen) => (
                        <td key={komponen.id} className="py-3 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={nilaiData[mhs.id]?.[komponen.id] ?? ""}
                            onChange={(e) => handleNilaiChange(mhs.id, komponen.id, e.target.value)}
                            className="w-20 px-2 py-1.5 rounded-lg text-center text-sm focus:outline-none"
                            style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                            placeholder="0-100"
                          />
                        </td>
                      ))}
                      <td className="py-3 text-center">
                        <button
                          onClick={() => {
                            komponenNilai.forEach((k) => saveNilai(mhs.id, k.id));
                          }}
                          disabled={saving}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{ background: "#d1fae5", color: "#059669" }}
                        >
                          Simpan
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Komponen Nilai */}
      {showKomponenModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowKomponenModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4" style={{ color: "#1a1d2e" }}>
              {editingKomponen ? "Edit Komponen Nilai" : "Tambah Komponen Nilai"}
            </h3>
            <form onSubmit={handleKomponenSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>
                  Nama Komponen
                </label>
                <input
                  type="text"
                  value={komponenForm.nama}
                  onChange={(e) => setKomponenForm({ ...komponenForm, nama: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  placeholder="Contoh: UTS, UAS, Tugas"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>
                  Bobot (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={komponenForm.bobot}
                  onChange={(e) => setKomponenForm({ ...komponenForm, bobot: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  placeholder="0-100"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowKomponenModal(false);
                    setEditingKomponen(null);
                    setKomponenForm({ nama: "", bobot: "" });
                  }}
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

export default function NilaiPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NilaiPageContent />
    </Suspense>
  );
}
