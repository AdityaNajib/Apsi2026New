"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Plus, Edit2, Trash2, X, Search, Shield } from "lucide-react";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface AdminItem {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export default function ManajemenAdminPage() {
  const [adminList, setAdminList] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminItem | null>(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { saveScroll, restoreScroll } = useScrollRestore();

  const fetchAdmins = useCallback(async () => {
    saveScroll();
    setLoading(true);
    try {
      const res = await fetch("/api/kaprodi/admin");
      setAdminList(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      restoreScroll();
    }
  }, [saveScroll, restoreScroll]);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", email: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (admin: AdminItem) => {
    setEditing(admin);
    setForm({ name: admin.name, email: admin.email });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const method = editing ? "PUT" : "POST";
      const body = editing
        ? { userId: editing.id, ...form }
        : form;
      const res = await fetch("/api/kaprodi/admin", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setShowModal(false);
      fetchAdmins();
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (admin: AdminItem) => {
    if (!confirm(`Hapus admin "${admin.name}"?\nAkun ini tidak bisa digunakan lagi setelah dihapus.`)) return;
    const res = await fetch(`/api/kaprodi/admin?userId=${admin.id}`, { method: "DELETE" });
    if (!res.ok) {
      const err = await res.json();
      alert(err.error || "Gagal menghapus admin");
      return;
    }
    fetchAdmins();
  };

  const filtered = adminList.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Manajemen Admin Prodi</h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Tambah, edit, atau hapus akun Admin Prodi
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 14px rgba(67,97,238,0.3)" }}
        >
          <Plus className="w-4 h-4" />
          Tambah Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardContent className="p-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#dbeafe" }}>
              <Shield className="w-5 h-5" style={{ color: "#2563eb" }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>Total Admin</p>
              <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{adminList.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#d1fae5" }}>
              <Users className="w-5 h-5" style={{ color: "#059669" }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>Domain Email</p>
              <p className="text-sm font-bold" style={{ color: "#1a1d2e" }}>@admin.uns.ac.id</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#fef3c7" }}>
              <Shield className="w-5 h-5" style={{ color: "#d97706" }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>Password Default</p>
              <p className="text-sm font-bold font-mono" style={{ color: "#1a1d2e" }}>password123</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Admin Prodi</CardTitle>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau email..."
              className="pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none"
              style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e", width: 260 }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: "#cbd5e1" }} />
              <p className="font-semibold" style={{ color: "#64748b" }}>
                {adminList.length === 0 ? "Belum ada admin" : "Tidak ada hasil pencarian"}
              </p>
              <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
                {adminList.length === 0 && "Klik \"Tambah Admin\" untuk menambahkan"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    {["Nama Admin", "Email Login", "Dibuat", "Aksi"].map((h) => (
                      <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#94a3b8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((admin) => (
                    <tr key={admin.id} style={{ borderBottom: "1px solid #f8faff" }}>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ background: "linear-gradient(135deg, #2563eb, #4361ee)" }}
                          >
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold" style={{ color: "#1a1d2e" }}>{admin.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-sm" style={{ color: "#64748b" }}>{admin.email}</td>
                      <td className="py-3.5 pr-4 text-sm" style={{ color: "#94a3b8" }}>
                        {new Date(admin.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                      <td className="py-3.5">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEdit(admin)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-blue-50"
                          >
                            <Edit2 className="w-4 h-4" style={{ color: "#4361ee" }} />
                          </button>
                          <button
                            onClick={() => handleDelete(admin)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50"
                          >
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

      {/* Modal Tambah / Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold" style={{ color: "#1a1d2e" }}>
                {editing ? "Edit Admin" : "Tambah Admin Baru"}
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
                  Nama Lengkap <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama Admin Prodi"
                  required
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                  style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#4361ee"; e.currentTarget.style.background = "#fff"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: "#374151" }}>
                  Email Login <span style={{ color: "#dc2626" }}>*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="nama@admin.uns.ac.id"
                  required
                  className="w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                  style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#4361ee"; e.currentTarget.style.background = "#fff"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.background = "#f8fafc"; }}
                />
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Harus menggunakan domain @admin.uns.ac.id</p>
              </div>

              {!editing && (
                <div className="p-3 rounded-xl text-xs" style={{ background: "#f0fdf4", color: "#059669" }}>
                  🔑 Password default: <strong>password123</strong> — bisa diubah setelah login
                </div>
              )}

              <div className="flex gap-3 pt-1">
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
                  {saving ? "Menyimpan..." : editing ? "Update" : "Tambah Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
