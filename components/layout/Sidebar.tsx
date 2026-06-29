"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  Users,
  BookOpen,
  FileBarChart,
  LogOut,
  GraduationCap,
  ClipboardList,
  PenTool,
  ChevronRight,
  Shield,
  Target,
  X,
} from "lucide-react";

interface SidebarProps {
  role: string;
  name: string;
  dosenMataKuliah?: { kelasId: string; nama: string; kode: string; namaKelas?: string }[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, name, dosenMataKuliah = [], isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (onClose) onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const getMenu = () => {
    switch (role) {
      case "KAPRODI":
        return [
          { name: "Beranda", href: "/kaprodi", icon: Home },
          { name: "Manajemen Admin", href: "/kaprodi/manajemen-admin", icon: Shield },
          { name: "Data Kurikulum", href: "/kaprodi/data-kurikulum", icon: BookOpen },
          { name: "Laporan CPL", href: "/kaprodi/laporan-cpl", icon: FileBarChart },
        ];
      case "JAMU":
        return [
          { name: "Beranda", href: "/jamu", icon: Home },
          { name: "Data Kurikulum", href: "/jamu/data-kurikulum", icon: BookOpen },
          { name: "Laporan CPL", href: "/jamu/laporan-cpl", icon: FileBarChart },
        ];
      case "ADMIN":
        return [
          { name: "Beranda", href: "/admin", icon: Home },
          { name: "Manajemen Pengguna", href: "/admin/manajemen-pengguna", icon: Users },
          { name: "Akademik", href: "/admin/akademik", icon: BookOpen },
          { name: "Mapping Kurikulum", href: "/admin/mapping", icon: Target },
          { name: "Mapping CPL → PI", href: "/admin/mapping/cpl", icon: Target, indent: true },
          { name: "Mapping PI → CPMK", href: "/admin/mapping/pi", icon: BookOpen, indent: true },
          { name: "Mapping CPMK → Komp.", href: "/admin/mapping/cpmk", icon: ClipboardList, indent: true },
          { name: "Data Kurikulum", href: "/admin/data-kurikulum", icon: FileBarChart },
          { name: "Laporan CPL", href: "/admin/laporan-cpl", icon: FileBarChart },
        ];
      case "DOSEN":
        return [
          { name: "Beranda", href: "/dosen", icon: Home },
          { name: "Input Nilai", href: "/dosen/nilai", icon: PenTool },
          { name: "Rekap Nilai", href: "/dosen/rekap", icon: ClipboardList },
          ...dosenMataKuliah.map((mk) => ({
            name: `${mk.kode}${mk.namaKelas ? ` - ${mk.namaKelas}` : ""}`,
            href: `/dosen/nilai?kelasId=${mk.kelasId}`,
            icon: BookOpen,
            sub: mk.nama,
          })),
        ];
      case "MAHASISWA":
        return [
          { name: "Beranda", href: "/mahasiswa", icon: Home },
          { name: "Profil", href: "/mahasiswa/profil", icon: Users },
          { name: "Hasil CPL", href: "/mahasiswa/cpl", icon: GraduationCap },
          { name: "Riwayat Nilai", href: "/mahasiswa/riwayat", icon: FileBarChart },
        ];
      default:
        return [];
    }
  };

  const menu = getMenu();
  const roleLabel: Record<string, string> = {
    KAPRODI: "Ketua Program Studi",
    JAMU: "Penjaminan Mutu",
    ADMIN: "Admin Prodi",
    DOSEN: "Dosen",
    MAHASISWA: "Mahasiswa",
  };

  const sidebarContent = (
    <div className="w-64 flex flex-col h-full" style={{ background: "#0d1b2a" }}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-lg"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            S
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white text-sm tracking-wide">SICAL-TI UNS</h1>
            <p className="text-xs" style={{ color: "rgba(248,250,252,0.45)" }}>
              Teknik Industri UNS
            </p>
          </div>
          {/* Close button — mobile only */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "rgba(248,250,252,0.6)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              aria-label="Tutup sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{name}</p>
            <p className="text-xs truncate" style={{ color: "rgba(248,250,252,0.45)" }}>
              {roleLabel[role] || role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: "rgba(248,250,252,0.3)" }}>
          Menu
        </p>
        <ul className="space-y-1">
          {menu.map((item, idx) => {
            const isDynamic = "sub" in item;
            const prevIsDynamic = idx > 0 && "sub" in menu[idx - 1];
            const showSeparator = isDynamic && !prevIsDynamic && idx > 0;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dosen" &&
                item.href !== "/mahasiswa" &&
                item.href !== "/kaprodi" &&
                item.href !== "/admin" &&
                item.href !== "/jamu" &&
                pathname.startsWith(item.href.split("?")[0]));

            return (
              <li key={item.href + item.name}>
                {showSeparator && (
                  <div className="px-3 pt-3 pb-2">
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(248,250,252,0.3)" }}>
                      Mata Kuliah
                    </p>
                  </div>
                )}
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl transition-all duration-200 group relative"
                  style={{
                    paddingLeft: "indent" in item && item.indent ? "1.75rem" : "0.75rem",
                    paddingRight: "0.75rem",
                    paddingTop: "indent" in item && item.indent ? "0.5rem" : "0.625rem",
                    paddingBottom: "indent" in item && item.indent ? "0.5rem" : "0.625rem",
                    ...( isActive
                      ? { background: "linear-gradient(135deg, #4361ee, #7c3aed)", color: "#ffffff", boxShadow: "0 4px 15px rgba(67,97,238,0.35)" }
                      : { color: "indent" in item && item.indent ? "rgba(248,250,252,0.45)" : "rgba(248,250,252,0.6)" }
                    ),
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLElement).style.color = "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "indent" in item && item.indent ? "rgba(248,250,252,0.45)" : "rgba(248,250,252,0.6)";
                    }
                  }}
                >
                  {"indent" in item && item.indent && (
                    <span className="w-px h-4 rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
                  )}
                  <item.icon className="shrink-0" style={{ width: "indent" in item && item.indent ? "0.9rem" : "1.1rem", height: "indent" in item && item.indent ? "0.9rem" : "1.1rem" }} />
                  <div className="min-w-0 flex-1">
                    <span className={`font-medium block truncate ${"indent" in item && item.indent ? "text-xs" : "text-sm"}`}>{item.name}</span>
                    {"sub" in item && item.sub && (
                      <span className="text-xs block truncate" style={{ opacity: 0.6 }}>{item.sub}</span>
                    )}
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto opacity-70 shrink-0" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={async () => {
            try {
              await fetch('/api/auth/logout', { method: 'POST' });
            } catch {
              // fallback: clear cookies manually
              document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
              document.cookie = "name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
              document.cookie = "userId=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            }
            window.location.href = "/login";
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
          style={{ color: "rgba(239,68,68,0.8)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)";
            (e.currentTarget as HTMLElement).style.color = "#ef4444";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "rgba(239,68,68,0.8)";
          }}
        >
          <LogOut className="shrink-0" style={{ width: "1.1rem", height: "1.1rem" }} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar — always visible on md+ */}
      <div className="hidden md:flex h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile sidebar — slide-in overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 flex md:hidden h-full">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}
