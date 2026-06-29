import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SICAL-TI UNS",
  description: "Sistem Informasi Perhitungan Capaian Pembelajaran Lulusan Teknik Industri UNS",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased text-foreground bg-background min-h-screen">
        {children}
        {/* Remove Next.js dev overlay on all devices */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            function removeOverlay() {
              var portals = document.querySelectorAll('nextjs-portal');
              portals.forEach(function(el) { el.remove(); });
            }
            removeOverlay();
            var observer = new MutationObserver(removeOverlay);
            observer.observe(document.body, { childList: true, subtree: true });
          })();
        ` }} />
      </body>
    </html>
  );
}
