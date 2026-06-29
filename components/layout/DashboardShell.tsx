"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface DashboardShellProps {
  role: string;
  name: string;
  dosenMataKuliah?: { kelasId: string; nama: string; kode: string; namaKelas?: string }[];
  children: React.ReactNode;
}

export default function DashboardShell({ role, name, dosenMataKuliah = [], children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#eef2f7" }}>
      <Sidebar
        role={role}
        name={name}
        dosenMataKuliah={dosenMataKuliah}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          role={role}
          name={name}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
        <main
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8"
          style={{ background: "#eef2f7" }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
