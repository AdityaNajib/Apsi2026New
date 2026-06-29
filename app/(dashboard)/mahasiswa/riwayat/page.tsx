"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen, Award, TrendingUp, Calendar } from "lucide-react";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface MatkulItem {
  kode: string;
  nama: string;
  sks: number;
  nilaiAngka: number;
  nilaiHuruf: string;
  sudahAda: boolean;
}

interface SemesterData {
  semester: number;
  matkul: MatkulItem[];
  ips: number;
  totalSks: number;
}

export default function RiwayatNilaiPage() {
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [ipk, setIpk] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { saveScroll, restoreScroll } = useScrollRestore();

  useEffect(() => {
    saveScroll();
    fetch('/api/mahasiswa/riwayat')
      .then((r) => r.json())
      .then((data) => {
        if (data.semesters) {
          setSemesters(data.semesters);
          setIpk(data.ipk);
          if (data.semesters.length > 0) {
            setSelectedSemester(data.semesters[data.semesters.length - 1].semester);
          }
        }
      })
      .catch(console.error)
      .finally(() => { setLoading(false); restoreScroll(); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
      </div>
    );
  }

  const activeSemester = semesters.find((s) => s.semester === selectedSemester);

  const getNilaiColor = (huruf: string) => {
    if (huruf.startsWith("A")) return { bg: "#d1fae5", color: "#059669" };
    if (huruf.startsWith("B")) return { bg: "#dbeafe", color: "#2563eb" };
    if (huruf.startsWith("C")) return { bg: "#fef3c7", color: "#d97706" };
    if (huruf.startsWith("D")) return { bg: "#fed7aa", color: "#ea580c" };
    return { bg: "#fee2e2", color: "#dc2626" };
  };

  const stats = [
    {
      title: "Mata Kuliah",
      value: activeSemester ? activeSemester.matkul.length.toString() : "0",
      icon: BookOpen, iconBg: "#dbeafe", iconColor: "#2563eb",
    },
    {
      title: "Total SKS",
      value: activeSemester ? activeSemester.totalSks.toString() : "0",
      icon: Award, iconBg: "#ede9fe", iconColor: "#7c3aed",
    },
    {
      title: "IPS Semester",
      value: activeSemester ? activeSemester.ips.toFixed(2) : "—",
      icon: TrendingUp, iconBg: "#d1fae5", iconColor: "#059669",
    },
    {
      title: "IPK Kumulatif",
      value: ipk > 0 ? ipk.toFixed(2) : "—",
      icon: TrendingUp, iconBg: "#fef3c7", iconColor: "#d97706",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Riwayat Nilai</h2>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Riwayat nilai mata kuliah per semester berdasarkan data Anda</p>
      </div>

      {semesters.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "#cbd5e1" }} />
            <p className="font-semibold" style={{ color: "#64748b" }}>Belum ada riwayat nilai</p>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>Data akan muncul setelah dosen atau admin mengisi nilai Anda</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Semester Selector */}
          <Card>
            <CardHeader>
              <CardTitle><div className="flex items-center gap-2"><Calendar className="w-5 h-5" />Pilih Semester</div></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {semesters.map((s) => (
                  <button
                    key={s.semester}
                    onClick={() => setSelectedSemester(s.semester)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={
                      selectedSemester === s.semester
                        ? { background: "linear-gradient(135deg, #4361ee, #7c3aed)", color: "#fff" }
                        : { background: "#f1f5f9", color: "#64748b" }
                    }
                  >
                    Semester {s.semester}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

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

          {/* Nilai Table */}
          {activeSemester && (
            <Card>
              <CardHeader>
                <CardTitle>Daftar Nilai — Semester {activeSemester.semester}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                        {["Kode MK", "Nama Mata Kuliah", "SKS", "Nilai Angka", "Nilai Huruf"].map((h) => (
                          <th key={h} className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeSemester.matkul.map((mk, i) => {
                        const nilaiStyle = mk.sudahAda ? getNilaiColor(mk.nilaiHuruf) : { bg: "#f1f5f9", color: "#94a3b8" };
                        return (
                          <tr key={i} style={{ borderBottom: "1px solid #f8faff" }}>
                            <td className="py-3 pr-4">
                              <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "#eef2ff", color: "#4361ee" }}>{mk.kode}</span>
                            </td>
                            <td className="py-3 pr-4 font-medium" style={{ color: "#1a1d2e" }}>{mk.nama}</td>
                            <td className="py-3 pr-4" style={{ color: "#64748b" }}>{mk.sks} SKS</td>
                            <td className="py-3 pr-4">
                              {mk.sudahAda
                                ? <span className="text-base font-bold" style={{ color: "#4361ee" }}>{mk.nilaiAngka.toFixed(1)}</span>
                                : <span style={{ color: "#94a3b8" }}>Belum ada</span>
                              }
                            </td>
                            <td className="py-3">
                              <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: nilaiStyle.bg, color: nilaiStyle.color }}>
                                {mk.sudahAda ? mk.nilaiHuruf : "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
