"use client";

import { Bell, Menu, Search, Settings } from "lucide-react";

interface NavbarProps {
  role: string;
  name: string;
  onMenuToggle?: () => void;
}

const roleLabel: Record<string, string> = {
  KAPRODI: "Ketua Program Studi",
  JAMU: "Penjaminan Mutu",
  ADMIN: "Admin Prodi",
  DOSEN: "Dosen",
  MAHASISWA: "Mahasiswa",
};

export default function Navbar({ role, name, onMenuToggle }: NavbarProps) {
  return (
    <header
      className="h-16 flex items-center justify-between px-4 md:px-6 border-b shrink-0"
      style={{
        background: "#ffffff",
        borderColor: "#e9edf4",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {/* Hamburger — mobile only */}
      <button
        className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-colors mr-2"
        style={{ background: "#f1f5f9", color: "#64748b" }}
        onClick={onMenuToggle}
        aria-label="Toggle menu"
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#e2e8f0"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
      >
        <Menu style={{ width: "1.1rem", height: "1.1rem" }} />
      </button>

      {/* Search — hidden on mobile */}
      <div className="relative hidden md:block">
        <Search
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#94a3b8" }}
        />
        <input
          type="text"
          placeholder="Cari kurikulum, CPL, atau pengguna..."
          className="pl-9 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all w-64 lg:w-80"
          style={{
            background: "#f1f5f9",
            border: "1.5px solid transparent",
            color: "#1a1d2e",
          }}
          onFocus={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "#4361ee";
            (e.currentTarget as HTMLElement).style.background = "#fff";
          }}
          onBlur={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "transparent";
            (e.currentTarget as HTMLElement).style.background = "#f1f5f9";
          }}
        />
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        {/* Notification Bell */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: "#f1f5f9", color: "#64748b" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#e2e8f0"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
          aria-label="Notifikasi"
        >
          <Bell style={{ width: "1.1rem", height: "1.1rem" }} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ background: "#ef4444" }}
          />
        </button>

        {/* Settings */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: "#f1f5f9", color: "#64748b" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#e2e8f0"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#f1f5f9"; }}
          aria-label="Pengaturan"
        >
          <Settings style={{ width: "1.1rem", height: "1.1rem" }} />
        </button>

        {/* Divider */}
        <div className="w-px h-6 mx-1 hidden sm:block" style={{ background: "#e2e8f0" }} />

        {/* User Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold leading-tight" style={{ color: "#1a1d2e" }}>
              {name}
            </p>
            <p className="text-xs" style={{ color: "#94a3b8" }}>
              {roleLabel[role] || role}
            </p>
          </div>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer shrink-0"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
