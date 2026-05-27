"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { BookOpen, Target, FileCheck2, Plus, Edit2, Trash2, X } from "lucide-react";

type TabType = "cpl" | "pi" | "cpmk";

export default function AdminDataKurikulumPage() {
  const [activeTab, setActiveTab] = useState<TabType>("cpl");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [options, setOptions] = useState({ cpl: [], pi: [], mk: [] });
  const [form, setForm] = useState({ kode: "", deskripsi: "", cplId: "", piId: "", mkId: "" });

  useEffect(() => {
    loadData();
    loadOptions();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kaprodi/kurikulum?type=${activeTab}`);
      const result = await res.json();
      setData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.error("Error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadOptions = async () => {
    try {
      if (activeTab === "pi" || activeTab === "cpmk") {
        const cplRes = await fetch("/api/kaprodi/kurikulum/options?type=cpl");
        const cplData = await cplRes.json();
        setOptions(prev => ({ ...prev, cpl: cplData }));
      }
      if (activeTab === "cpmk") {
        const [piRes, mkRes] = await Promise.all([
          fetch("/api/kaprodi/kurikulum/options?type=pi"),
          fetch("/api/kaprodi/kurikulum/options?type=mk")
        ]);
        const [piData, mkData] = await Promise.all([piRes.json(), mkRes.json()]);
        setOptions(prev => ({ ...prev, pi: piData, mk: mkData }));
      }
    } catch (error) {
      console.error("Error loading options:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = `/api/kaprodi/kurikulum/${activeTab}`;
    const payload: any = { kode: form.kode, deskripsi: form.deskripsi };
    if (editItem) payload.id = editItem.id;
    if (activeTab === "pi") payload.cplId = form.cplId;
    if (activeTab === "cpmk") {
      payload.piId = form.piId;
      payload.mkId = form.mkId;
    }

    try {
      const res = await fetch(endpoint, {
        method: editItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        loadData();
        closeModal();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus data ini?")) return;
    try {
      const res = await fetch(`/api/kaprodi/kurikulum/${activeTab}?id=${id}`, { method: "DELETE" });
      if (res.ok) loadData();
      else {
        const err = await res.json();
        alert(err.error || "Gagal menghapus");
      }
    } catch (error) {
      alert("Terjadi kesalahan");
    }
  };

  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({
      kode: item.kode,
      deskripsi: item.deskripsi,
      cplId: item.cplId || "",
      piId: item.piId || "",
      mkId: item.mkId || "",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setForm({ kode: "", deskripsi: "", cplId: "", piId: "", mkId: "" });
  };

  const stats = [
    { title: "Total CPL", value: data.length, icon: Target, bg: "#ede9fe", color: "#7c3aed" },
    { title: "Total PI", value: data.length, icon: BookOpen, bg: "#dbeafe", color: "#2563eb" },
    { title: "Total CPMK", value: data.length, icon: FileCheck2, bg: "#d1fae5", color: "#059669" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Data Kurikulum</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Kelola CPL, PI, dan CPMK</p>
        </div>
        <button
          onClick={() => { closeModal(); setShowModal(true); }}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
        >
          <Plus className="w-4 h-4" />
          Tambah {activeTab.toUpperCase()}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon className="w-6 h-6" style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{s.value}</p>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>{s.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 border-b" style={{ borderColor: "#e2e8f0" }}>
        {[
          { key: "cpl" as TabType, label: "CPL" },
          { key: "pi" as TabType, label: "PI" },
          { key: "cpmk" as TabType, label: "CPMK" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-3 text-sm font-semibold ${activeTab === tab.key ? "border-b-2" : ""}`}
            style={{
              color: activeTab === tab.key ? "#4361ee" : "#94a3b8",
              borderColor: activeTab === tab.key ? "#4361ee" : "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Kode</th>
                    {activeTab === "pi" && <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>CPL</th>}
                    {activeTab === "cpmk" && <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Mata Kuliah</th>}
                    {activeTab === "cpmk" && <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>PI</th>}
                    <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Deskripsi</th>
                    <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f8faff" }}>
                      <td className="py-4">
                        <span className="px-3 py-1 rounded-lg font-semibold text-sm" style={{ 
                          background: activeTab === "cpl" ? "#ede9fe" : activeTab === "pi" ? "#dbeafe" : "#d1fae5",
                          color: activeTab === "cpl" ? "#7c3aed" : activeTab === "pi" ? "#2563eb" : "#059669"
                        }}>
                          {item.kode}
                        </span>
                      </td>
                      {activeTab === "pi" && (
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-lg text-xs" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                            {item.cpl?.kode}
                          </span>
                        </td>
                      )}
                      {activeTab === "cpmk" && (
                        <>
                          <td className="py-4">
                            <p className="font-semibold text-sm" style={{ color: "#1a1d2e" }}>{item.mataKuliah?.nama}</p>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>{item.mataKuliah?.kode}</p>
                          </td>
                          <td className="py-4">
                            <span className="px-2 py-1 rounded-lg text-xs" style={{ background: "#dbeafe", color: "#2563eb" }}>
                              {item.pi?.kode}
                            </span>
                          </td>
                        </>
                      )}
                      <td className="py-4" style={{ color: "#1a1d2e" }}>{item.deskripsi}</td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-blue-50">
                            <Edit2 className="w-4 h-4" style={{ color: "#4361ee" }} />
                          </button>
                          <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50">
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

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>
                {editItem ? "Edit" : "Tambah"} {activeTab.toUpperCase()}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Kode</label>
                <input
                  type="text"
                  value={form.kode}
                  onChange={(e) => setForm({ ...form, kode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              {activeTab === "pi" && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>CPL</label>
                  <select
                    value={form.cplId}
                    onChange={(e) => setForm({ ...form, cplId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Pilih CPL</option>
                    {options.cpl.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.kode} - {c.deskripsi}</option>
                    ))}
                  </select>
                </div>
              )}
              {activeTab === "cpmk" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Mata Kuliah</label>
                    <select
                      value={form.mkId}
                      onChange={(e) => setForm({ ...form, mkId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Pilih MK</option>
                      {options.mk.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.kode} - {m.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>PI</label>
                    <select
                      value={form.piId}
                      onChange={(e) => setForm({ ...form, piId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Pilih PI</option>
                      {options.pi.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.kode} - {p.deskripsi}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Deskripsi</label>
                <textarea
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 rounded-lg border"
                  style={{ color: "#64748b" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
                >
                  {editItem ? "Update" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
