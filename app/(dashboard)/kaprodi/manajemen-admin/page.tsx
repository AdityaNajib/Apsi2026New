"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Plus, Edit2, Trash2, Mail, Phone, Calendar } from "lucide-react";

interface Admin {
  id: string;
  name: string;
  email: string;
  nidn: string;
  nip: string;
  createdAt: string;
}

export default function ManajemenAdminPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    nidn: "",
    nip: "",
    password: "",
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/kaprodi/admin");
      const data = await res.json();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingAdmin ? `/api/kaprodi/admin/${editingAdmin.id}` : "/api/kaprodi/admin";
      const method = editingAdmin ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchAdmins();
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving admin:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus admin ini?")) return;
    
    try {
      const res = await fetch(`/api/kaprodi/admin/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAdmins();
      }
    } catch (error) {
      console.error("Error deleting admin:", error);
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      nidn: admin.nidn,
      nip: admin.nip,
      password: "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({ name: "", email: "", nidn: "", nip: "", password: "" });
    setEditingAdmin(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>
            Manajemen Admin
          </h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Kelola admin program studi Teknik Industri
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-2"
          style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 14px rgba(67,97,238,0.3)" }}
        >
          <Plus className="w-4 h-4" />
          Tambah Admin
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#ede9fe" }}>
                <Users className="w-6 h-6" style={{ color: "#7c3aed" }} />
              </div>
              <div>
                <p className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>{admins.length}</p>
                <p className="text-sm" style={{ color: "#94a3b8" }}>Total Admin</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Admin Program Studi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Admin</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>NIDN / NIP</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Email</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Terdaftar</th>
                  <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} style={{ borderBottom: "1px solid #f8faff" }}>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                          {admin.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold" style={{ color: "#1a1d2e" }}>{admin.name}</p>
                          <p className="text-xs" style={{ color: "#94a3b8" }}>Admin Prodi</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-medium" style={{ color: "#1a1d2e" }}>{admin.nidn}</p>
                      <p className="text-xs" style={{ color: "#94a3b8" }}>{admin.nip}</p>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" style={{ color: "#94a3b8" }} />
                        <span className="text-sm" style={{ color: "#64748b" }}>{admin.email}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: "#94a3b8" }} />
                        <span className="text-sm" style={{ color: "#64748b" }}>
                          {new Date(admin.createdAt).toLocaleDateString("id-ID")}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" style={{ color: "#4361ee" }} />
                        </button>
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Hapus"
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
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4" style={{ color: "#1a1d2e" }}>
              {editingAdmin ? "Edit Admin" : "Tambah Admin Baru"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>NIDN</label>
                <input
                  type="text"
                  value={formData.nidn}
                  onChange={(e) => setFormData({ ...formData, nidn: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>NIP</label>
                <input
                  type="text"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#64748b" }}>
                  Password {editingAdmin && "(kosongkan jika tidak ingin mengubah)"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required={!editingAdmin}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
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
                  {editingAdmin ? "Update" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
