"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen, Award, TrendingUp, Calendar } from "lucide-react";

export default function RiwayatNilaiPage() {
  const [selectedSemester, setSelectedSemester] = useState("5");

  const riwayatNilai = {
    "1": [
      { kode: "TI101", nama: "Kalkulus I", sks: 3, nilai: 85, huruf: "A" },
      { kode: "TI102", nama: "Fisika Dasar", sks: 3, nilai: 78, huruf: "B+" },
      { kode: "TI103", nama: "Kimia Dasar", sks: 3, nilai: 82, huruf: "A-" },
      { kode: "TI104", nama: "Pengantar Teknik Industri", sks: 2, nilai: 88, huruf: "A" },
      { kode: "TI105", nama: "Bahasa Inggris", sks: 2, nilai: 75, huruf: "B+" },
    ],
    "2": [
      { kode: "TI201", nama: "Kalkulus II", sks: 3, nilai: 80, huruf: "A-" },
      { kode: "TI202", nama: "Statistika Industri", sks: 3, nilai: 85, huruf: "A" },
      { kode: "TI203", nama: "Mekanika Teknik", sks: 3, nilai: 78, huruf: "B+" },
      { kode: "TI204", nama: "Gambar Teknik", sks: 2, nilai: 90, huruf: "A" },
      { kode: "TI205", nama: "Algoritma & Pemrograman", sks: 3, nilai: 88, huruf: "A" },
    ],
    "3": [
      { kode: "TI301", nama: "Proses Manufaktur", sks: 3, nilai: 82, huruf: "A-" },
      { kode: "TI302", nama: "Sistem Produksi", sks: 3, nilai: 85, huruf: "A" },
      { kode: "TI303", nama: "Ergonomi", sks: 3, nilai: 88, huruf: "A" },
      { kode: "TI304", nama: "Penelitian Operasional", sks: 3, nilai: 80, huruf: "A-" },
      { kode: "TI305", nama: "Ekonomi Teknik", sks: 2, nilai: 78, huruf: "B+" },
    ],
    "4": [
      { kode: "TI401", nama: "Perancangan Sistem Kerja", sks: 3, nilai: 85, huruf: "A" },
      { kode: "TI402", nama: "Sistem Informasi Industri", sks: 3, nilai: 88, huruf: "A" },
      { kode: "TI403", nama: "Pengendalian Kualitas", sks: 3, nilai: 90, huruf: "A" },
      { kode: "TI404", nama: "Manajemen Operasional", sks: 3, nilai: 82, huruf: "A-" },
      { kode: "TI405", nama: "Pemodelan Sistem", sks: 2, nilai: 85, huruf: "A" },
    ],
    "5": [
      { kode: "TI501", nama: "Sistem Logistik", sks: 3, nilai: 88, huruf: "A" },
      { kode: "TI502", nama: "Manajemen Proyek", sks: 3, nilai: 85, huruf: "A" },
      { kode: "TI503", nama: "Perencanaan & Pengendalian Produksi", sks: 3, nilai: 82, huruf: "A-" },
      { kode: "TI504", nama: "Sistem Basis Data", sks: 3, nilai: 90, huruf: "A" },
      { kode: "TI505", nama: "Keselamatan & Kesehatan Kerja", sks: 2, nilai: 85, huruf: "A" },
    ],
  };

  const semesterOptions = [
    { value: "1", label: "Semester 1" },
    { value: "2", label: "Semester 2" },
    { value: "3", label: "Semester 3" },
    { value: "4", label: "Semester 4" },
    { value: "5", label: "Semester 5" },
  ];

  const mataKuliah = riwayatNilai[selectedSemester as keyof typeof riwayatNilai] || [];
  const totalSKS = mataKuliah.reduce((sum, mk) => sum + mk.sks, 0);
  const totalNilai = mataKuliah.reduce((sum, mk) => sum + mk.nilai * mk.sks, 0);
  const ips = totalSKS > 0 ? (totalNilai / totalSKS).toFixed(2) : "0.00";

  // Calculate IPK (cumulative)
  let totalSKSKumulatif = 0;
  let totalNilaiKumulatif = 0;
  for (let i = 1; i <= parseInt(selectedSemester); i++) {
    const mkSemester = riwayatNilai[i.toString() as keyof typeof riwayatNilai] || [];
    totalSKSKumulatif += mkSemester.reduce((sum, mk) => sum + mk.sks, 0);
    totalNilaiKumulatif += mkSemester.reduce((sum, mk) => sum + mk.nilai * mk.sks, 0);
  }
  const ipk = totalSKSKumulatif > 0 ? (totalNilaiKumulatif / totalSKSKumulatif).toFixed(2) : "0.00";

  const stats = [
    { title: "Mata Kuliah", value: mataKuliah.length.toString(), icon: BookOpen, iconBg: "#dbeafe", iconColor: "#2563eb" },
    { title: "Total SKS", value: totalSKS.toString(), icon: Award, iconBg: "#ede9fe", iconColor: "#7c3aed" },
    { title: "IPS Semester", value: ips, icon: TrendingUp, iconBg: "#d1fae5", iconColor: "#059669" },
    { title: "IPK Kumulatif", value: ipk, icon: TrendingUp, iconBg: "#fef3c7", iconColor: "#d97706" },
  ];

  const getNilaiColor = (huruf: string) => {
    if (huruf.startsWith("A")) return { bg: "#d1fae5", color: "#059669" };
    if (huruf.startsWith("B")) return { bg: "#dbeafe", color: "#2563eb" };
    if (huruf.startsWith("C")) return { bg: "#fef3c7", color: "#d97706" };
    if (huruf.startsWith("D")) return { bg: "#fed7aa", color: "#ea580c" };
    return { bg: "#fee2e2", color: "#dc2626" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>
          Riwayat Nilai
        </h2>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          Lihat riwayat nilai mata kuliah per semester
        </p>
      </div>

      {/* Semester Selector */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Pilih Semester
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
            style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
          >
            {semesterOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-0 flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: s.iconBg }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.iconColor }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>
                  {s.title}
                </p>
                <p className="text-2xl font-bold mt-0.5" style={{ color: "#1a1d2e" }}>
                  {s.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Nilai Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Nilai - Semester {selectedSemester}</CardTitle>
        </CardHeader>
        <CardContent>
          {mataKuliah.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "#cbd5e1" }} />
              <p className="text-sm font-medium" style={{ color: "#64748b" }}>
                Belum ada data nilai untuk semester ini
              </p>
            </div>
          ) : (
            <div className="w-full overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    {["Kode MK", "Nama Mata Kuliah", "SKS", "Nilai Angka", "Nilai Huruf"].map((h) => (
                      <th
                        key={h}
                        className="pb-3 text-left text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "#94a3b8" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mataKuliah.map((mk, index) => {
                    const nilaiStyle = getNilaiColor(mk.huruf);
                    return (
                      <tr key={index} style={{ borderBottom: "1px solid #f8faff" }}>
                        <td className="py-3 pr-4">
                          <span
                            className="text-xs font-bold px-2 py-1 rounded-lg"
                            style={{ background: "#eef2ff", color: "#4361ee" }}
                          >
                            {mk.kode}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-medium" style={{ color: "#1a1d2e" }}>
                          {mk.nama}
                        </td>
                        <td className="py-3 pr-4" style={{ color: "#64748b" }}>
                          {mk.sks} SKS
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-base font-bold" style={{ color: "#4361ee" }}>
                            {mk.nilai}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className="text-xs font-bold px-3 py-1.5 rounded-lg"
                            style={{ background: nilaiStyle.bg, color: nilaiStyle.color }}
                          >
                            {mk.huruf}
                          </span>
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
