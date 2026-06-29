import Link from "next/link";
import {
  ArrowRight, BarChart2, ShieldCheck, Zap, BookOpen, Users,
  FileCheck2, LogIn, Download, Upload, GraduationCap, PenTool,
  ClipboardList, Target, TrendingUp, FileText,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans" style={{ background: "#f8fafc" }}>
      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md border-b" style={{ background: "rgba(255,255,255,0.85)", borderColor: "#e2e8f0" }}>
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-base shadow"
              style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>S</div>
            <span className="text-xl font-bold tracking-tight" style={{ color: "#1a1d2e" }}>SICAL-TI UNS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: "#64748b" }}>
            <Link href="#fitur" className="hover:text-blue-600 transition-colors">Fitur</Link>
            <Link href="#roles" className="hover:text-blue-600 transition-colors">Role Pengguna</Link>
            <Link href="#tentang" className="hover:text-blue-600 transition-colors">Tentang</Link>
            <Link href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold transition-all"
              style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 14px rgba(67,97,238,0.35)" }}>
              <LogIn className="w-4 h-4" /> Masuk Sistem
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: "#ede9fe", color: "#7c3aed" }}>
              <Zap className="w-4 h-4" /> Sistem Monitoring CPL Berbasis OBE (IABEE)
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight" style={{ color: "#1a1d2e" }}>
              Monitoring CPL & Evaluasi<br className="hidden md:block" />
              Kurikulum Teknik Industri UNS
            </h1>
            <p className="text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#64748b" }}>
              Platform terintegrasi untuk pengelolaan Capaian Pembelajaran Lulusan (CPL),
              penilaian mahasiswa, dan evaluasi kurikulum berbasis Outcome-Based Education
              sesuai standar IABEE — dengan 5 role pengguna dan akses berbasis domain email.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white transition-all shadow-lg"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 20px rgba(67,97,238,0.4)" }}>
                <LogIn className="w-5 h-5" /> Masuk ke Sistem <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#roles"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold transition-all border-2"
                style={{ color: "#4361ee", borderColor: "#4361ee", background: "transparent" }}>
                <Users className="w-5 h-5" /> Lihat Role Pengguna
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
              {[
                { icon: Users, label: "5 Role Pengguna", color: "#7c3aed" },
                { icon: BookOpen, label: "Manajemen CPL/PI/CPMK", color: "#2563eb" },
                { icon: FileCheck2, label: "Input Nilai & Import CSV", color: "#059669" },
                { icon: BarChart2, label: "Laporan PDF & Excel", color: "#d97706" },
              ].map((s, i) => (
                <div key={i} className="p-4 rounded-2xl border text-center transition-all hover:shadow-md"
                  style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                  <s.icon className="w-6 h-6 mx-auto mb-2" style={{ color: s.color }} />
                  <p className="text-sm font-semibold" style={{ color: "#1a1d2e" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Fitur ── */}
        <section id="fitur" className="py-24" style={{ background: "#f1f5f9" }}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1a1d2e" }}>Fitur Utama Sistem</h2>
              <p style={{ color: "#64748b" }}>Semua yang dibutuhkan untuk monitoring dan evaluasi CPL dalam satu platform</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  color: "#4361ee",
                  bg: "#eef2ff",
                  title: "Perhitungan CPL Otomatis",
                  desc: "Nilai dosen otomatis terakumulasi ke CPL melalui mapping CPMK → PI → CPL. Tidak perlu hitung manual.",
                },
                {
                  icon: BarChart2,
                  color: "#7c3aed",
                  bg: "#ede9fe",
                  title: "Laporan & Download",
                  desc: "Kaprodi dan Penjaminan Mutu bisa download laporan CPL dalam format Excel/CSV dan cetak PDF langsung dari browser.",
                },
                {
                  icon: ShieldCheck,
                  color: "#059669",
                  bg: "#d1fae5",
                  title: "Akses Berbasis Domain Email",
                  desc: "Login satu pintu — role otomatis terdeteksi dari domain email (@kaprodi.ac.id, @staff.uns.ac.id, @student.uns.ac.id, dll).",
                },
                {
                  icon: Upload,
                  color: "#d97706",
                  bg: "#fef3c7",
                  title: "Import CSV Massal",
                  desc: "Admin bisa import data dosen, mahasiswa, dan nilai sekaligus via upload file CSV dengan validasi otomatis per baris.",
                },
                {
                  icon: PenTool,
                  color: "#2563eb",
                  bg: "#dbeafe",
                  title: "Input Nilai Fleksibel",
                  desc: "Dosen dan admin bisa input nilai per komponen (UTS, UAS, Tugas). Komponen dan bobotnya bisa dikustomisasi per kelas.",
                },
                {
                  icon: GraduationCap,
                  color: "#0891b2",
                  bg: "#cffafe",
                  title: "Dashboard Mahasiswa Personal",
                  desc: "Setiap mahasiswa lihat CPL-nya sendiri berdasarkan NIM — nilai, progress bar, status tercapai/belum, dan download PDF.",
                },
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-3xl border transition-all hover:shadow-lg"
                  style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background: f.bg }}>
                    <f.icon className="w-6 h-6" style={{ color: f.color }} />
                  </div>
                  <h3 className="text-xl font-bold mb-3" style={{ color: "#1a1d2e" }}>{f.title}</h3>
                  <p className="leading-relaxed" style={{ color: "#64748b" }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Role Cards ── */}
        <section id="roles" className="py-24" style={{ background: "#fff" }}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1a1d2e" }}>5 Role Pengguna</h2>
              <p style={{ color: "#64748b" }}>Setiap role punya akses dan fitur yang disesuaikan dengan tugasnya</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {[
                {
                  role: "Kaprodi",
                  domain: "@kaprodi.uns.ac.id",
                  color: "#7c3aed",
                  bg: "#ede9fe",
                  border: "#c4b5fd",
                  features: [
                    "Manajemen Admin Prodi",
                    "CRUD CPL / PI / CPMK",
                    "Laporan CPL semua angkatan",
                    "Download PDF & Excel",
                    "Filter per angkatan",
                  ],
                },
                {
                  role: "Penjaminan Mutu",
                  domain: "@jamu.uns.ac.id",
                  color: "#0891b2",
                  bg: "#cffafe",
                  border: "#a5f3fc",
                  features: [
                    "CRUD CPL / PI / CPMK",
                    "Edit deskripsi & koreksi typo",
                    "Laporan CPL semua angkatan",
                    "Download PDF & Excel",
                    "Hak akses = Kaprodi",
                  ],
                },
                {
                  role: "Admin Prodi",
                  domain: "@admin.uns.ac.id",
                  color: "#2563eb",
                  bg: "#dbeafe",
                  border: "#93c5fd",
                  features: [
                    "Tambah dosen & mahasiswa",
                    "Import CSV massal",
                    "Manajemen kelas (MK, dosen, mhs)",
                    "Input / bantu nilai",
                    "Data Kurikulum & Laporan CPL",
                  ],
                },
                {
                  role: "Dosen",
                  domain: "@staff.uns.ac.id",
                  color: "#d97706",
                  bg: "#fef3c7",
                  border: "#fde68a",
                  features: [
                    "Sidebar dinamis per mata kuliah",
                    "Kelola komponen nilai (UTS/UAS/dll)",
                    "Input nilai mahasiswa",
                    "Rekap nilai & huruf mutu",
                    "Export rekap CSV",
                  ],
                },
                {
                  role: "Mahasiswa",
                  domain: "@student.uns.ac.id",
                  color: "#059669",
                  bg: "#d1fae5",
                  border: "#6ee7b7",
                  features: [
                    "Dashboard CPL personal (by NIM)",
                    "Progress bar per CPL",
                    "Riwayat nilai per semester",
                    "IPS & IPK otomatis",
                    "Download PDF ketercapaian CPL",
                  ],
                },
              ].map((user, i) => (
                <div key={i} className="p-6 rounded-2xl border flex flex-col transition-all hover:shadow-xl hover:-translate-y-1"
                  style={{ background: user.bg, borderColor: user.border }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4 shadow"
                    style={{ background: user.color }}>
                    {user.role.charAt(0)}
                  </div>
                  <h3 className="text-lg font-bold mb-1" style={{ color: user.color }}>{user.role}</h3>
                  <p className="text-xs font-mono mb-4 px-2 py-1 rounded-lg w-fit" style={{ background: "rgba(255,255,255,0.6)", color: "#64748b" }}>
                    {user.domain}
                  </p>
                  <ul className="space-y-2 flex-1 mb-5">
                    {user.features.map((f, j) => (
                      <li key={j} className="text-sm flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: user.color }} />
                        <span style={{ color: "#374151" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/login"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: user.color }}>
                    Login sebagai {user.role} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Alur Sistem ── */}
        <section className="py-24" style={{ background: "#f1f5f9" }}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1a1d2e" }}>Alur Sistem</h2>
              <p style={{ color: "#64748b" }}>Bagaimana data mengalir dari input nilai ke laporan CPL</p>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
              {[
                { icon: PenTool, label: "Dosen Input Nilai", sub: "UTS · UAS · Tugas", color: "#d97706", bg: "#fef3c7" },
                { icon: Target, label: "Sistem Hitung CPMK", sub: "Bobot komponen", color: "#4361ee", bg: "#eef2ff" },
                { icon: TrendingUp, label: "Akumulasi ke CPL", sub: "via PI → CPL", color: "#7c3aed", bg: "#ede9fe" },
                { icon: FileText, label: "Laporan Tersedia", sub: "PDF · Excel · Dashboard", color: "#059669", bg: "#d1fae5" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex flex-col items-center text-center p-5 rounded-2xl border w-44"
                    style={{ background: "#fff", borderColor: "#e2e8f0" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style={{ background: step.bg }}>
                      <step.icon className="w-6 h-6" style={{ color: step.color }} />
                    </div>
                    <p className="font-semibold text-sm" style={{ color: "#1a1d2e" }}>{step.label}</p>
                    <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{step.sub}</p>
                  </div>
                  {i < 3 && <ArrowRight className="w-6 h-6 shrink-0 hidden md:block" style={{ color: "#94a3b8" }} />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tentang ── */}
        <section id="tentang" className="py-24" style={{ background: "#fff" }}>
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1a1d2e" }}>Tentang SICAL-TI</h2>
                <p style={{ color: "#64748b" }}>Sistem Informasi Capaian Pembelajaran Lulusan</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: "🎯", title: "Tujuan", desc: "Memudahkan monitoring dan evaluasi Capaian Pembelajaran Lulusan (CPL) Program Studi Teknik Industri UNS sesuai standar IABEE dan OBE." },
                  { icon: "📊", title: "Manfaat", desc: "Otomasi perhitungan CPL, visualisasi data real-time, laporan akreditasi, import data massal, dan kemudahan input nilai untuk dosen." },
                  { icon: "🔒", title: "Keamanan", desc: "Login satu pintu dengan deteksi role otomatis dari domain email institusi UNS. Setiap role hanya dapat mengakses data yang relevan." },
                  { icon: "📈", title: "Teknologi", desc: "Dibangun dengan Next.js 16, TypeScript, Prisma ORM, dan SQLite — ringan, cepat, dan mudah di-deploy untuk kebutuhan akademik." },
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-2xl border" style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}>
                    <h3 className="text-lg font-bold mb-3" style={{ color: "#1a1d2e" }}>{item.icon} {item.title}</h3>
                    <p className="leading-relaxed" style={{ color: "#64748b" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t pt-16 pb-8" style={{ background: "#0d1b2a", borderColor: "#1e2d3d" }}>
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-base"
                  style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>S</div>
                <h2 className="text-xl font-bold text-white">SICAL-TI UNS</h2>
              </div>
              <p className="text-sm max-w-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                Sistem Informasi Capaian Pembelajaran Lulusan — Program Studi Teknik Industri, Universitas Sebelas Maret.
              </p>
              <Link href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                <LogIn className="w-4 h-4" /> Masuk ke Sistem
              </Link>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-white">Navigasi</h4>
              <ul className="space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                {["#fitur|Fitur Sistem", "#roles|Role Pengguna", "#tentang|Tentang", "/login|Login"].map((item) => {
                  const [href, label] = item.split("|");
                  return <li key={href}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>;
                })}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-5 text-white">Role Pengguna</h4>
              <ul className="space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                {["Kaprodi", "Penjaminan Mutu", "Admin Prodi", "Dosen", "Mahasiswa"].map((r) => (
                  <li key={r}><Link href="/login" className="hover:text-white transition-colors">{r}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm"
            style={{ borderColor: "#1e2d3d", color: "rgba(255,255,255,0.3)" }}>
            <p>© 2026 SICAL-TI — Teknik Industri UNS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
