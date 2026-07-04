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

export function DashboardClient({
  trendData,
  farmId,
}: {
  trendData: TrendPoint[];
  farmId: string;
}) {
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
            <Line isAnimationActive={false} type="monotone" dataKey="beef" stroke="#c2410c" name="Beef" strokeWidth={2} />
            <Line isAnimationActive={false} type="monotone" dataKey="dairy" stroke="#0d9488" name="Dairy" strokeWidth={2} />
            <Line isAnimationActive={false} type="monotone" dataKey="goats" stroke="#b45309" name="Goats" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
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
            <Bar isAnimationActive={false} dataKey="layers" fill="#c2410c" name="Layers" />
            <Bar isAnimationActive={false} dataKey="broilers" fill="#0d9488" name="Broilers" />
          </BarChart>
        </ResponsiveContainer>
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
              <Bar isAnimationActive={false} dataKey="milkYield" fill="#c2410c" name="Litres" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          <h3 className="text-lg font-bold text-stone-900 mb-4">Laying Percentage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line isAnimationActive={false} type="monotone" dataKey="layingPct" stroke="#c2410c" name="Laying %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
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
