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
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <p className="text-gray-500 mb-4">No census data yet. Enter your first monthly census to see charts.</p>
        <Link
          href="/census/new"
          className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800"
        >
          Enter First Census
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Livestock Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Livestock Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line isAnimationActive={false} type="monotone" dataKey="beef" stroke="#d97706" name="Beef" strokeWidth={2} />
            <Line isAnimationActive={false} type="monotone" dataKey="dairy" stroke="#3b82f6" name="Dairy" strokeWidth={2} />
            <Line isAnimationActive={false} type="monotone" dataKey="goats" stroke="#ea580c" name="Goats" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Poultry Trend */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Poultry Stock</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar isAnimationActive={false} dataKey="layers" fill="#eab308" name="Layers" />
            <Bar isAnimationActive={false} dataKey="broilers" fill="#ef4444" name="Broilers" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Dairy Production & Laying % */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Milk Yield (Litres)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar isAnimationActive={false} dataKey="milkYield" fill="#06b6d4" name="Litres" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Laying Percentage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line isAnimationActive={false} type="monotone" dataKey="layingPct" stroke="#10b981" name="Laying %" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="text-center">
        <Link
          href="/census/new"
          className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-800"
        >
          Enter New Monthly Census
        </Link>
      </div>
    </div>
  );
}
