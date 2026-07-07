import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MoneyBookClient } from "@/components/MoneyBookClient";

export default async function MoneyPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  return <MoneyBookClient />;
}
