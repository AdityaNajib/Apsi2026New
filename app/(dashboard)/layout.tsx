import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("role");
  const nameCookie = cookieStore.get("name");
  const userIdCookie = cookieStore.get("userId");

  if (!roleCookie?.value) {
    redirect("/login");
  }

  const role = roleCookie.value;
  const name = nameCookie?.value || "User";
  const userId = userIdCookie?.value || "";

  // For dosen: fetch their assigned mata kuliah for dynamic sidebar
  let dosenMataKuliah: { kelasId: string; nama: string; kode: string; namaKelas?: string }[] = [];
  if (role === "DOSEN" && userId) {
    try {
      const dosen = await prisma.dosen.findUnique({
        where: { userId },
        include: {
          pengampu: {
            include: {
              kelas: {
                include: { mataKuliah: true },
              },
            },
          },
        },
      });
      if (dosen) {
        dosenMataKuliah = dosen.pengampu.map((p) => ({
          kelasId: p.kelas.id,
          nama: p.kelas.mataKuliah.nama,
          kode: p.kelas.mataKuliah.kode,
          namaKelas: p.kelas.nama,
        }));
      }
    } catch {
      // silently fail, sidebar will show generic menu
    }
  }

  return (
    <DashboardShell role={role} name={name} dosenMataKuliah={dosenMataKuliah}>
      {children}
    </DashboardShell>
  );
}
