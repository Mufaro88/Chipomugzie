import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function ReportsPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const farms = await prisma.farm.findMany({
    where: { ownerId: user.id },
    include: {
      monthlyCensus: {
        include: {
          beefSection: true,
          dairySection: true,
          goatSection: true,
          layerSection: true,
          broilerSection: true,
          submittedBy: { select: { name: true } },
        },
        orderBy: [{ year: "desc" }, { month: "desc" }],
      },
    },
  });

  const farm = farms[0];
  if (!farm) redirect("/dashboard");

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Reports — {farm.name}</h2>

      {farm.monthlyCensus.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
          <p className="mb-4">No reports yet.</p>
          <Link href="/census/new" className="text-green-700 font-medium hover:underline">
            Enter your first census
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {farm.monthlyCensus.map((census) => (
            <Link
              key={census.id}
              href={`/census/${census.id}`}
              className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {MONTHS[census.month]} {census.year}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Submitted by {census.submittedBy.name}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  census.status === "submitted"
                    ? "bg-blue-100 text-blue-800"
                    : census.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {census.status}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-5 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Beef</p>
                  <p className="font-bold text-gray-900">{census.beefSection?.closingStock ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Dairy</p>
                  <p className="font-bold text-gray-900">{census.dairySection?.closingStock ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Goats</p>
                  <p className="font-bold text-gray-900">{census.goatSection?.closingStock ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Layers</p>
                  <p className="font-bold text-gray-900">{census.layerSection?.closingStock ?? "—"}</p>
                </div>
                <div>
                  <p className="text-gray-500">Broilers</p>
                  <p className="font-bold text-gray-900">{census.broilerSection?.closingStock ?? "—"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
