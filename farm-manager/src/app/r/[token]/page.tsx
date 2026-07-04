import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Public read-only report, reachable by anyone with the share link.
export default async function SharedReportPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const census = await prisma.monthlyCensus.findUnique({
    where: { shareToken: token },
    include: {
      farm: { select: { name: true, location: true } },
      beefSection: true,
      dairySection: true,
      goatSection: true,
      layerSection: true,
      broilerSection: true,
      expenses: true,
      submittedBy: { select: { name: true } },
    },
  });
  if (!census) notFound();

  const stats: { icon: string; label: string; value: string }[] = [];
  if (census.beefSection) stats.push({ icon: "🐂", label: "Beef Cattle", value: census.beefSection.closingStock.toLocaleString() });
  if (census.dairySection) stats.push({ icon: "🐄", label: "Dairy Cattle", value: census.dairySection.closingStock.toLocaleString() });
  if (census.goatSection) stats.push({ icon: "🐐", label: "Goats", value: census.goatSection.closingStock.toLocaleString() });
  if (census.layerSection) stats.push({ icon: "🐔", label: "Layers", value: census.layerSection.closingStock.toLocaleString() });
  if (census.broilerSection) stats.push({ icon: "🐥", label: "Broilers", value: census.broilerSection.closingStock.toLocaleString() });
  if (census.dairySection?.totalMilkYield) stats.push({ icon: "🥛", label: "Milk (Litres)", value: census.dairySection.totalMilkYield.toLocaleString() });
  if (census.layerSection?.averageLayingPct) stats.push({ icon: "🥚", label: "Laying %", value: `${census.layerSection.averageLayingPct}%` });

  const totalSpent = census.expenses.reduce((sum, e) => sum + e.amountUsd, 0);

  return (
    <div className="min-h-screen bg-[#FFF8F0] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8">
          <div className="text-center border-b border-stone-100 pb-6 mb-6">
            <p className="text-3xl mb-2">🌅</p>
            <h1 className="text-2xl font-bold text-stone-900">{census.farm.name}</h1>
            <p className="text-stone-500">
              Monthly Report, {MONTHS[census.month]} {census.year}
            </p>
            {census.farm.location && <p className="text-stone-400 text-sm mt-1">{census.farm.location}</p>}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
                <div className="text-2xl">{stat.icon}</div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mt-1">{stat.label}</p>
                <p className="text-xl font-bold text-stone-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {totalSpent > 0 && (
            <p className="text-sm text-stone-600 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 mt-6">
              💵 Money spent this month: <strong>${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </p>
          )}

          <p className="text-xs text-stone-400 mt-6 text-center">
            Compiled by {census.submittedBy.name}
          </p>
        </div>

        <div className="text-center mt-8">
          <p className="text-stone-600 mb-3">
            Made with <strong>The Farmer&apos;s Pocket Book</strong> 🌅
          </p>
          <Link
            href="/signup"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
          >
            Keep your own farm records. Start free
          </Link>
        </div>
      </div>
    </div>
  );
}
