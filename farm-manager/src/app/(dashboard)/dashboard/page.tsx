import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { DashboardClient } from "@/components/DashboardClient";
import { SetupFarmFormClient } from "@/components/SetupFarmForm";

export default async function DashboardPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  const farms = await prisma.farm.findMany({
    where: {
      OR: [
        { ownerId: user.id },
        { farmAccess: { some: { userId: user.id } } },
      ],
    },
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

  const firstName = user.name.split(" ")[0];

  if (farms.length === 0) {
    return <SetupFarm firstName={firstName} />;
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
      icon: "🐂",
      value: latest?.beefSection?.closingStock ?? 0,
      change: change(latest?.beefSection?.closingStock, previous?.beefSection?.closingStock),
    },
    {
      title: "Dairy Cattle",
      icon: "🐄",
      value: latest?.dairySection?.closingStock ?? 0,
      change: change(latest?.dairySection?.closingStock, previous?.dairySection?.closingStock),
    },
    {
      title: "Goats",
      icon: "🐐",
      value: latest?.goatSection?.closingStock ?? 0,
      change: change(latest?.goatSection?.closingStock, previous?.goatSection?.closingStock),
    },
    {
      title: "Layers",
      icon: "🐔",
      value: latest?.layerSection?.closingStock ?? 0,
      change: change(latest?.layerSection?.closingStock, previous?.layerSection?.closingStock),
    },
    {
      title: "Broilers",
      icon: "🐥",
      value: latest?.broilerSection?.closingStock ?? 0,
      change: change(latest?.broilerSection?.closingStock, previous?.broilerSection?.closingStock),
    },
    {
      title: "Milk (Litres)",
      icon: "🥛",
      value: latest?.dairySection?.totalMilkYield ?? 0,
      change: change(latest?.dairySection?.totalMilkYield, previous?.dairySection?.totalMilkYield),
    },
    {
      title: "Laying %",
      icon: "🥚",
      value: latest?.layerSection?.averageLayingPct ?? 0,
      change: change(latest?.layerSection?.averageLayingPct, previous?.layerSection?.averageLayingPct),
    },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900">
          {greeting}, {firstName} 👋
        </h2>
        <p className="text-stone-500">
          {latest
            ? `${farm.name}. Latest census: ${monthNames[latest.month]} ${latest.year}`
            : `${farm.name}. No census yet.`}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4"
          >
            <div className="text-2xl mb-1">{card.icon}</div>
            <p className="text-xs text-stone-500 uppercase tracking-wide">{card.title}</p>
            <p className="text-2xl font-bold text-stone-900 mt-1">
              {typeof card.value === "number" && card.title === "Laying %"
                ? `${card.value}%`
                : card.value.toLocaleString()}
            </p>
            {card.change.direction !== "same" && (
              <p className={`text-xs mt-1 font-medium ${card.change.direction === "up" ? "text-teal-700" : "text-red-700"}`}>
                {card.change.direction === "up" ? "▲" : "▼"} {card.change.value}% vs last month
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

function SetupFarm({ firstName }: { firstName: string }) {
  return (
    <div className="max-w-lg mx-auto mt-20">
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 text-center">
        <div className="text-5xl mb-4">🌅</div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">
          Welcome, {firstName}!
        </h2>
        <p className="text-stone-500 mb-6">
          Let&apos;s open your Pocket Book. Set up your first farm.
        </p>
        <SetupFarmFormClient />
      </div>
    </div>
  );
}
