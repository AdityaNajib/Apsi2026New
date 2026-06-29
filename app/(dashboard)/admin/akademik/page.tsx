"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpen, Users, PenTool } from "lucide-react";

// Import komponen dari halaman lain (akan kita buat)
import MataKuliahTab from "./tabs/MataKuliahTab";
import ManajemenKelasTab from "./tabs/ManajemenKelasTab";
import InputNilaiTab from "./tabs/InputNilaiTab";

type TabType = "mata-kuliah" | "manajemen-kelas" | "input-nilai";

function AkademikContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  
  const [activeTab, setActiveTab] = useState<TabType>(tabParam && ["mata-kuliah", "manajemen-kelas", "input-nilai"].includes(tabParam) ? tabParam : "mata-kuliah");
  const [sharedSemesterFilter, setSharedSemesterFilter] = useState<number | "all">("all");

  // Update activeTab when URL tab parameter changes
  useEffect(() => {
    if (tabParam && ["mata-kuliah", "manajemen-kelas", "input-nilai"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Function to switch to Mata Kuliah tab with semester filter
  const goToMataKuliahWithSemester = (semester: number) => {
    setSharedSemesterFilter(semester);
    setActiveTab("mata-kuliah");
  };

  const tabs = [
    { key: "mata-kuliah" as TabType, label: "Mata Kuliah", icon: BookOpen },
    { key: "manajemen-kelas" as TabType, label: "Manajemen Kelas", icon: Users },
    { key: "input-nilai" as TabType, label: "Input Nilai", icon: PenTool },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#1a1d2e" }}>Akademik</h2>
        <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
          Kelola mata kuliah, kelas, dan input nilai mahasiswa
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: "#e2e8f0" }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all ${
              activeTab === tab.key ? "border-b-2" : ""
            }`}
            style={{
              color: activeTab === tab.key ? "#4361ee" : "#94a3b8",
              borderColor: activeTab === tab.key ? "#4361ee" : "transparent",
            }}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "mata-kuliah" && (
          <MataKuliahTab 
            sharedSemesterFilter={sharedSemesterFilter}
            setSharedSemesterFilter={setSharedSemesterFilter}
          />
        )}
        {activeTab === "manajemen-kelas" && (
          <ManajemenKelasTab 
            goToMataKuliah={goToMataKuliahWithSemester}
          />
        )}
        {activeTab === "input-nilai" && (
          <InputNilaiTab 
            goToMataKuliah={goToMataKuliahWithSemester}
          />
        )}
      </div>
    </div>
  );
}

export default function AkademikPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#4361ee", borderTopColor: "transparent" }} />
      </div>
    }>
      <AkademikContent />
    </Suspense>
  );
}
