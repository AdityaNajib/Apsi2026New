"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Mail, Lock, ArrowRight, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login gagal');
        setIsLoading(false);
        return;
      }

      // Redirect to appropriate dashboard
      router.push(data.redirectPath);
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan saat login');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#eef2f7" }}>
      {/* Left Panel - Branding */}
      <div
        className="hidden lg:flex w-[45%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg, #0d1b2a 0%, #1a2f4a 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full opacity-10" style={{ background: "#4361ee" }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-48 h-48 rounded-full opacity-10" style={{ background: "#7c3aed" }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg" style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}>S</div>
          <span className="text-white font-bold text-lg">SICAL-TI UNS</span>
        </div>

        {/* Center text */}
        <div className="relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(67,97,238,0.2)" }}>
            <GraduationCap className="w-7 h-7" style={{ color: "#7c9cff" }} />
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight">
            Monitoring CPL<br />& Evaluasi OBE<br />berbasis IABEE
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            Platform terintegrasi untuk pengelolaan capaian pembelajaran lulusan Program Studi Teknik Industri UNS.
          </p>
          <div className="flex gap-3 flex-wrap pt-2">
            {["Kaprodi", "Admin Prodi", "Dosen", "Mahasiswa"].map((r) => (
              <span key={r} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs relative z-10" style={{ color: "rgba(255,255,255,0.3)" }}>
          © 2026 Teknik Industri UNS. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Back to home */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors group"
            style={{ color: "#64748b" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#4361ee"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#64748b"; }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Kembali ke Beranda
          </Link>

          {/* Header */}
          <div>
            <h2 className="text-3xl font-extrabold" style={{ color: "#1a1d2e" }}>Selamat datang!</h2>
            <p className="mt-2 text-sm" style={{ color: "#94a3b8" }}>
              Masuk menggunakan akun SSO UNS Anda untuk melanjutkan.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-3xl p-8 space-y-5" style={{ background: "#ffffff", boxShadow: "0 4px 32px rgba(0,0,0,0.06)", border: "1px solid #e9edf4" }}>
            {error && (
              <div className="p-4 rounded-xl text-sm flex items-center gap-3" style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#dc2626" }} />
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Email Institusi</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                    placeholder="name@staff.uns.ac.id"
                    required
                    onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#4361ee"; (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                    onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#374151" }}>Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#94a3b8" }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none transition-all"
                    style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0", color: "#1a1d2e" }}
                    placeholder="••••••••"
                    required
                    onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#4361ee"; (e.currentTarget as HTMLElement).style.background = "#fff"; }}
                    onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0"; (e.currentTarget as HTMLElement).style.background = "#f8fafc"; }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)", boxShadow: "0 4px 16px rgba(67,97,238,0.35)" }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "#fff" }} />
                ) : (
                  <>
                    <span>Masuk Sistem</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Dummy accounts */}
            <div className="pt-4 border-t" style={{ borderColor: "#f1f5f9" }}>
              <p className="text-xs font-bold text-center mb-3 uppercase tracking-wider" style={{ color: "#94a3b8" }}>Akun Demo</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { role: "Kaprodi", email: "kaprodi@staff.uns.ac.id", color: "#7c3aed", bg: "#ede9fe" },
                  { role: "Admin", email: "admin@staff.uns.ac.id", color: "#2563eb", bg: "#dbeafe" },
                  { role: "Dosen", email: "dosen@staff.uns.ac.id", color: "#d97706", bg: "#fef3c7" },
                  { role: "Mahasiswa", email: "mhs@student.uns.ac.id", color: "#059669", bg: "#d1fae5" },
                ].map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => {
                      setEmail(acc.email);
                      setPassword('password123');
                    }}
                    className="text-left p-2.5 rounded-xl transition-all"
                    style={{ background: acc.bg, border: `1px solid ${acc.bg}` }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.border = `1px solid ${acc.color}`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.border = `1px solid ${acc.bg}`; }}
                  >
                    <p className="text-xs font-bold" style={{ color: acc.color }}>{acc.role}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "#64748b" }}>{acc.email}</p>
                  </button>
                ))}
              </div>
              <p className="text-xs text-center mt-3" style={{ color: "#cbd5e1" }}>Klik kartu untuk isi email & password otomatis (password: password123)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
