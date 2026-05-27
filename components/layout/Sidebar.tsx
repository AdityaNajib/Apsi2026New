"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileBarChart,
  LogOut,
  GraduationCap,
  ClipboardList,
  PenTool,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  role: string;
  name: string;
}

export default function Sidebar({ role, name }: SidebarProps) {
  const pathname = usePathname();

  const getMenu = () => {
    switch (role) {
      case "KAPRODI":
        return [
          { name: "Dashboard", href: "/kaprodi", icon: LayoutDashboard },
          { name: "Manajemen Admin", href: "/kaprodi/manajemen-admin", icon: Users },
          { name: "Data Kurikulum", href: "/kaprodi/data-kurikulum", icon: BookOpen },
          { name: "Laporan CPL", href: "/kaprodi/laporan-cpl", icon: FileBarChart },
        ];
      case "ADMIN":
        return [
          { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
          { name: "Data Kurikulum", href: "/admin/kurikulum", icon: BookOpen },
          { name: "Laporan CPL", href: "/admin/laporan", icon: FileBarChart },
        ];
      case "DOSEN":
        return [
          { name: "Dashboard", href: "/dosen", icon: LayoutDashboard },
          { name: "Mata Kuliah Ampu", href: "/dosen/matakuliah", icon: BookOpen },
          { name: "Input Nilai", href: "/dosen/nilai", icon: PenTool },
          { name: "Rekap Mahasiswa", href: "/dosen/rekap", icon: ClipboardList },
        ];
      case "MAHASISWA":
        return [
          { name: "Dashboard", href: "/mahasiswa", icon: LayoutDashboard },
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
    ADMIN: "Admin Prodi",
    DOSEN: "Dosen",
    MAHASISWA: "Mahasiswa",
  };

  return (
    <div
      className="w-64 flex flex-col h-full"
      style={{ background: "#0d1b2a" }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-lg"
            style={{ background: "linear-gradient(135deg, #4361ee, #7c3aed)" }}
          >
            S
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide">SICAL-TI UNS</h1>
            <p className="text-xs" style={{ color: "rgba(248,250,252,0.45)" }}>
              Teknik Industri UNS
            </p>
          </div>
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
          {menu.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
                  style={
                    isActive
                      ? {
                          background:
                            "linear-gradient(135deg, #4361ee, #7c3aed)",
                          color: "#ffffff",
                          boxShadow: "0 4px 15px rgba(67,97,238,0.35)",
                        }
                      : { color: "rgba(248,250,252,0.6)" }
                  }
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(255,255,255,0.07)";
                      (e.currentTarget as HTMLElement).style.color = "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                      (e.currentTarget as HTMLElement).style.color =
                        "rgba(248,250,252,0.6)";
                    }
                  }}
                >
                  <item.icon className="w-4.5 h-4.5 shrink-0" style={{ width: "1.1rem", height: "1.1rem" }} />
                  <span className="text-sm font-medium">{item.name}</span>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-auto opacity-70" />
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
          onClick={() => {
            document.cookie =
              "role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            document.cookie =
              "name=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
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
}
