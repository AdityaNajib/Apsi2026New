"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { User, Mail, Phone, MapPin, Calendar, GraduationCap, BookOpen, Award } from "lucide-react";

export default function ProfilMahasiswaPage() {
  const mahasiswa = {
    nama: "Aditya Pratama",
    nim: "I0323045",
    email: "aditya.pratama@student.uns.ac.id",
    telepon: "081234567890",
    angkatan: "2023",
    semester: "5",
    prodi: "Teknik Industri",
    fakultas: "Fakultas Teknik",
    ipk: "3.85",
    sksLulus: "96",
    statusAkademik: "Aktif",
    dosenWali: "Dr. Ir. Bambang Suhardi, M.T.",
    alamat: "Jl. Ir. Sutami No. 36A, Surakarta, Jawa Tengah",
  };

  const infoItems = [
    { icon: User, label: "Nama Lengkap", value: mahasiswa.nama },
    { icon: GraduationCap, label: "NIM", value: mahasiswa.nim },
    { icon: Mail, label: "Email", value: mahasiswa.email },
    { icon: Phone, label: "Telepon", value: mahasiswa.telepon },
    { icon: Calendar, label: "Angkatan", value: mahasiswa.angkatan },
    { icon: BookOpen, label: "Semester", value: `Semester ${mahasiswa.semester}` },
    { icon: MapPin, label: "Alamat", value: mahasiswa.alamat },
  ];

  const akademikItems = [
    { label: "Program Studi", value: mahasiswa.prodi },
    { label: "Fakultas", value: mahasiswa.fakultas },
    { label: "IPK", value: mahasiswa.ipk },
    { label: "SKS Lulus", value: `${mahasiswa.sksLulus} SKS` },
    { label: "Status Akademik", value: mahasiswa.statusAkademik },
    { label: "Dosen Wali", value: mahasiswa.dosenWali },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>
          Profil Mahasiswa
        </h2>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          Informasi lengkap data pribadi dan akademik Anda
        </p>
      </div>

      {/* Profile Header Card */}
      <div
        className="rounded-2xl p-6 flex items-center gap-6"
        style={{
          background: "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)",
          boxShadow: "0 8px 32px rgba(67,97,238,0.25)",
        }}
      >
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center shrink-0 text-white text-3xl font-bold"
          style={{
            background: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            border: "1.5px solid rgba(255,255,255,0.25)",
          }}
        >
          {mahasiswa.nama.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-white">{mahasiswa.nama}</h3>
          <p className="text-white/75 text-sm mt-1">
            {mahasiswa.nim} · {mahasiswa.prodi}
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white font-medium"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Semester {mahasiswa.semester}
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white font-medium"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <Award className="w-3.5 h-3.5" />
              IPK: {mahasiswa.ipk}
            </div>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white font-medium"
              style={{ background: "rgba(255,255,255,0.15)" }}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              {mahasiswa.statusAkademik}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Data Pribadi */}
        <Card>
          <CardHeader>
            <CardTitle>Data Pribadi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {infoItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "#eef2ff" }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: "#4361ee" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: "#1a1d2e" }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Akademik */}
        <Card>
          <CardHeader>
            <CardTitle>Data Akademik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {akademikItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b"
                  style={{ borderColor: "#f1f5f9" }}
                >
                  <span className="text-sm font-medium" style={{ color: "#64748b" }}>
                    {item.label}
                  </span>
                  <span className="text-sm font-bold" style={{ color: "#1a1d2e" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
