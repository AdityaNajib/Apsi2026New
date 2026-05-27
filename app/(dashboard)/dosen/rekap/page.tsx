"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen, Users, Award, Download, FileBarChart } from "lucide-react";

interface MataKuliah {
  kelasId: string;
  kode: string;
  nama: string;
  namaKelas: string;
  jumlahMahasiswa: number;
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

export default function RekapMahasiswaPage() {
  const [mataKuliah, setMataKuliah] = useState<MataKuliah[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [kelasInfo, setKelasInfo] = useState<KelasInfo | null>(null);
  const [komponenNilai, setKomponenNilai] = useState<KomponenNilai[]>([]);
  const [rekap, setRekap] = useState<RekapMahasiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRekap, setLoadingRekap] = useState(false);

  useEffect(() => {
    fetchMataKuliah();
  }, []);

  useEffect(() => {
    if (selectedKelas) {
      fetchRekap(selectedKelas);
    }
  }, [selectedKelas]);

  const fetchMataKuliah = async () => {
    try {
      const res = await fetch("/api/dosen/mata-kuliah");
      const data = await res.json();
      setMataKuliah(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) {
        setSelectedKelas(data[0].kelasId);
      }
    } catch (error) {
      console.error("Error fetching mata kuliah:", error);
      setMataKuliah([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRekap = async (kelasId: string) => {
    try {
      setLoadingRekap(true);
      const res = await fetch(`/api/dosen/rekap/${kelasId}`);
      const data = await res.json();
      setKelasInfo(data.kelas);
      setKomponenNilai(data.komponenNilai);
      setRekap(data.rekap);
    } catch (error) {
      console.error("Error fetching rekap:", error);
    } finally {
      setLoadingRekap(false);
    }
  };

  const exportToExcel = () => {
    // Simple CSV export
    if (!kelasInfo || rekap.length === 0) return;

    let csv = "NIM,Nama,Angkatan,";
    komponenNilai.forEach((k) => {
      csv += `${k.nama} (${k.bobot}%),`;
    });
    csv += "Nilai Akhir,Nilai Huruf\n";

    rekap.forEach((r) => {
      csv += `${r.nim},${r.nama},${r.angkatan},`;
      komponenNilai.forEach((k) => {
        const nilai = r.nilaiKomponen.find((n) => n.komponenId === k.id);
        csv += `${nilai?.nilai ?? "-"},`;
      });
      csv += `${r.nilaiAkhir},${r.nilaiHuruf}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rekap_${kelasInfo.kode}_${kelasInfo.nama}.csv`;
    a.click();
  };

  const getStatistik = () => {
    if (rekap.length === 0) return { rataRata: 0, tertinggi: 0, terendah: 0, lulus: 0 };

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
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>
            Rekap Nilai Mahasiswa
          </h2>
          <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
            Lihat rekap dan statistik nilai mahasiswa per mata kuliah
          </p>
        </div>
        {rekap.length > 0 && (
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

      {/* Mata Kuliah Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Mata Kuliah</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedKelas}
            onChange={(e) => setSelectedKelas(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
            style={{ background: "#f1f5f9", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
          >
            {mataKuliah.map((mk) => (
              <option key={mk.kelasId} value={mk.kelasId}>
                {mk.kode} - {mk.nama} ({mk.namaKelas}) - {mk.jumlahMahasiswa} mahasiswa
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {loadingRekap ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rekap.length === 0 ? (
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
