import { redirect } from "next/navigation";

// /admin/mata-kuliah is handled inside /admin/akademik?tab=mata-kuliah
export default function MataKuliahRedirect() {
  redirect("/admin/akademik?tab=mata-kuliah");
}
