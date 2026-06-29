"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { GraduationCap, Mail, Hash, Calendar, BookOpen, Award } from "lucide-react";

interface Profile {
  name: string;
  email: string;
  nim: string;
  angkatan: string;
  status: string;
  semester: number;
  ipk: string;
  jumlahMk: number;
}

export default function ProfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/mahasiswa/profile')
      .then((r) => r.json())
      .then(setProfile)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-96">
        <p style={{ color: "#94a3b8" }}>Gagal memuat profil</p>
      </div>
    );
  }

  const items = [
    { icon: Hash, label: "NIM", value: profile.nim },
    { icon: Mail, label: "Email", value: profile.email },
    { icon: Calendar, label: "Angkatan", value: profile.angkatan },
    { icon: BookOpen, label: "Semester Aktif", value: `Semester ${profile.semester}` },
    { icon: Award, label: "IPK", value: profile.ipk },
    { icon: GraduationCap, label: "Status", value: profile.status },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Profil Mahasiswa</h2>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Informasi akun dan data akademik Anda</p>
      </div>

      {/* Profile header */}
      <div
        className="rounded-2xl p-8 flex items-center gap-6"
        style={{ background: "linear-gradient(135deg, #4361ee 0%, #7c3aed 100%)", boxShadow: "0 8px 32px rgba(67,97,238,0.25)" }}
      >
        <div
          className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-white shrink-0"
          style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", border: "2px solid rgba(255,255,255,0.3)" }}
        >
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">{profile.name}</h3>
          <p className="text-white/70 text-sm mt-1">Program Studi Teknik Industri · UNS</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: "rgba(255,255,255,0.15)" }}>
              {profile.nim}
            </span>
            <span className="px-3 py-1 rounded-lg text-xs font-semibold text-white" style={{ background: "rgba(255,255,255,0.15)" }}>
              Angkatan {profile.angkatan}
            </span>
            <span
              className="px-3 py-1 rounded-lg text-xs font-semibold"
              style={{
                background: profile.status === "AKTIF" ? "#d1fae5" : "#fee2e2",
                color: profile.status === "AKTIF" ? "#059669" : "#dc2626",
              }}
            >
              {profile.status}
            </span>
          </div>
        </div>
      </div>

      {/* Detail items */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-bold mb-5" style={{ color: "#1a1d2e" }}>Informasi Akademik</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "#f8fafc" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#eef2ff" }}>
                  <item.icon className="w-5 h-5" style={{ color: "#4361ee" }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>{item.label}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: "#1a1d2e" }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
