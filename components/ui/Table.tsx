import React from "react";

export function Table({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className="w-full overflow-auto rounded-xl" style={{ border: "1px solid #e9edf4" }}>
      <table className={`w-full text-sm text-left ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead style={{ background: "#f8faff", borderBottom: "1px solid #e9edf4" }}>
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <tr
      className={`transition-colors ${className}`}
      style={{ borderBottom: "1px solid #f1f5f9" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8faff"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-5 py-3.5 font-semibold text-xs uppercase tracking-wider ${className}`}
      style={{ color: "#64748b" }}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-5 py-3.5 ${className}`} style={{ color: "#1a1d2e" }}>
      {children}
    </td>
  );
}
