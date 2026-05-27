import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SICAL-TI UNS",
  description: "Sistem Informasi Perhitungan Capaian Pembelajaran Lulusan Teknik Industri UNS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased text-foreground bg-background">
        {children}
      </body>
    </html>
  );
}
