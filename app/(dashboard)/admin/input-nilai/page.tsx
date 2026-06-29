import { redirect } from "next/navigation";

// /admin/input-nilai is handled inside /admin/akademik?tab=input-nilai
export default function InputNilaiRedirect() {
  redirect("/admin/akademik?tab=input-nilai");
}
