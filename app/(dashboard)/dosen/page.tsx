"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen, Users, PenTool, CheckCircle } from "lucide-react";

interface MataKuliah {
  kelasId: string;
  kode: string;
  nama: string;
  namaKelas: string;
  sks: number;
  jumlahMahasiswa: number;
  komponenNilai: any[];
}

export default function DosenDashboard() {
  const [mataKuliah, setMataKuliah] = useState<MataKuliah[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMataKuliah();
  }, []);

  const fetchMataKuliah = async () => {
    try {
      const res = await fetch('/api/dosen/mata-kuliah');
      const data = await res.json();
      setMataKuliah(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching mata kuliah:', error);
      setMataKuliah([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusNilai = (komponenNilai: any[]) => {
    if (komponenNilai.length === 0) return { label: "Belum Ada Komponen", color: "#fee2e2", textColor: "#dc2626" };
    
    const totalBobot = komponenNilai.reduce((sum, k) => sum + k.bobot, 0);
    if (Math.abs(totalBobot - 100) < 0.01) {
      return { label: "Siap Input Nilai", color: "#d1fae5", textColor: "#059669" };
    }
    return { label: "Bobot Belum 100%", color: "#fef3c7", textColor: "#d97706" };
  };

  const totalMahasiswa = mataKuliah.reduce((sum, mk) => sum + mk.jumlahMahasiswa, 0);
  const kelasSelesai = mataKuliah.filter(mk => mk.komponenNilai.length > 0 && Math.abs(mk.komponenNilai.reduce((sum, k) => sum + k.bobot, 0) - 100) < 0.01).length;
  const kelasMenunggu = mataKuliah.length - kelasSelesai;

  const stats = [
    { title: "Mata Kuliah Diampu", value: mataKuliah.length.toString(), icon: BookOpen, iconBg: "#dbeafe", iconColor: "#2563eb" },
    { title: "Total Mahasiswa", value: totalMahasiswa.toString(), icon: Users, iconBg: "#ede9fe", iconColor: "#7c3aed" },
    { title: "Menunggu Penilaian", value: `${kelasMenunggu} Kelas`, icon: PenTool, iconBg: "#fef3c7", iconColor: "#d97706" },
    { title: "Siap Input Nilai", value: `${kelasSelesai} Kelas`, icon: CheckCircle, iconBg: "#d1fae5", iconColor: "#059669" },
  ];

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
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Dashboard Dosen</h2>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Selamat datang! Berikut ringkasan aktivitas mengajar Anda.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-0 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: s.iconBg }}>
                <s.icon className="w-5 h-5" style={{ color: s.iconColor }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>{s.title}</p>
                <p className="text-2xl font-bold mt-0.5" style={{ color: "#1a1d2e" }}>{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mata Kuliah Diampu */}
      <Card>
        <CardHeader>
          <CardTitle>Mata Kuliah Diampu — Semester Ganjil 2026</CardTitle>
          <a
            href="/dosen/matakuliah"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            Lihat Semua
          </a>
        </CardHeader>
        <CardContent>
          {mataKuliah.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "#cbd5e1" }} />
              <p className="text-sm font-medium" style={{ color: "#64748b" }}>
                Belum ada mata kuliah yang diampu
              </p>
            </div>
          ) : (
            <div className="w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    {["Kode MK", "Nama Mata Kuliah", "SKS", "Jml. Mhs", "Status Nilai", "Aksi"].map((h) => (
                      <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mataKuliah.slice(0, 4).map((mk) => {
                    const status = getStatusNilai(mk.komponenNilai);
                    return (
                      <tr key={mk.kelasId} style={{ borderBottom: "1px solid #f8faff" }}>
                        <td className="py-4 pr-4">
                          <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "#eef2ff", color: "#4361ee" }}>{mk.kode}</span>
                        </td>
                        <td className="py-4 pr-4 font-medium" style={{ color: "#1a1d2e" }}>{mk.nama}</td>
                        <td className="py-4 pr-4" style={{ color: "#64748b" }}>{mk.sks} SKS</td>
                        <td className="py-4 pr-4" style={{ color: "#64748b" }}>{mk.jumlahMahasiswa} mhs</td>
                        <td className="py-4 pr-4">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                            style={{ background: status.color, color: status.textColor }}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="py-4">
                          <a
                            href={`/dosen/nilai?kelasId=${mk.kelasId}`}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors inline-block"
                            style={{ background: "#eef2ff", color: "#4361ee" }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "#4361ee";
                              (e.currentTarget as HTMLElement).style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = "#eef2ff";
                              (e.currentTarget as HTMLElement).style.color = "#4361ee";
                            }}
                          >
                            Input Nilai
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
