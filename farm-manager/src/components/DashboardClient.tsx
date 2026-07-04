"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import Link from "next/link";

type TrendPoint = {
  label: string;
  beef: number;
  dairy: number;
  goats: number;
  layers: number;
  broilers: number;
  milkYield: number;
  layingPct: number;
};

function herdSentence(name: string, first: number, last: number) {
  if (first === 0 && last === 0) return "";
  if (last > first) return `${name} grew from ${first.toLocaleString()} to ${last.toLocaleString()}. Going up. `;
  if (last < first) return `${name} went down from ${first.toLocaleString()} to ${last.toLocaleString()}. `;
  return `${name} stayed steady at ${last.toLocaleString()}. `;
}

function ChartCaption({ text }: { text: string }) {
  if (!text) return null;
  return (
    <p className="text-sm text-stone-600 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 mt-3 leading-relaxed">
      💬 {text}
    </p>
  );
}

export function DashboardClient({
  trendData,
  farmId,
  historyLimited,
}: {
  trendData: TrendPoint[];
  farmId: string;
  historyLimited?: boolean;
}) {
  const first = trendData[0];
  const last = trendData[trendData.length - 1];
  const span = first && last ? `${first.label} to ${last.label}` : "";

  const livestockCaption = trendData.length < 2 ? "" :
    `From ${span}: ` +
    herdSentence("your beef herd", first.beef, last.beef) +
    herdSentence("dairy", first.dairy, last.dairy) +
    herdSentence("goats", first.goats, last.goats);

  const poultryCaption = trendData.length < 2 ? "" :
    herdSentence("Your layer flock", first.layers, last.layers) +
    (last.broilers === 0 && trendData.some((t) => t.broilers > 0)
      ? "There are no broilers right now. The last batch was sold."
      : herdSentence("broilers", first.broilers, last.broilers));

  const milkMonths = trendData.filter((t) => t.milkYield > 0);
  const bestMilk = milkMonths.length
    ? milkMonths.reduce((a, b) => (b.milkYield > a.milkYield ? b : a), milkMonths[0])
    : null;
  const milkCaption = milkMonths.length < 2 || !bestMilk ? "" :
    `Best month so far: ${bestMilk.label} with ${bestMilk.milkYield.toLocaleString()} litres. ` +
    (last.milkYield >= (trendData[trendData.length - 2]?.milkYield ?? 0)
      ? "Milk is going up. The cows are doing well."
      : "Milk dropped compared to last month. It is worth asking the manager why.");

  const avgLaying = trendData.length
    ? trendData.reduce((sum, t) => sum + t.layingPct, 0) / trendData.length
    : 0;
  const layingCaption = trendData.length < 2 ? "" :
    `The hens are laying at ${last.layingPct}% now, against an average of ${avgLaying.toFixed(0)}% over these months. ` +
    (last.layingPct >= avgLaying
      ? "That is a healthy rate."
      : "Below average. Older birds or feed changes usually explain this.");

  if (trendData.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8 text-center">
        <p className="text-stone-500 mb-4">No census data yet. Enter your first monthly census to see charts.</p>
        <Link
          href="/census/new"
          className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700"
        >
          Enter First Census
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {historyLimited && (
        <Link
          href="/upgrade"
          className="block bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-2xl p-4 text-sm font-medium hover:opacity-95"
        >
          🔒 You are seeing your last 3 months only. Go Pro to unlock your full farm history →
        </Link>
      )}

      {/* Livestock Trend */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4">Livestock Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line isAnimationActive={false} type="monotone" dataKey="beef" stroke="#D55E00" name="Beef" strokeWidth={2} />
            <Line isAnimationActive={false} type="monotone" dataKey="dairy" stroke="#0072B2" name="Dairy" strokeWidth={2} />
            <Line isAnimationActive={false} type="monotone" dataKey="goats" stroke="#B8860B" name="Goats" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
        <ChartCaption text={livestockCaption} />
      </div>

      {/* Poultry Trend */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
        <h3 className="text-lg font-bold text-stone-900 mb-4">Poultry Stock</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar isAnimationActive={false} dataKey="layers" fill="#D55E00" name="Layers" />
            <Bar isAnimationActive={false} dataKey="broilers" fill="#0072B2" name="Broilers" />
          </BarChart>
        </ResponsiveContainer>
        <ChartCaption text={poultryCaption} />
      </div>

      {/* Dairy Production & Laying % */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          <h3 className="text-lg font-bold text-stone-900 mb-4">Milk Yield (Litres)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar isAnimationActive={false} dataKey="milkYield" fill="#0072B2" name="Litres" />
            </BarChart>
          </ResponsiveContainer>
          <ChartCaption text={milkCaption} />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          <h3 className="text-lg font-bold text-stone-900 mb-4">Laying Percentage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line isAnimationActive={false} type="monotone" dataKey="layingPct" stroke="#009E73" name="Laying %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          <ChartCaption text={layingCaption} />
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/census/new"
          className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700"
        >
          Enter New Monthly Census
        </Link>
      </div>
    </div>
  );
}
