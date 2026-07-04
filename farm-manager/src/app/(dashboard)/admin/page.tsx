import { getSession, isPlatformAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminClient } from "@/components/AdminClient";

export default async function AdminPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (!isPlatformAdmin(user)) redirect("/dashboard");

  return <AdminClient />;
}
