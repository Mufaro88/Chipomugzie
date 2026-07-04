import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeamClient } from "@/components/TeamClient";

export default async function TeamPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  return <TeamClient />;
}
