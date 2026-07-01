import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function FarmsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const farms = await prisma.farm.findMany({
    where: { ownerId: user.id },
    include: {
      _count: { select: { monthlyCensus: true } },
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Farms</h2>

      {farms.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          No farms yet. Go to the Dashboard to create your first farm.
        </div>
      ) : (
        <div className="grid gap-4">
          {farms.map((farm) => (
            <div key={farm.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{farm.name}</h3>
                  {farm.location && (
                    <p className="text-gray-500 text-sm mt-1">{farm.location}</p>
                  )}
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium capitalize">
                  {farm.tier}
                </span>
              </div>
              <div className="mt-4 flex gap-6 text-sm text-gray-500">
                <span>{farm._count.monthlyCensus} census reports</span>
                <span>Created {farm.createdAt.toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
