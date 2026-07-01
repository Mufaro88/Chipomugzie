import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { PrintButton } from "@/components/PrintButton";

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
      submittedBy: { select: { name: true } },
    },
  });

  if (!census) notFound();

  const lastDay = new Date(census.year, census.month, 0).getDate();
  const reportDate = `${lastDay} ${MONTHS[census.month]} ${census.year}`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h2 className="text-2xl font-bold text-gray-900">Monthly Report</h2>
        <PrintButton />
      </div>

      {/* Printable Report */}
      <div className="bg-white rounded-xl shadow-sm p-8 print:shadow-none print:p-0" id="report">
        <div className="text-center mb-8 border-b pb-6">
          <h1 className="text-2xl font-bold text-gray-900">{census.farm.name}</h1>
          <h2 className="text-lg text-gray-600">Monthly Report — {reportDate}</h2>
        </div>

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
