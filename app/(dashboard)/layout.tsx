import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("role");
  const nameCookie = cookieStore.get("name");

  if (!roleCookie?.value) {
    redirect("/login");
  }

  const role = roleCookie.value;
  const name = nameCookie?.value || "User";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#eef2f7" }}>
      <Sidebar role={role} name={name} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar role={role} name={name} />
        <main
          className="flex-1 overflow-y-auto p-6 md:p-8"
          style={{ background: "#eef2f7" }}
        >
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
