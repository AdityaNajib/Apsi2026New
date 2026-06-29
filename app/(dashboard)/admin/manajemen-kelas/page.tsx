import { redirect } from "next/navigation";

// /admin/manajemen-kelas is handled inside /admin/akademik?tab=manajemen-kelas
export default function ManajemenKelasRedirect() {
  redirect("/admin/akademik?tab=manajemen-kelas");
}
