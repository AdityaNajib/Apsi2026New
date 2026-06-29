"use client";
import Link from "next/link";
import { Target, BookOpen, FileCheck2, ArrowRight } from "lucide-react";

export default function AdminMappingHubPage() {
  const cards = [
    {
      href: "/admin/mapping/cpl",
      icon: Target,
      color: "#7c3aed",
      bg: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
      border: "#c4b5fd",
      title: "Mapping CPL → PI",
      desc: "Pilih PI mana saja yang berkontribusi terhadap setiap CPL menggunakan toggle.",
      badge: "Level 1",
      badgeBg: "#ede9fe",
      badgeColor: "#7c3aed",
    },
    {
      href: "/admin/mapping/pi",
      icon: BookOpen,
      color: "#2563eb",
      bg: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
      border: "#93c5fd",
      title: "Mapping PI → CPMK",
      desc: "Pilih CPMK dari setiap mata kuliah yang mendukung masing-masing PI.",
      badge: "Level 2",
      badgeBg: "#dbeafe",
      badgeColor: "#2563eb",
    },
    {
      href: "/admin/mapping/cpmk",
      icon: FileCheck2,
      color: "#059669",
      bg: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
      border: "#6ee7b7",
      title: "Mapping CPMK → Komponen",
      desc: "Tentukan komponen penilaian (UTS, UAS, Tugas, dll) dan bobotnya untuk setiap CPMK.",
      badge: "Level 3",
      badgeBg: "#d1fae5",
      badgeColor: "#059669",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Mapping Kurikulum</h2>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          Atur relasi antar elemen kurikulum menggunakan toggle. Perubahan langsung tersimpan otomatis.
        </p>
      </div>

      <div className="flex items-center gap-3 text-xs font-semibold overflow-x-auto py-2">
        {[
          { label: "CPL", color: "#7c3aed", bg: "#ede9fe" },
          { label: "↓", color: "#94a3b8", bg: "transparent" },
          { label: "PI", color: "#2563eb", bg: "#dbeafe" },
          { label: "↓", color: "#94a3b8", bg: "transparent" },
          { label: "CPMK", color: "#059669", bg: "#d1fae5" },
          { label: "↓", color: "#94a3b8", bg: "transparent" },
          { label: "Komponen", color: "#d97706", bg: "#fef3c7" },
        ].map((item, i) => (
          <span key={i} className="px-3 py-1.5 rounded-full shrink-0"
            style={{ background: item.bg, color: item.color }}>{item.label}</span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}
            className="group flex flex-col gap-4 p-6 rounded-2xl border transition-all hover:shadow-lg hover:-translate-y-1"
            style={{ background: card.bg, borderColor: card.border }}>
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.6)" }}>
                <card.icon className="w-6 h-6" style={{ color: card.color }} />
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: card.badgeBg, color: card.badgeColor }}>{card.badge}</span>
            </div>
            <div>
              <h3 className="font-bold text-base mb-1" style={{ color: card.color }}>{card.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "#374151" }}>{card.desc}</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold mt-auto" style={{ color: card.color }}>
              Buka <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-2xl p-5" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <h4 className="font-bold text-sm mb-3" style={{ color: "#1a1d2e" }}>Alur Pengisian</h4>
        <ol className="space-y-2">
          {[
            { step: "1", text: "Buat CPL, PI, dan CPMK di menu Data Kurikulum terlebih dahulu" },
            { step: "2", text: "Buka Mapping CPL → pilih PI mana yang berkontribusi ke setiap CPL" },
            { step: "3", text: "Buka Mapping PI → pilih CPMK yang mendukung setiap PI" },
            { step: "4", text: "Buka Mapping CPMK → tentukan komponen nilai dan bobot masing-masing" },
          ].map((item) => (
            <li key={item.step} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
                style={{ background: "#4361ee" }}>{item.step}</span>
              <span className="text-sm" style={{ color: "#64748b" }}>{item.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
