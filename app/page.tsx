import Link from "next/link";
import { ArrowRight, BarChart2, ShieldCheck, Zap, BookOpen, Users, FileCheck2, LogIn } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-muted">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">SICAL-TI UNS</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-primary transition-colors">Fitur</Link>
            <Link href="#roles" className="hover:text-primary transition-colors">Role Pengguna</Link>
            <Link href="#about" className="hover:text-primary transition-colors">Tentang</Link>
            <div className="w-[1px] h-4 bg-muted-foreground/30"></div>
            <Link href="/login" className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-all shadow-sm">
              <LogIn className="w-4 h-4" />
              Masuk Sistem
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-6 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium" style={{ background: "#ede9fe", color: "#7c3aed" }}>
              <Zap className="w-4 h-4" />
              Sistem Monitoring CPL Berbasis OBE (IABEE)
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Monitoring CPL & Evaluasi <br className="hidden md:block" />
              Kurikulum Teknik Industri UNS
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Platform terintegrasi untuk pengelolaan Capaian Pembelajaran Lulusan (CPL), penilaian mahasiswa, dan evaluasi kurikulum berbasis Outcome-Based Education sesuai standar IABEE.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/login" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25">
                <LogIn className="w-5 h-5" />
                Masuk ke Sistem
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#roles" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold transition-all border-2 border-muted hover:border-primary hover:bg-muted/50">
                <Users className="w-5 h-5" />
                Lihat Role Pengguna
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
              {[
                { icon: Users, label: "4 Role Pengguna", color: "#7c3aed" },
                { icon: BookOpen, label: "Manajemen CPL", color: "#2563eb" },
                { icon: FileCheck2, label: "Input Nilai Otomatis", color: "#059669" },
                { icon: BarChart2, label: "Laporan & Analitik", color: "#d97706" },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl border border-muted hover:border-primary/50 transition-all">
                  <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: stat.color }} />
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted/30 py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Fitur Utama Sistem</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Platform lengkap untuk monitoring dan evaluasi capaian pembelajaran lulusan
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-3xl shadow-sm border border-muted hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Penilaian Otomatis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Akumulasi nilai dosen otomatis ke CPL. Dosen cukup menginput nilai tugas dan ujian, sistem akan menghitung CPL secara otomatis.
                </p>
              </div>

              <div className="bg-background p-8 rounded-3xl shadow-sm border border-muted hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart2 className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold mb-3">Dashboard CPL</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Pantau ketercapaian pembelajaran lulusan mahasiswa dengan visualisasi data yang informatif menggunakan radar chart dan statistik.
                </p>
              </div>

              <div className="bg-background p-8 rounded-3xl shadow-sm border border-muted hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-3">Role Based Access</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Akses menu dan data yang disesuaikan dengan sangat ketat untuk tiap role pengguna sistem (Kaprodi, Admin, Dosen, Mahasiswa).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section id="roles" className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Role Pengguna Sistem</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Sistem dirancang untuk 4 role pengguna dengan fitur yang berbeda
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  role: "Kaprodi",
                  email: "kaprodi@staff.uns.ac.id",
                  color: "#7c3aed",
                  bg: "#ede9fe",
                  features: ["Manajemen Admin", "Data Kurikulum", "Laporan CPL", "Approval"]
                },
                {
                  role: "Admin Prodi",
                  email: "admin@staff.uns.ac.id",
                  color: "#2563eb",
                  bg: "#dbeafe",
                  features: ["Data Kurikulum", "Laporan CPL", "Import/Export", "Staff Registration"]
                },
                {
                  role: "Dosen",
                  email: "dosen@staff.uns.ac.id",
                  color: "#d97706",
                  bg: "#fef3c7",
                  features: ["Mata Kuliah Ampu", "Input Nilai", "Rekap Mahasiswa", "Export Data"]
                },
                {
                  role: "Mahasiswa",
                  email: "mhs@student.uns.ac.id",
                  color: "#059669",
                  bg: "#d1fae5",
                  features: ["Profil", "Hasil CPL", "Riwayat Nilai", "Download Laporan"]
                },
              ].map((user, i) => (
                <div key={i} className="p-6 rounded-2xl border border-muted hover:border-primary/50 transition-all hover:shadow-lg" style={{ background: user.bg }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg mb-4" style={{ background: user.color }}>
                    {user.role.charAt(0)}
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: user.color }}>{user.role}</h3>
                  <p className="text-xs text-muted-foreground mb-4 font-mono">{user.email}</p>
                  <ul className="space-y-2">
                    {user.features.map((feature, j) => (
                      <li key={j} className="text-sm flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: user.color }}></span>
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/login" 
                    className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{ background: user.color, color: "white" }}
                  >
                    Login sebagai {user.role}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="bg-muted/30 py-24">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Tentang SICAL-TI</h2>
                <p className="text-muted-foreground">
                  Sistem Informasi Perhitungan Capaian Pembelajaran Lulusan
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-background p-6 rounded-2xl border border-muted">
                  <h3 className="text-lg font-bold mb-3">🎯 Tujuan</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Memudahkan monitoring dan evaluasi Capaian Pembelajaran Lulusan (CPL) Program Studi Teknik Industri UNS sesuai standar IABEE dan OBE.
                  </p>
                </div>
                
                <div className="bg-background p-6 rounded-2xl border border-muted">
                  <h3 className="text-lg font-bold mb-3">📊 Manfaat</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Otomasi perhitungan CPL, visualisasi data real-time, laporan akreditasi, dan kemudahan input nilai untuk dosen.
                  </p>
                </div>
                
                <div className="bg-background p-6 rounded-2xl border border-muted">
                  <h3 className="text-lg font-bold mb-3">🔒 Keamanan</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Role-based access control yang ketat, autentikasi SSO UNS, dan enkripsi data untuk menjaga privasi pengguna.
                  </p>
                </div>
                
                <div className="bg-background p-6 rounded-2xl border border-muted">
                  <h3 className="text-lg font-bold mb-3">📈 Teknologi</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Dibangun dengan Next.js, TypeScript, Prisma ORM, dan SQLite untuk performa optimal dan maintainability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background border-t border-muted pt-16 pb-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>
                  S
                </div>
                <h2 className="text-2xl font-bold">SICAL-TI UNS</h2>
              </div>
              <p className="text-muted-foreground max-w-sm">
                Sistem Informasi Perhitungan Capaian Pembelajaran Lulusan Teknik Industri UNS
              </p>
              <div className="pt-4">
                <Link href="/login" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-all text-sm font-semibold">
                  <LogIn className="w-4 h-4" />
                  Masuk ke Sistem
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Tautan</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li><Link href="#features" className="hover:text-primary transition-colors">Fitur</Link></li>
                <li><Link href="#roles" className="hover:text-primary transition-colors">Role Pengguna</Link></li>
                <li><Link href="#about" className="hover:text-primary transition-colors">Tentang</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6">Role Pengguna</h4>
              <ul className="space-y-3 text-muted-foreground text-sm">
                <li><Link href="/login" className="hover:text-primary transition-colors">Kaprodi</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Admin Prodi</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Dosen</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-colors">Mahasiswa</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-muted pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Copyright © 2026 SICAL-TI. Teknik Industri UNS.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-foreground transition-colors">Kebijakan Privasi</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Syarat & Ketentuan</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
