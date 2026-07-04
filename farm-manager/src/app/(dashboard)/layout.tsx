import { getSession, isPlatformAdmin, hasActivePro } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const pro = hasActivePro(user);
  const planLabel = pro
    ? user.planExpiresAt
      ? `Pro until ${user.planExpiresAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`
      : "Pro"
    : "Free plan · Upgrade";

  return (
    <div className="min-h-screen flex bg-[#FFF8F0]">
      <Sidebar userName={user.name} userRole={user.role} isAdmin={isPlatformAdmin(user)} planLabel={planLabel} />
      <main className="flex-1 p-6 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
