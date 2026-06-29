"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen, Users, Award, Download, FileBarChart, ArrowLeft } from "lucide-react";
import { useScrollRestore } from "@/lib/useScrollRestore";

interface MataKuliah {
  kelasId: string;
  kode: string;
  nama: string;
  kelas: string;
  jumlahMahasiswa: number;
  statusNilai: string;
}

interface RekapMahasiswa {
  mahasiswaId: string;
  nim: string;
  nama: string;
  angkatan: string;
  nilaiKomponen: { komponenId: string; komponenNama: string; nilai: number }[];
  nilaiAkhir: number;
  nilaiHuruf: string;
}

interface KelasInfo {
  id: string;
  nama: string;
  mataKuliah: string;
  kode: string;
  tahunAjaran: string;
  semester: string;
}

interface KomponenNilai {
  id: string;
  nama: string;
  bobot: number;
}

function SelectMataKuliahCard() {
  const router = useRouter();
  const [mataKuliah, setMataKuliah] = useState<MataKuliah[]>([]);
  const [loading, setLoading] = useState(true);
  const { saveScroll, restoreScroll } = useScrollRestore();

  useEffect(() => {
    fetchMataKuliah();
  }, []);

  const fetchMataKuliah = async () => {
    saveScroll();
    try {
      const res = await fetch("/api/dosen/mata-kuliah");
      const data = await res.json();
      setMataKuliah(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
      restoreScroll();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {mataKuliah.map((mk) => (
        <div 
          key={mk.kelasId} 
          className="cursor-pointer hover:shadow-lg transition-all"
          onClick={() => router.push(`/dosen/rekap?kelasId=${mk.kelasId}`)}
        >
          <Card>
            <CardContent className="p-0">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "#ede9fe" }}>
                  <BookOpen className="w-6 h-6" style={{ color: "#7c3aed" }} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg" style={{ color: "#1a1d2e" }}>{mk.nama}</h3>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>{mk.kode} - Kelas {mk.kelas}</p>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ background: "#dbeafe", color: "#2563eb" }}>
                      {mk.jumlahMahasiswa} Mahasiswa
                    </span>
                    <span className="text-xs px-2 py-1 rounded-lg" style={{ 
                      background: mk.statusNilai === "Siap Input Nilai" ? "#d1fae5" : "#fef3c7",
                      color: mk.statusNilai === "Siap Input Nilai" ? "#059669" : "#d97706"
                    }}>
                      {mk.statusNilai}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}

function RekapMahasiswaPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const kelasId = searchParams.get("kelasId");

  const [kelasInfo, setKelasInfo] = useState<KelasInfo | null>(null);
  const [komponenNilai, setKomponenNilai] = useState<KomponenNilai[]>([]);
  const [rekap, setRekap] = useState<RekapMahasiswa[]>([]);
  const [loading, setLoading] = useState(true);

  const { saveScroll, restoreScroll } = useScrollRestore();

  useEffect(() => {
    if (kelasId) {
      fetchRekap(kelasId);
    } else {
      setLoading(false);
    }
  }, [kelasId]);

  const fetchRekap = async (kelasId: string) => {
    saveScroll();
    try {
      setLoading(true);
      const res = await fetch(`/api/dosen/rekap/${kelasId}`);
      const data = await res.json();
      setKelasInfo(data.kelas || null);
      setKomponenNilai(Array.isArray(data.komponenNilai) ? data.komponenNilai : []);
      setRekap(Array.isArray(data.rekap) ? data.rekap : []);
    } catch (error) {
      console.error("Error fetching rekap:", error);
      setKelasInfo(null);
      setKomponenNilai([]);
      setRekap([]);
    } finally {
      setLoading(false);
      restoreScroll();
    }
  };

  const exportToExcel = () => {
    if (!kelasInfo || !Array.isArray(rekap) || rekap.length === 0) return;

    const tahun = new Date().getFullYear();
    // BOM UTF-8 agar Excel baca karakter dengan benar
    let csv = '\uFEFF';
    csv += `REKAP NILAI MAHASISWA\r\n`;
    csv += `Mata Kuliah: ${kelasInfo.mataKuliah} (${kelasInfo.kode})\r\n`;
    csv += `Kelas: ${kelasInfo.nama} | ${kelasInfo.tahunAjaran} | ${kelasInfo.semester}\r\n`;
    csv += `Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}\r\n`;
    csv += `\r\n`;

    // Header kolom
    const headers = ['NIM', 'Nama Mahasiswa', 'Angkatan'];
    komponenNilai.forEach((k) => headers.push(`${k.nama} (${k.bobot}%)`));
    headers.push('Nilai Akhir', 'Nilai Huruf', 'Status');
    csv += headers.map((h) => `"${h}"`).join(',') + '\r\n';

    // Data baris
    rekap.forEach((r) => {
      const row = [r.nim, r.nama, r.angkatan];
      komponenNilai.forEach((k) => {
        const nilai = r.nilaiKomponen.find((n) => n.komponenId === k.id);
        row.push(String(nilai?.nilai ?? '-'));
      });
      row.push(String(r.nilaiAkhir), r.nilaiHuruf, r.nilaiAkhir >= 55 ? 'Lulus' : 'Tidak Lulus');
      csv += row.map((v) => `"${v}"`).join(',') + '\r\n';
    });

    // Summary
    csv += `\r\n`;
    csv += `"Rata-rata Kelas","${stats.rataRata}"\r\n`;
    csv += `"Nilai Tertinggi","${stats.tertinggi}"\r\n`;
    csv += `"Nilai Terendah","${stats.terendah}"\r\n`;
    csv += `"Jumlah Lulus","${stats.lulus} dari ${rekap.length}"\r\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rekap_${kelasInfo.kode}_Kelas${kelasInfo.nama}_${tahun}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatistik = () => {
    if (!Array.isArray(rekap) || rekap.length === 0) {
      return { rataRata: 0, tertinggi: 0, terendah: 0, lulus: 0 };
    }

    const nilaiList = rekap.map((r) => r.nilaiAkhir);
    const rataRata = nilaiList.reduce((sum, n) => sum + n, 0) / nilaiList.length;
    const tertinggi = Math.max(...nilaiList);
    const terendah = Math.min(...nilaiList);
    const lulus = rekap.filter((r) => r.nilaiAkhir >= 55).length;

    return {
      rataRata: Math.round(rataRata * 100) / 100,
      tertinggi,
      terendah,
      lulus,
    };
  };

  const stats = getStatistik();

  const getNilaiColor = (huruf: string) => {
    if (huruf.startsWith("A")) return { bg: "#d1fae5", color: "#059669" };
    if (huruf.startsWith("B")) return { bg: "#dbeafe", color: "#2563eb" };
    if (huruf.startsWith("C")) return { bg: "#fef3c7", color: "#d97706" };
    if (huruf.startsWith("D")) return { bg: "#fed7aa", color: "#ea580c" };
    return { bg: "#fee2e2", color: "#dc2626" };
  };

  if (!kelasId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>
            Rekap Nilai Mahasiswa
          </h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Pilih mata kuliah untuk melihat rekap nilai
          </p>
        </div>
        
        <SelectMataKuliahCard />
      </div>
    );
  }

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dosen/rekap")}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: "#f1f5f9", color: "#64748b" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#e2e8f0";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>
              Rekap Nilai Mahasiswa
            </h2>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              Lihat rekap dan statistik nilai mahasiswa per mata kuliah
            </p>
          </div>
        </div>
        {rekap && Array.isArray(rekap) && rekap.length > 0 && (
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Mata Kuliah Selector - REMOVED */}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !Array.isArray(rekap) || rekap.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileBarChart className="w-12 h-12 mx-auto mb-4" style={{ color: "#cbd5e1" }} />
            <p className="text-sm font-medium" style={{ color: "#64748b" }}>
              Belum ada data nilai untuk kelas ini
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Statistik */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <Card>
              <CardContent className="p-0 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#dbeafe" }}>
                  <Award className="w-5 h-5" style={{ color: "#2563eb" }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>Rata-rata Kelas</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: "#1a1d2e" }}>{stats.rataRata}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#d1fae5" }}>
                  <Award className="w-5 h-5" style={{ color: "#059669" }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>Nilai Tertinggi</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: "#1a1d2e" }}>{stats.tertinggi}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#fee2e2" }}>
                  <Award className="w-5 h-5" style={{ color: "#dc2626" }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>Nilai Terendah</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: "#1a1d2e" }}>{stats.terendah}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: "#ede9fe" }}>
                  <Users className="w-5 h-5" style={{ color: "#7c3aed" }} />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: "#94a3b8" }}>Mahasiswa Lulus</p>
                  <p className="text-2xl font-bold mt-0.5" style={{ color: "#1a1d2e" }}>
                    {stats.lulus}/{rekap.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rekap Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {kelasInfo?.kode} - {kelasInfo?.mataKuliah} ({kelasInfo?.nama})
                </div>
              </CardTitle>
              <div className="text-xs" style={{ color: "#94a3b8" }}>
                {kelasInfo?.tahunAjaran} • {kelasInfo?.semester}
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                        NIM
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                        Nama Mahasiswa
                      </th>
                      <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                        Angkatan
                      </th>
                      {komponenNilai.map((k) => (
                        <th key={k.id} className="pb-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                          {k.nama}
                          <br />
                          <span style={{ color: "#4361ee" }}>({k.bobot}%)</span>
                        </th>
                      ))}
                      <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                        Nilai Akhir
                      </th>
                      <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: "#94a3b8" }}>
                        Huruf
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekap.map((r) => {
                      const nilaiStyle = getNilaiColor(r.nilaiHuruf);
                      return (
                        <tr key={r.mahasiswaId} style={{ borderBottom: "1px solid #f8faff" }}>
                          <td className="py-3 pr-4">
                            <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: "#eef2ff", color: "#4361ee" }}>
                              {r.nim}
                            </span>
                          </td>
                          <td className="py-3 pr-4 font-medium" style={{ color: "#1a1d2e" }}>
                            {r.nama}
                          </td>
                          <td className="py-3 text-center" style={{ color: "#64748b" }}>
                            {r.angkatan}
                          </td>
                          {komponenNilai.map((k) => {
                            const nilai = r.nilaiKomponen.find((n) => n.komponenId === k.id);
                            return (
                              <td key={k.id} className="py-3 text-center font-semibold" style={{ color: "#1a1d2e" }}>
                                {nilai?.nilai ?? "-"}
                              </td>
                            );
                          })}
                          <td className="py-3 text-center">
                            <span className="text-base font-bold" style={{ color: "#4361ee" }}>
                              {r.nilaiAkhir}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <span
                              className="text-xs font-bold px-3 py-1.5 rounded-lg"
                              style={{ background: nilaiStyle.bg, color: nilaiStyle.color }}
                            >
                              {r.nilaiHuruf}
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
        </>
      )}
    </div>
  );
}

export default function RekapMahasiswaPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RekapMahasiswaPageContent />
    </Suspense>
  );
}
