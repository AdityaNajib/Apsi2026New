"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen, Target, FileCheck2, Plus, Edit2, Trash2, X } from "lucide-react";

interface CPL {
  id: string;
  kode: string;
  deskripsi: string;
  _count: { pi: number };
}

interface PI {
  id: string;
  kode: string;
  deskripsi: string;
  cplId: string;
  cpl: { kode: string };
  _count: { cpmk: number };
}

interface CPMK {
  id: string;
  kode: string;
  deskripsi: string;
  piId: string;
  mkId: string;
  pi: { kode: string };
  mataKuliah: { kode: string; nama: string };
}

export default function DataKurikulumPage() {
  const [activeTab, setActiveTab] = useState<"cpl" | "pi" | "cpmk">("cpl");
  const [cplData, setCplData] = useState<CPL[]>([]);
  const [piData, setPiData] = useState<PI[]>([]);
  const [cpmkData, setCpmkData] = useState<CPMK[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const [cplOptions, setCplOptions] = useState<any[]>([]);
  const [piOptions, setPiOptions] = useState<any[]>([]);
  const [mkOptions, setMKOptions] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    kode: "",
    deskripsi: "",
    cplId: "",
    piId: "",
    mkId: "",
  });

  useEffect(() => {
    fetchData();
    fetchOptions();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kaprodi/kurikulum?type=${activeTab}`);
      const data = await res.json();
      
      if (activeTab === "cpl") setCplData(data);
      else if (activeTab === "pi") setPiData(data);
      else setCpmkData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      if (activeTab === "pi" || activeTab === "cpmk") {
        const cplRes = await fetch("/api/kaprodi/kurikulum/options?type=cpl");
        const cplData = await cplRes.json();
        setCplOptions(cplData);
      }
      
      if (activeTab === "cpmk") {
        const piRes = await fetch("/api/kaprodi/kurikulum/options?type=pi");
        const piData = await piRes.json();
        setPiOptions(piData);
        
        const mkRes = await fetch("/api/kaprodi/kurikulum/options?type=mk");
        const mkData = await mkRes.json();
        setMKOptions(mkData);
      }
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = `/api/kaprodi/kurikulum/${activeTab}`;
      const method = editingItem ? "PUT" : "POST";
      
      const payload: any = { kode: formData.kode, deskripsi: formData.deskripsi };
      if (editingItem) payload.id = editingItem.id;
      if (activeTab === "pi") payload.cplId = formData.cplId;
      if (activeTab === "cpmk") {
        payload.piId = formData.piId;
        payload.mkId = formData.mkId;
      }

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchData();
        setShowModal(false);
        resetForm();
      } else {
        const error = await res.json();
        alert(error.error || "Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error saving:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus data ini?")) return;
    
    try {
      const res = await fetch(`/api/kaprodi/kurikulum/${activeTab}?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "Gagal menghapus data");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      kode: item.kode,
      deskripsi: item.deskripsi,
      cplId: item.cplId || "",
      piId: item.piId || "",
      mkId: item.mkId || "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ kode: "", deskripsi: "", cplId: "", piId: "", mkId: "" });
    setEditingItem(null);
  };

  const stats = [
    { title: "Total CPL", value: cplData.length.toString(), icon: Target, iconBg: "#ede9fe", iconColor: "#7c3aed" },
    { title: "Total PI", value: piData.length.toString(), icon: BookOpen, iconBg: "#dbeafe", iconColor: "#2563eb" },
    { title: "Total CPMK", value: cpmkData.length.toString(), icon: FileCheck2, iconBg: "#d1fae5", iconColor: "#059669" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Data Kurikulum</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Kelola CPL, PI, dan CPMK Program Studi</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 14px rgba(67,97,238,0.3)" }}
        >
          <Plus className="w-4 h-4" />
          Tambah {activeTab.toUpperCase()}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: s.iconBg }}>
                  <s.icon className="w-6 h-6" style={{ color: s.iconColor }} />
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
          { key: "cpl", label: "CPL" },
          { key: "pi", label: "PI" },
          { key: "cpmk", label: "CPMK" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-sm font-semibold transition-colors ${activeTab === tab.key ? "border-b-2" : ""}`}
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
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === "cpl" && (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Kode</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Deskripsi</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>PI</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cplData.map((cpl) => (
                      <tr key={cpl.id} style={{ borderBottom: "1px solid #f8faff" }}>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-lg font-semibold text-sm" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                            {cpl.kode}
                          </span>
                        </td>
                        <td className="py-4" style={{ color: "#1a1d2e" }}>{cpl.deskripsi}</td>
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: "#dbeafe", color: "#2563eb" }}>
                            {cpl._count.pi} PI
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(cpl)} className="p-2 rounded-lg hover:bg-blue-50">
                              <Edit2 className="w-4 h-4" style={{ color: "#4361ee" }} />
                            </button>
                            <button onClick={() => handleDelete(cpl.id)} className="p-2 rounded-lg hover:bg-red-50">
                              <Trash2 className="w-4 h-4" style={{ color: "#dc2626" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "pi" && (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Kode</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>CPL</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Deskripsi</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>CPMK</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {piData.map((pi) => (
                      <tr key={pi.id} style={{ borderBottom: "1px solid #f8faff" }}>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-lg font-semibold text-sm" style={{ background: "#dbeafe", color: "#2563eb" }}>
                            {pi.kode}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: "#ede9fe", color: "#7c3aed" }}>
                            {pi.cpl.kode}
                          </span>
                        </td>
                        <td className="py-4" style={{ color: "#1a1d2e" }}>{pi.deskripsi}</td>
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: "#d1fae5", color: "#059669" }}>
                            {pi._count.cpmk} CPMK
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(pi)} className="p-2 rounded-lg hover:bg-blue-50">
                              <Edit2 className="w-4 h-4" style={{ color: "#4361ee" }} />
                            </button>
                            <button onClick={() => handleDelete(pi.id)} className="p-2 rounded-lg hover:bg-red-50">
                              <Trash2 className="w-4 h-4" style={{ color: "#dc2626" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "cpmk" && (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Kode</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Mata Kuliah</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>PI</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Deskripsi</th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cpmkData.map((cpmk) => (
                      <tr key={cpmk.id} style={{ borderBottom: "1px solid #f8faff" }}>
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-lg font-semibold text-sm" style={{ background: "#d1fae5", color: "#059669" }}>
                            {cpmk.kode}
                          </span>
                        </td>
                        <td className="py-4">
                          <div>
                            <p className="font-semibold text-sm" style={{ color: "#1a1d2e" }}>{cpmk.mataKuliah.nama}</p>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>{cpmk.mataKuliah.kode}</p>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 rounded-lg text-xs font-medium" style={{ background: "#dbeafe", color: "#2563eb" }}>
                            {cpmk.pi.kode}
                          </span>
                        </td>
                        <td className="py-4" style={{ color: "#1a1d2e" }}>{cpmk.deskripsi}</td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleEdit(cpmk)} className="p-2 rounded-lg hover:bg-blue-50">
                              <Edit2 className="w-4 h-4" style={{ color: "#4361ee" }} />
                            </button>
                            <button onClick={() => handleDelete(cpmk.id)} className="p-2 rounded-lg hover:bg-red-50">
                              <Trash2 className="w-4 h-4" style={{ color: "#dc2626" }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>
                {editingItem ? `Edit ${activeTab.toUpperCase()}` : `Tambah ${activeTab.toUpperCase()}`}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Kode</label>
                <input
                  type="text"
                  value={formData.kode}
                  onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder={activeTab === "cpl" ? "CPL-01" : activeTab === "pi" ? "PI-01-01" : "CPMK-01"}
                  required
                />
              </div>

              {activeTab === "pi" && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>CPL</label>
                  <select
                    value={formData.cplId}
                    onChange={(e) => setFormData({ ...formData, cplId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Pilih CPL</option>
                    {cplOptions.map((cpl) => (
                      <option key={cpl.id} value={cpl.id}>{cpl.kode} - {cpl.deskripsi}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeTab === "cpmk" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Mata Kuliah</label>
                    <select
                      value={formData.mkId}
                      onChange={(e) => setFormData({ ...formData, mkId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Pilih Mata Kuliah</option>
                      {mkOptions.map((mk) => (
                        <option key={mk.id} value={mk.id}>{mk.kode} - {mk.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>PI</label>
                    <select
                      value={formData.piId}
                      onChange={(e) => setFormData({ ...formData, piId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Pilih PI</option>
                      {piOptions.map((pi) => (
                        <option key={pi.id} value={pi.id}>{pi.kode} - {pi.deskripsi}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Deskripsi</label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={4}
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="flex-1 px-4 py-2 rounded-lg border font-medium"
                  style={{ color: "#64748b", borderColor: "#e2e8f0" }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-semibold"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
                >
                  {editingItem ? "Update" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
