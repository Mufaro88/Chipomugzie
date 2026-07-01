import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";

export default async function DashboardPage() {
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
        },
        orderBy: [{ year: "asc" }, { month: "asc" }],
      },
    },
  });

  if (farms.length === 0) {
    return <SetupFarm />;
  }

  const farm = farms[0];
  const censuses = farm.monthlyCensus;
  const latest = censuses[censuses.length - 1];
  const previous = censuses.length > 1 ? censuses[censuses.length - 2] : null;

  const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const trendData = censuses.map((c) => ({
    label: `${monthNames[c.month]} ${c.year}`,
    beef: c.beefSection?.closingStock ?? 0,
    dairy: c.dairySection?.closingStock ?? 0,
    goats: c.goatSection?.closingStock ?? 0,
    layers: c.layerSection?.closingStock ?? 0,
    broilers: c.broilerSection?.closingStock ?? 0,
    milkYield: c.dairySection?.totalMilkYield ?? 0,
    layingPct: c.layerSection?.averageLayingPct ?? 0,
  }));

  function change(current: number | undefined, prev: number | undefined) {
    const c = current ?? 0;
    const p = prev ?? 0;
    if (p === 0) return { value: 0, direction: "same" as const };
    const pct = Math.round(((c - p) / p) * 100);
    return { value: Math.abs(pct), direction: pct > 0 ? "up" as const : pct < 0 ? "down" as const : "same" as const };
  }

  const summaryCards = [
    {
      title: "Beef Cattle",
      value: latest?.beefSection?.closingStock ?? 0,
      change: change(latest?.beefSection?.closingStock, previous?.beefSection?.closingStock),
      color: "bg-amber-500",
    },
    {
      title: "Dairy Cattle",
      value: latest?.dairySection?.closingStock ?? 0,
      change: change(latest?.dairySection?.closingStock, previous?.dairySection?.closingStock),
      color: "bg-blue-500",
    },
    {
      title: "Goats",
      value: latest?.goatSection?.closingStock ?? 0,
      change: change(latest?.goatSection?.closingStock, previous?.goatSection?.closingStock),
      color: "bg-orange-500",
    },
    {
      title: "Layers",
      value: latest?.layerSection?.closingStock ?? 0,
      change: change(latest?.layerSection?.closingStock, previous?.layerSection?.closingStock),
      color: "bg-yellow-500",
    },
    {
      title: "Broilers",
      value: latest?.broilerSection?.closingStock ?? 0,
      change: change(latest?.broilerSection?.closingStock, previous?.broilerSection?.closingStock),
      color: "bg-red-500",
    },
    {
      title: "Milk Yield (L)",
      value: latest?.dairySection?.totalMilkYield ?? 0,
      change: change(latest?.dairySection?.totalMilkYield, previous?.dairySection?.totalMilkYield),
      color: "bg-cyan-500",
    },
    {
      title: "Laying %",
      value: latest?.layerSection?.averageLayingPct ?? 0,
      change: change(latest?.layerSection?.averageLayingPct, previous?.layerSection?.averageLayingPct),
      color: "bg-emerald-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{farm.name}</h2>
        <p className="text-gray-500">
          {latest
            ? `Latest census: ${monthNames[latest.month]} ${latest.year}`
            : "No census data yet"}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div key={card.title} className="bg-white rounded-xl shadow-sm p-4">
            <div className={`w-2 h-2 rounded-full ${card.color} mb-2`} />
            <p className="text-xs text-gray-500 uppercase tracking-wide">{card.title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {typeof card.value === "number" && card.title === "Laying %"
                ? `${card.value}%`
                : card.value.toLocaleString()}
            </p>
            {card.change.direction !== "same" && (
              <p className={`text-xs mt-1 ${card.change.direction === "up" ? "text-green-600" : "text-red-600"}`}>
                {card.change.direction === "up" ? "▲" : "▼"} {card.change.value}%
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <DashboardClient trendData={trendData} farmId={farm.id} />
    </div>
  );
}

function SetupFarm() {
  return (
    <div className="max-w-lg mx-auto mt-20">
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">&#x1F33E;</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Chipomugzie</h2>
        <p className="text-gray-500 mb-6">
          Let&apos;s set up your first farm to get started.
        </p>
        <SetupFarmForm />
      </div>
    </div>
  );
}

function SetupFarmForm() {
  return <SetupFarmFormClient />;
}

import { SetupFarmFormClient } from "@/components/SetupFarmForm";
