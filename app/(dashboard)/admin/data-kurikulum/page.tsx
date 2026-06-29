"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import CSVUploader from "@/components/ui/CSVUploader";
import { BookOpen, Target, FileCheck2, Plus, Edit2, Trash2, X, Upload, AlertCircle } from "lucide-react";
import { useScrollRestore } from "@/lib/useScrollRestore";
import { validateKode, sortByKode, KODE_EXAMPLES, type KodeType } from "@/lib/kodeValidation";

type TabType = "cpl" | "pi" | "cpmk" | "bobot-cpmk";

export default function AdminDataKurikulumPage() {
  const [activeTab, setActiveTab] = useState<TabType>("cpl");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [kodeError, setKodeError] = useState<string | null>(null);
  const [options, setOptions] = useState({ cpl: [], pi: [], mk: [], cpmk: [], kelas: [], komponen: [] });
  const [form, setForm] = useState({ 
    kode: "", 
    deskripsi: "", 
    deskripsi_en: "",
    cplId: "", 
    piId: "", 
    mkId: "",
    cpmkId: "",
    kelasId: "",
    komponenId: "",
    bobot: ""
  });

  const { saveScroll, restoreScroll } = useScrollRestore();

  // Handler for when MK changes in bobot-cpmk form - load kelas
  const handleMkChange = async (mkId: string) => {
    setForm(prev => ({ ...prev, mkId, kelasId: "", komponenId: "" }));
    if (!mkId) {
      setOptions(prev => ({ ...prev, kelas: [], komponen: [] }));
      return;
    }
    try {
      const res = await fetch(`/api/admin/kelas?mkId=${mkId}`);
      const kelasData = await res.json();
      setOptions(prev => ({ ...prev, kelas: kelasData, komponen: [] }));
    } catch (error) {
      console.error("Error loading kelas:", error);
    }
  };

  // Handler for when Kelas changes in bobot-cpmk form - load komponen
  const handleKelasChange = async (kelasId: string) => {
    setForm(prev => ({ ...prev, kelasId, komponenId: "" }));
    if (!kelasId) {
      setOptions(prev => ({ ...prev, komponen: [] }));
      return;
    }
    try {
      const res = await fetch(`/api/admin/komponen-nilai?kelasId=${kelasId}`);
      const komponenData = await res.json();
      setOptions(prev => ({ ...prev, komponen: komponenData }));
    } catch (error) {
      console.error("Error loading komponen:", error);
    }
  };

  useEffect(() => {
    loadData();
    loadOptions();
  }, [activeTab]);

  const loadData = async () => {
    saveScroll();
    setLoading(true);
    try {
      const endpoint = activeTab === "bobot-cpmk" 
        ? "/api/admin/bobot-cpmk"
        : `/api/admin/kurikulum?type=${activeTab}`;
      const res = await fetch(endpoint);
      const result = await res.json();
      setData(Array.isArray(result) ? (activeTab !== "bobot-cpmk" ? sortByKode(result) : result) : []);
    } catch (error) {
      console.error("Error:", error);
      setData([]);
    } finally {
      setLoading(false);
      restoreScroll();
    }
  };

  const loadOptions = async () => {
    try {
      if (activeTab === "pi" || activeTab === "cpmk") {
        const cplRes = await fetch("/api/admin/kurikulum/options?type=cpl");
        const cplData = await cplRes.json();
        setOptions(prev => ({ ...prev, cpl: cplData }));
      }
      if (activeTab === "cpmk") {
        const [piRes, mkRes] = await Promise.all([
          fetch("/api/admin/kurikulum/options?type=pi"),
          fetch("/api/admin/kurikulum/options?type=mk")
        ]);
        const [piData, mkData] = await Promise.all([piRes.json(), mkRes.json()]);
        setOptions(prev => ({ ...prev, pi: piData, mk: mkData }));
      }
      if (activeTab === "bobot-cpmk") {
        const [cpmkRes, mkRes] = await Promise.all([
          fetch("/api/admin/kurikulum/options?type=cpmk"),
          fetch("/api/admin/kurikulum/options?type=mk")
        ]);
        const [cpmkData, mkData] = await Promise.all([cpmkRes.json(), mkRes.json()]);
        setOptions(prev => ({ ...prev, cpmk: cpmkData, mk: mkData }));
      }
    } catch (error) {
      console.error("Error loading options:", error);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi format kode untuk CPL, PI, CPMK
    if (activeTab !== "bobot-cpmk") {
      const err = validateKode(activeTab as KodeType, form.kode);
      if (err) { setKodeError(err); return; }
    }
    setKodeError(null);

    // Validasi untuk bobot-cpmk
    if (activeTab === "bobot-cpmk") {
      if (!form.cpmkId || !form.komponenId || !form.bobot) {
        alert("Semua field wajib diisi!");
        return;
      }
      const bobotNum = parseFloat(form.bobot);
      if (isNaN(bobotNum) || bobotNum < 0 || bobotNum > 100) {
        alert("Bobot harus berupa angka antara 0-100!");
        return;
      }
    }
    
    const endpoint = `/api/admin/kurikulum/${activeTab}`;
    const payload: any = {};
    
    if (activeTab === "bobot-cpmk") {
      payload.cpmkId = form.cpmkId;
      payload.komponenId = form.komponenId;
      payload.bobot = parseFloat(form.bobot);
      if (editItem) payload.id = editItem.id;
    } else {
      payload.kode = form.kode;
      payload.deskripsi = form.deskripsi;
      if (editItem) payload.id = editItem.id;
      if (activeTab === "pi") payload.cplId = form.cplId;
      if (activeTab === "cpmk") {
        payload.piId = form.piId;
        payload.mkId = form.mkId;
      }
    }

    try {
      const res = await fetch(endpoint, {
        method: editItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        await loadData();
        closeModal();
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan");
      }
    } catch (error) {
      console.error("Error saving:", error);
      alert("Terjadi kesalahan saat menyimpan data");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus data ini?")) return;
    try {
      const res = await fetch(`/api/admin/kurikulum/${activeTab}?id=${id}`, { method: "DELETE" });
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
    if (activeTab === "bobot-cpmk") {
      const mkId = item.komponen?.kelas?.mataKuliah?.id || "";
      const kelasId = item.komponen?.kelasId || "";
      
      setForm({
        kode: "",
        deskripsi: "",
        deskripsi_en: "",
        cplId: "",
        piId: "",
        mkId: mkId,
        cpmkId: item.cpmkId || "",
        kelasId: kelasId,
        komponenId: item.komponenId || "",
        bobot: item.bobot?.toString() || "",
      });
      
      // Load kelas and komponen for edit
      if (mkId) handleMkChange(mkId);
      if (kelasId) handleKelasChange(kelasId);
    } else {
      setForm({
        kode: item.kode,
        deskripsi: item.deskripsi,
        deskripsi_en: item.deskripsi_en || "",
        cplId: item.cplId || "",
        piId: item.piId || "",
        mkId: item.mkId || "",
        cpmkId: "",
        kelasId: "",
        komponenId: "",
        bobot: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditItem(null);
    setKodeError(null);
    setForm({ kode: "", deskripsi: "", deskripsi_en: "", cplId: "", piId: "", mkId: "", cpmkId: "", kelasId: "", komponenId: "", bobot: "" });
  };

  // CSV Templates
  const getCsvTemplate = () => {
    if (activeTab === "cpl") {
      return {
        fileName: "template_cpl.csv",
        content: "kode,deskripsi,deskripsi_en\nCPL-1,Mampu menerapkan pengetahuan matematika sains dan prinsip rekayasa,Able to apply knowledge of mathematics science and engineering principles\nCPL-2,Mampu merancang dan melakukan eksperimen,Able to design and conduct experiments",
        format: "kode, deskripsi (Indonesia), deskripsi_en (English - optional)",
        endpoint: "/api/admin/import/cpl"
      };
    } else if (activeTab === "pi") {
      return {
        fileName: "template_pi.csv",
        content: "kode,deskripsi,kode_cpl\nI-1,Mampu mengaplikasikan konsep matematika dasar,CPL-1\nI-2,Mampu menggunakan metode statistika,CPL-1",
        format: "kode, deskripsi, kode_cpl",
        endpoint: "/api/admin/import/pi"
      };
    } else if (activeTab === "cpmk") {
      return {
        fileName: "template_cpmk.csv",
        content: "kode,deskripsi,kode_pi,kode_mk\nCPMK-1,Mahasiswa mampu memahami konsep algoritma,I-1,08033241001\nCPMK-2,Mahasiswa mampu mengimplementasikan struktur data,I-2,08033241001",
        format: "kode, deskripsi, kode_pi, kode_mk",
        endpoint: "/api/admin/import/cpmk"
      };
    } else {
      return {
        fileName: "template_bobot_cpmk.csv",
        content: "komponen_id,kode_cpmk,kode_mk,bobot\nkomp123,CPMK-1,08033241001,40\nkomp124,CPMK-1,08033241001,60",
        format: "komponen_id, kode_cpmk, kode_mk, bobot (0-100)",
        endpoint: "/api/admin/import/bobot-cpmk"
      };
    }
  };

  const csvTemplate = getCsvTemplate();

  const stats = [
    { title: "Total CPL", value: activeTab === "cpl" ? data.length : 0, icon: Target, bg: "#ede9fe", color: "#7c3aed" },
    { title: "Total PI", value: activeTab === "pi" ? data.length : 0, icon: BookOpen, bg: "#dbeafe", color: "#2563eb" },
    { title: "Total CPMK", value: activeTab === "cpmk" ? data.length : 0, icon: FileCheck2, bg: "#d1fae5", color: "#059669" },
    { title: "Total Bobot CPMK", value: activeTab === "bobot-cpmk" ? data.length : 0, icon: FileCheck2, bg: "#fef3c7", color: "#d97706" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Data Kurikulum</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Kelola CPL, PI, dan CPMK</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImportCSV(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"
            style={{ background: "#f0fdf4", color: "#059669", border: "1px solid #bbf7d0" }}
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => { closeModal(); setShowModal(true); }}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            <Plus className="w-4 h-4" />
            Tambah {activeTab.toUpperCase()}
          </button>
        </div>
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
          { key: "bobot-cpmk" as TabType, label: "Bobot CPMK" },
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
                    {activeTab !== "bobot-cpmk" && <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Kode</th>}
                    {activeTab === "pi" && <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>CPL</th>}
                    {activeTab === "cpmk" && <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Mata Kuliah</th>}
                    {activeTab === "cpmk" && <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>PI</th>}
                    {activeTab === "bobot-cpmk" && <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>CPMK</th>}
                    {activeTab === "bobot-cpmk" && <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Komponen Nilai</th>}
                    {activeTab === "bobot-cpmk" && <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Kelas</th>}
                    {activeTab === "bobot-cpmk" && <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Bobot (%)</th>}
                    {activeTab !== "bobot-cpmk" && <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Deskripsi</th>}
                    <th className="pb-3 text-left text-xs font-semibold uppercase" style={{ color: "#94a3b8" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item: any) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid #f8faff" }}>
                      {activeTab !== "bobot-cpmk" && (
                        <td className="py-4">
                          <span className="px-3 py-1 rounded-lg font-semibold text-sm" style={{ 
                            background: activeTab === "cpl" ? "#ede9fe" : activeTab === "pi" ? "#dbeafe" : "#d1fae5",
                            color: activeTab === "cpl" ? "#7c3aed" : activeTab === "pi" ? "#2563eb" : "#059669"
                          }}>
                            {item.kode}
                          </span>
                        </td>
                      )}
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
                      {activeTab === "bobot-cpmk" && (
                        <>
                          <td className="py-4">
                            <span className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: "#d1fae5", color: "#059669" }}>
                              {item.cpmk?.kode}
                            </span>
                            <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{item.cpmk?.deskripsi?.substring(0, 50)}...</p>
                          </td>
                          <td className="py-4">
                            <p className="font-semibold text-sm" style={{ color: "#1a1d2e" }}>{item.komponen?.nama}</p>
                          </td>
                          <td className="py-4">
                            <p className="text-sm" style={{ color: "#1a1d2e" }}>{item.komponen?.kelas?.nama}</p>
                            <p className="text-xs" style={{ color: "#94a3b8" }}>{item.komponen?.kelas?.mataKuliah?.kode}</p>
                          </td>
                          <td className="py-4">
                            <span className="px-3 py-1 rounded-lg font-bold text-sm" style={{ background: "#fef3c7", color: "#d97706" }}>
                              {item.bobot}%
                            </span>
                          </td>
                        </>
                      )}
                      {activeTab !== "bobot-cpmk" && <td className="py-4" style={{ color: "#1a1d2e" }}>{item.deskripsi}</td>}
                      <td className="py-4">
                        <div className="space-y-1">
                          <div className="flex gap-2">
                            <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-blue-50">
                              <Edit2 className="w-4 h-4" style={{ color: "#4361ee" }} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg hover:bg-red-50">
                              <Trash2 className="w-4 h-4" style={{ color: "#dc2626" }} />
                            </button>
                          </div>
                          {(item.createdBy || item.updatedBy) && (
                            <div className="text-xs" style={{ color: "#94a3b8" }}>
                              {item.createdBy && (
                                <div>
                                  Dibuat: {item.createdBy} 
                                  {item.createdAt && <> · {new Date(item.createdAt).toLocaleDateString('id-ID')}</>}
                                </div>
                              )}
                              {item.updatedBy && (
                                <div>
                                  Diubah: {item.updatedBy}
                                  {item.updatedAt && <> · {new Date(item.updatedAt).toLocaleDateString('id-ID')}</>}
                                </div>
                              )}
                            </div>
                          )}
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
              {activeTab !== "bobot-cpmk" && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Kode</label>
                  <input
                    type="text"
                    value={form.kode}
                    onChange={(e) => { setForm({ ...form, kode: e.target.value }); setKodeError(null); }}
                    className="w-full px-3 py-2 border rounded-lg"
                    style={{ borderColor: kodeError ? "#dc2626" : undefined }}
                    placeholder={activeTab === "cpl" ? KODE_EXAMPLES.cpl : activeTab === "pi" ? KODE_EXAMPLES.pi : KODE_EXAMPLES.cpmk}
                    required
                  />
                  {kodeError && (
                    <div className="flex items-start gap-1.5 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
                      <p className="text-xs" style={{ color: "#dc2626" }}>{kodeError}</p>
                    </div>
                  )}
                  <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                    Format: {activeTab === "cpl" ? `${KODE_EXAMPLES.cpl}, ${KODE_EXAMPLES.cpl.replace("1","2")}` : activeTab === "pi" ? `${KODE_EXAMPLES.pi}, ${KODE_EXAMPLES.pi.replace("1","2")}` : `${KODE_EXAMPLES.cpmk}, ${KODE_EXAMPLES.cpmk.replace("1","2")}`}
                  </p>
                </div>
              )}
              {activeTab === "bobot-cpmk" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Mata Kuliah</label>
                    <select
                      value={form.mkId}
                      onChange={(e) => handleMkChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Pilih Mata Kuliah</option>
                      {options.mk.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.kode} - {m.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>CPMK</label>
                    <select
                      value={form.cpmkId}
                      onChange={(e) => setForm({ ...form, cpmkId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                    >
                      <option value="">Pilih CPMK</option>
                      {options.cpmk.filter((c: any) => !form.mkId || c.mkId === form.mkId).map((c: any) => (
                        <option key={c.id} value={c.id}>{c.kode} - {c.deskripsi?.substring(0, 50)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Kelas</label>
                    <select
                      value={form.kelasId}
                      onChange={(e) => handleKelasChange(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                      disabled={!form.mkId}
                    >
                      <option value="">Pilih Kelas</option>
                      {options.kelas.map((k: any) => (
                        <option key={k.id} value={k.id}>{k.nama} - {k.tahunAjaran}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Komponen Nilai</label>
                    <select
                      value={form.komponenId}
                      onChange={(e) => setForm({ ...form, komponenId: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      required
                      disabled={!form.kelasId}
                    >
                      <option value="">Pilih Komponen</option>
                      {options.komponen.map((k: any) => (
                        <option key={k.id} value={k.id}>{k.nama} ({k.bobot}%)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Bobot (%)</label>
                    <input
                      type="number"
                      value={form.bobot}
                      onChange={(e) => setForm({ ...form, bobot: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      min="0"
                      max="100"
                      step="0.01"
                      required
                      placeholder="0-100"
                    />
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                      Masukkan bobot kontribusi komponen nilai ini terhadap CPMK (0-100%)
                    </p>
                  </div>
                </>
              )}
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
              {activeTab !== "bobot-cpmk" && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>
                      Deskripsi (Indonesia) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.deskripsi}
                      onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={3}
                      required
                    />
                  </div>
                  {activeTab === "cpl" && (
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>
                        Description (English) <span className="text-gray-400 text-xs">- optional</span>
                      </label>
                      <textarea
                        value={form.deskripsi_en}
                        onChange={(e) => setForm({ ...form, deskripsi_en: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        rows={3}
                        placeholder="English translation of the description"
                      />
                    </div>
                  )}
                </>
              )}
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

      {/* ═══════════════════════════════════════════════
          MODAL: Import CSV
      ═══════════════════════════════════════════════ */}
      {showImportCSV && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>
                  Import {activeTab.toUpperCase()} via CSV
                </h3>
                <p className="text-sm mt-0.5" style={{ color: "#94a3b8" }}>
                  Upload file CSV untuk import {activeTab.toUpperCase()} sekaligus
                </p>
              </div>
              <button onClick={() => setShowImportCSV(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <CSVUploader
              title={`Upload file CSV ${activeTab.toUpperCase()}`}
              endpoint={csvTemplate.endpoint}
              templateFileName={csvTemplate.fileName}
              templateContent={csvTemplate.content}
              formatInfo={csvTemplate.format}
              onSuccess={() => {
                setShowImportCSV(false);
                loadData();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
