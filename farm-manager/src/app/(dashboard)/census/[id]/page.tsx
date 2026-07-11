import { getSession, hasActivePro, isPlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";
import { WhatsAppShareButton, ShareLinkButton } from "@/components/ShareButtons";
import { ReportCharts } from "@/components/ReportCharts";

const MONTHS = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function CensusDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSession();
  if (!user) redirect("/login");

  const { id } = await params;

  const census = await prisma.monthlyCensus.findUnique({
    where: { id },
    include: {
      farm: true,
      beefSection: true,
      dairySection: true,
      goatSection: true,
      layerSection: true,
      broilerSection: true,
      cropActivities: true,
      workshopItems: true,
      expenses: true,
      submittedBy: { select: { name: true } },
    },
  });

  if (!census) notFound();

  const owner = await prisma.user.findUnique({ where: { id: census.farm.ownerId } });
  if (!hasActivePro(owner) && !isPlatformAdmin(user)) {
    const newest = await prisma.monthlyCensus.findMany({
      where: { farmId: census.farmId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 3,
      select: { id: true },
    });
    if (!newest.some((c) => c.id === census.id)) {
      return (
        <div className="max-w-lg mx-auto mt-20 bg-white rounded-2xl shadow-sm border border-orange-100 p-8 text-center">
          <p className="text-4xl mb-3">🔒</p>
          <h2 className="text-xl font-bold text-stone-900 mb-2">This report is in your locked history</h2>
          <p className="text-stone-600 mb-6">
            The Free plan keeps your last 3 monthly reports open. Go Pro to unlock
            every report you have ever entered. Your data is safe and waiting.
          </p>
          <a href="/upgrade" className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700">
            Go Pro to unlock
          </a>
        </div>
      );
    }
  }

  const lastDay = new Date(census.year, census.month, 0).getDate();
  const reportDate = `${lastDay} ${MONTHS[census.month]} ${census.year}`;

  // Money for the same month, if the Money Book has it.
  const money = await prisma.moneyMonth.findMany({
    where: { farmId: census.farmId, month: census.month, year: census.year },
  });
  const moneyIn = money.map((m) => ({ name: m.enterprise, value: Math.round(m.salesUsd) }));
  const moneyOut = money.map((m) => ({ name: m.enterprise, value: Math.round(m.costsUsd) }));
  const totalIn = money.reduce((sum, m) => sum + m.salesUsd, 0);
  const totalOut = money.reduce((sum, m) => sum + m.costsUsd, 0);
  const profit = totalIn - totalOut;
  const bestEarner = [...money].sort((a, b) => b.salesUsd - a.salesUsd)[0];
  const bigCost = [...money].sort((a, b) => b.costsUsd - a.costsUsd)[0];

  // A written summary in plain words, like a person reporting to the owner.
  const totalDeaths =
    (census.beefSection?.deaths ?? 0) + (census.dairySection?.deaths ?? 0) +
    (census.goatSection?.deaths ?? 0) + (census.layerSection?.mortalities ?? 0) +
    (census.broilerSection?.deaths ?? 0);
  const herdParts: string[] = [];
  if (census.beefSection) herdParts.push(`${census.beefSection.closingStock} beef cattle`);
  if (census.dairySection) herdParts.push(`${census.dairySection.closingStock} dairy cattle`);
  if (census.goatSection) herdParts.push(`${census.goatSection.closingStock} goats`);
  if (census.layerSection) herdParts.push(`${census.layerSection.closingStock.toLocaleString()} layers`);
  if (census.broilerSection?.closingStock) herdParts.push(`${census.broilerSection.closingStock.toLocaleString()} broilers`);

  let summary = `At the end of ${MONTHS[census.month]} ${census.year}, ${census.farm.name} was keeping ${herdParts.join(", ") || "no recorded livestock"}. `;
  summary += totalDeaths > 0
    ? `A total of ${totalDeaths} animals and birds died during the month. `
    : `No deaths were recorded this month. `;
  if (census.dairySection?.totalMilkYield) summary += `The dairy produced ${census.dairySection.totalMilkYield.toLocaleString()} litres of milk. `;
  if (census.layerSection?.cratesCollected) summary += `The layers gave ${census.layerSection.cratesCollected.toLocaleString()} crates of eggs, laying at ${census.layerSection.averageLayingPct}%. `;
  if (census.cropActivities.length) summary += `In the fields: ${census.cropActivities.map((c) => `${c.cropName} (${c.activity})`).join("; ")}. `;
  if (money.length) {
    summary += `On the money side, the farm GAINED $${Math.round(totalIn).toLocaleString()} and SPENT $${Math.round(totalOut).toLocaleString()}, `;
    summary += profit >= 0
      ? `making a PROFIT of $${Math.round(profit).toLocaleString()} for the month. `
      : `making a LOSS of $${Math.round(Math.abs(profit)).toLocaleString()} for the month. `;
    if (bestEarner && bestEarner.salesUsd > 0) summary += `The biggest money maker was ${bestEarner.enterprise}. `;
    if (bigCost && bigCost.costsUsd > 0) summary += `The biggest cost was ${bigCost.enterprise}. `;
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-stone-900">Monthly Report</h2>
        <div className="flex gap-2">
          <WhatsAppShareButton
            summary={[
              `*${census.farm.name}: Monthly Report, ${reportDate}*`,
              census.beefSection ? `🐂 Beef cattle: ${census.beefSection.closingStock}` : "",
              census.dairySection ? `🐄 Dairy cattle: ${census.dairySection.closingStock}` : "",
              census.goatSection ? `🐐 Goats: ${census.goatSection.closingStock}` : "",
              census.layerSection ? `🐔 Layers: ${census.layerSection.closingStock} (laying ${census.layerSection.averageLayingPct}%)` : "",
              census.broilerSection ? `🐥 Broilers: ${census.broilerSection.closingStock}` : "",
              census.dairySection?.totalMilkYield ? `🥛 Milk this month: ${census.dairySection.totalMilkYield.toLocaleString()} litres` : "",
            ].filter(Boolean).join("\n")}
          />
          <ShareLinkButton censusId={census.id} />
          <PrintButton />
        </div>
      </div>

      {/* Printable Report */}
      <div className="bg-white rounded-xl shadow-sm p-8 print:shadow-none print:p-0" id="report">
        <div className="text-center mb-8 border-b pb-6">
          <h1 className="text-2xl font-bold text-gray-900">{census.farm.name}</h1>
          <h2 className="text-lg text-gray-600">Monthly Report, {reportDate}</h2>
        </div>

        {/* Written summary */}
        <div className="mb-8 bg-orange-50 border border-orange-100 rounded-xl p-5">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Monthly Summary</h3>
          <p className="text-sm text-gray-800 leading-relaxed">{summary}</p>
        </div>

        {/* Differences flagged at submission */}
        {census.flags && (
          <div className="mb-8 bg-amber-50 border border-amber-300 rounded-xl p-5">
            <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-2">⚠️ Differences to review</h3>
            <p className="text-sm text-amber-900">{census.flags}</p>
            <p className="text-sm text-gray-800 mt-2">
              <strong>Explanation from {census.submittedBy.name}:</strong>{" "}
              {census.flagNote || "No explanation was written."}
            </p>
          </div>
        )}

        {/* Money charts */}
        {money.length > 0 && (
          <div className="mb-8">
            <ReportCharts moneyIn={moneyIn} moneyOut={moneyOut} />
          </div>
        )}

        {/* Beef Section */}
        {census.beefSection && (
          <ReportSection title="Beef Section" color="border-amber-500">
            <StockTable
              rows={[
                ["Opening Stock", census.beefSection.openingStock],
                ["Births", census.beefSection.births],
                ["Moved In", census.beefSection.movedIn],
                ["Moved Out", census.beefSection.movedOut],
                ["Sold", census.beefSection.sold],
                ["Slaughtered", census.beefSection.slaughtered],
                ["Deaths", census.beefSection.deaths],
              ]}
              closing={census.beefSection.closingStock}
            />
            <ClassTable
              rows={[
                ["Bulls", census.beefSection.bulls],
                ["Juvenile Bulls", census.beefSection.juvenileBulls],
                ["Cows", census.beefSection.cows],
                ["Bulling Heifers", census.beefSection.bullingHeifers],
                ["Weaner Heifers", census.beefSection.weanerHeifers],
                ["Feeder Steers", census.beefSection.feederSteers],
                ["Weaner Steers", census.beefSection.weanerSteers],
                ["Weaner Male Calves", census.beefSection.weanerMaleCalves],
                ["Calf Steers", census.beefSection.calfSteers],
                ["Male Calves", census.beefSection.maleCaves],
                ["Female Calves", census.beefSection.femaleCalves],
              ]}
              total={census.beefSection.closingStock}
            />
            {census.beefSection.notes && <Notes text={census.beefSection.notes} />}
          </ReportSection>
        )}

        {/* Dairy Section */}
        {census.dairySection && (
          <ReportSection title="Dairy Section" color="border-blue-500">
            <StockTable
              rows={[
                ["Opening Stock", census.dairySection.openingStock],
                ["Births", census.dairySection.births],
                ["Moved In", census.dairySection.movedIn],
                ["Moved Out", census.dairySection.movedOut],
                ["Sold", census.dairySection.sold],
                ["Slaughtered", census.dairySection.slaughtered],
                ["Deaths", census.dairySection.deaths],
              ]}
              closing={census.dairySection.closingStock}
            />
            <ClassTable
              rows={[
                ["Bulls", census.dairySection.bulls],
                ["Juvenile Bulls", census.dairySection.juvenileBulls],
                ["Milking Cows", census.dairySection.milkingCows],
                ["Dry Cows", census.dairySection.dryCows],
                ["Bulling Heifers", census.dairySection.bullingHeifers],
                ["Weaner Heifers", census.dairySection.weanerHeifers],
                ["Feeder Steers", census.dairySection.feederSteers],
                ["Weaner Steers", census.dairySection.weanerSteers],
                ["Weaner Male Calves", census.dairySection.weanerMaleCalves],
                ["Calf Steers", census.dairySection.calfSteers],
                ["Male Calves", census.dairySection.maleCalves],
                ["Female Calves", census.dairySection.femaleCalves],
              ]}
              total={census.dairySection.closingStock}
            />
            {census.dairySection.totalMilkYield > 0 && (
              <p className="text-sm text-gray-700 mt-2">
                Total milk yield: <strong>{census.dairySection.totalMilkYield.toLocaleString()} litres</strong>
              </p>
            )}
            {census.dairySection.feedConsumedBags > 0 && (
              <p className="text-sm text-gray-700">
                Feed consumed: <strong>{census.dairySection.feedConsumedBags} x {census.dairySection.feedWeightKg}kg bags</strong>
              </p>
            )}
            {census.dairySection.notes && <Notes text={census.dairySection.notes} />}
          </ReportSection>
        )}

        {/* Goats Section */}
        {census.goatSection && (
          <ReportSection title="Goats Section" color="border-orange-500">
            <StockTable
              rows={[
                ["Opening Stock", census.goatSection.openingStock],
                ["Births", census.goatSection.births],
                ["Moved In", census.goatSection.movedIn],
                ["Sold", census.goatSection.sold],
                ["Slaughtered", census.goatSection.slaughtered],
                ["Deaths", census.goatSection.deaths],
                ["Moved Out", census.goatSection.movedOut],
              ]}
              closing={census.goatSection.closingStock}
            />
            <ClassTable
              rows={[
                ["Bucks", census.goatSection.bucks],
                ["Juvenile Bucks", census.goatSection.juvenileBucks],
                ["Does", census.goatSection.does],
                ["Maiden Does", census.goatSection.maidenDoes],
                ["Castrated Weaners", census.goatSection.castratedWeaners],
                ["Castrated Male Kids", census.goatSection.castratedMaleKids],
                ["Female Kids", census.goatSection.femaleKids],
                ["Male Kids", census.goatSection.maleKids],
              ]}
              total={census.goatSection.closingStock}
            />
            {census.goatSection.notes && <Notes text={census.goatSection.notes} />}
          </ReportSection>
        )}

        {/* Layers Section */}
        {census.layerSection && (
          <ReportSection title="Layers Section" color="border-yellow-500">
            <StockTable
              rows={[
                ["Opening Stock", census.layerSection.openingStock],
                ["Mortalities", census.layerSection.mortalities],
                ["Moved In", census.layerSection.movedIn],
              ]}
              closing={census.layerSection.closingStock}
            />
            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <p>Total crates collected: <strong>{census.layerSection.cratesCollected.toLocaleString()}</strong></p>
              {census.layerSection.eggTraysDelivered > 0 && (
                <p>Egg trays delivered: <strong>{census.layerSection.eggTraysDelivered.toLocaleString()}</strong></p>
              )}
              <p>Breakages (crates): <strong>{census.layerSection.breakagesCrates}</strong></p>
              <p>Binned (crates): <strong>{census.layerSection.binnedCrates}</strong></p>
              <p>Average Laying %: <strong>{census.layerSection.averageLayingPct}%</strong></p>
              {census.layerSection.feedConsumedBags > 0 && (
                <p>Feed consumed: <strong>{census.layerSection.feedConsumedBags} x {census.layerSection.feedWeightKg}kg bags</strong></p>
              )}
            </div>
            {census.layerSection.notes && <Notes text={census.layerSection.notes} />}
          </ReportSection>
        )}

        {/* Broiler Section */}
        {census.broilerSection && (
          <ReportSection title="Broiler Section" color="border-red-500">
            <StockTable
              rows={[
                ["Opening Stock", census.broilerSection.openingStock],
                ["Received", census.broilerSection.received],
                ["Sold", census.broilerSection.sold],
                ["Deaths", census.broilerSection.deaths],
              ]}
              closing={census.broilerSection.closingStock}
            />
            {(census.broilerSection.starterBags > 0 || census.broilerSection.growerBags > 0 || census.broilerSection.finisherBags > 0) && (
              <div className="mt-4 space-y-1 text-sm text-gray-700">
                <p className="font-medium">Feed Consumed:</p>
                {census.broilerSection.starterBags > 0 && <p>Starter: {census.broilerSection.starterBags} x {census.broilerSection.feedWeightKg}kg</p>}
                {census.broilerSection.growerBags > 0 && <p>Grower: {census.broilerSection.growerBags} x {census.broilerSection.feedWeightKg}kg</p>}
                {census.broilerSection.finisherBags > 0 && <p>Finisher: {census.broilerSection.finisherBags} x {census.broilerSection.feedWeightKg}kg</p>}
              </div>
            )}
            {census.broilerSection.notes && <Notes text={census.broilerSection.notes} />}
          </ReportSection>
        )}

        {/* Crops Section */}
        {census.cropActivities.length > 0 && (
          <ReportSection title="Crops Section" color="border-teal-600">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-1">Crop</th>
                  <th className="py-1">Hectares</th>
                  <th className="py-1">Activity</th>
                </tr>
              </thead>
              <tbody>
                {census.cropActivities.map((crop) => (
                  <tr key={crop.id} className="border-b border-gray-50">
                    <td className="py-1 font-medium text-gray-900">{crop.cropName}</td>
                    <td className="py-1 text-gray-700">{crop.hectares ?? ", "}</td>
                    <td className="py-1 text-gray-700">{crop.activity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ReportSection>
        )}

        {/* Money Spent Section */}
        {census.expenses.length > 0 && (
          <ReportSection title="Money Spent This Month" color="border-stone-500">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-1">Category</th>
                  <th className="py-1">Detail</th>
                  <th className="py-1 text-right">US$</th>
                </tr>
              </thead>
              <tbody>
                {census.expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-50">
                    <td className="py-1 text-gray-700 capitalize">{expense.category}</td>
                    <td className="py-1 text-gray-700">{expense.description}</td>
                    <td className="py-1 text-right text-gray-900">{expense.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={2} className="py-2 font-bold text-gray-900">Total spent</td>
                  <td className="py-2 text-right font-bold text-gray-900">
                    ${census.expenses.reduce((sum, e) => sum + e.amountUsd, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </ReportSection>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t text-sm text-gray-500">
          <p>Compiled by: {census.submittedBy.name}</p>
          <p>Submitted: {census.createdAt.toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}

function ReportSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className={`mb-8 border-l-4 ${color} pl-4`}>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function StockTable({ rows, closing }: { rows: [string, number][]; closing: number }) {
  return (
    <table className="w-full text-sm">
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label} className="border-b border-gray-100">
            <td className="py-1 text-gray-600">{label}</td>
            <td className="py-1 text-right font-medium text-gray-900 w-20">{value.toString().padStart(2, "0")}</td>
          </tr>
        ))}
        <tr className="bg-gray-50 font-bold">
          <td className="py-2 text-gray-900">Closing Stock</td>
          <td className="py-2 text-right text-gray-900 w-20">{closing}</td>
        </tr>
      </tbody>
    </table>
  );
}

function ClassTable({ rows, total }: { rows: [string, number][]; total: number }) {
  return (
    <div className="mt-4">
      <p className="font-medium text-gray-900 text-sm mb-1">Animal Classes</p>
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-b border-gray-100">
              <td className="py-1 text-gray-600">{label}</td>
              <td className="py-1 text-right font-medium text-gray-900 w-20">{value.toString().padStart(2, "0")}</td>
            </tr>
          ))}
          <tr className="bg-gray-50 font-bold">
            <td className="py-2 text-gray-900">Total</td>
            <td className="py-2 text-right text-gray-900 w-20">{total}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Notes({ text }: { text: string }) {
  return (
    <div className="mt-3 bg-yellow-50 p-3 rounded text-sm text-gray-700">
      <strong>NB:</strong> {text}
    </div>
  );
}
