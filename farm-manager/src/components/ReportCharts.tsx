"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

// Colorblind-safe slice colors, validated; anything past six folds into Other.
const SLICE_COLORS = ["#0072B2", "#D55E00", "#009E73", "#B8860B", "#CC79A7", "#56B4E9"];
const OTHER_COLOR = "#8a8a8a";

export type Slice = { name: string; value: number };

function foldSlices(slices: Slice[]): Slice[] {
  const sorted = [...slices].filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
  if (sorted.length <= 6) return sorted;
  const top = sorted.slice(0, 5);
  const other = sorted.slice(5).reduce((sum, s) => sum + s.value, 0);
  return [...top, { name: "Other", value: Math.round(other) }];
}

function MoneyPie({ title, slices }: { title: string; slices: Slice[] }) {
  const data = foldSlices(slices);
  if (data.length === 0) return null;
  return (
    <div>
      <h4 className="text-sm font-bold text-gray-900 text-center mb-1">{title}</h4>
      <ResponsiveContainer width="100%" height={230}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            isAnimationActive={false}
            outerRadius={70}
            label={({ name, value }) => `${name} $${Number(value).toLocaleString()}`}
            labelLine={{ stroke: "#bbb" }}
          >
            {data.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={entry.name === "Other" ? OTHER_COLOR : SLICE_COLORS[i % SLICE_COLORS.length]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ReportCharts({
  moneyIn,
  moneyOut,
}: {
  moneyIn: Slice[];
  moneyOut: Slice[];
}) {
  const hasIn = moneyIn.some((s) => s.value > 0);
  const hasOut = moneyOut.some((s) => s.value > 0);
  if (!hasIn && !hasOut) return null;
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {hasIn && <MoneyPie title="Where the money CAME FROM" slices={moneyIn} />}
      {hasOut && <MoneyPie title="Where the money WENT" slices={moneyOut} />}
    </div>
  );
}
