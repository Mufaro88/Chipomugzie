import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CensusForm } from "@/components/CensusForm";

export default async function NewCensusPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const farms = await prisma.farm.findMany({
    where: { ownerId: user.id },
  });

  if (farms.length === 0) {
    redirect("/dashboard");
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">New Monthly Census</h2>
      <CensusForm farms={farms.map((f) => ({ id: f.id, name: f.name }))} />
    </div>
  );
}
