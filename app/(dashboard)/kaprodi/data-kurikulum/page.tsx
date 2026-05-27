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
