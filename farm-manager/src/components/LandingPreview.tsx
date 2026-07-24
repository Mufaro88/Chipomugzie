"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Colorblind-safe palette, same one the real app uses.
const LINE_COLORS = { herd: "#0072B2", milk: "#D55E00" };
const PIE_COLORS = ["#0072B2", "#D55E00", "#009E73", "#B8860B"];

const trend = [
  { month: "Jan", herd: 380, milk: 1200 },
  { month: "Feb", herd: 395, milk: 1320 },
  { month: "Mar", herd: 410, milk: 1450 },
  { month: "Apr", herd: 402, milk: 1390 },
  { month: "May", herd: 421, milk: 1510 },
  { month: "Jun", herd: 435, milk: 1600 },
];

const moneyOut = [
  { name: "Feed", value: 1200 },
  { name: "Wages", value: 800 },
  { name: "Medicine", value: 300 },
  { name: "Fuel", value: 250 },
];

const stats = [
  { icon: "🐂", label: "Beef Cattle", value: "435", up: "▲ 3%" },
  { icon: "🐄", label: "Dairy Cattle", value: "88", up: "▲ 6%" },
  { icon: "🥛", label: "Milk (L)", value: "1,600", up: "▲ 6%" },
  { icon: "🥚", label: "Laying %", value: "74%", up: "▲ 2%" },
];

export function LandingPreview() {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-orange-100 p-5 sm:p-8 max-w-4xl mx-auto">
      <p className="text-xs text-stone-400 uppercase tracking-wide mb-4">
        Ruzambo Farm · June 2026 (sample)
      </p>

      {/* Stat cards, exactly like the real dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-orange-50 rounded-2xl p-3 border border-orange-100">
            <div className="text-xl mb-1">{s.icon}</div>
            <p className="text-[10px] text-stone-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-xl font-bold text-stone-900 mt-1">{s.value}</p>
            <p className="text-[10px] text-teal-700 font-medium mt-0.5">{s.up} vs last month</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Trend chart */}
        <div>
          <h4 className="text-sm font-bold text-stone-900 mb-2">Herd size &amp; milk, month by month</h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e6da" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#a8a29e" />
              <YAxis tick={{ fontSize: 11 }} stroke="#a8a29e" />
              <Tooltip />
              <Line type="monotone" dataKey="herd" name="Herd" stroke={LINE_COLORS.herd} strokeWidth={2.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="milk" name="Milk (L)" stroke={LINE_COLORS.milk} strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-stone-500 mt-1">
            The blue line is your herd size, the orange line is milk. Both climbing means a good few months.
          </p>
        </div>

        {/* Money pie */}
        <div>
          <h4 className="text-sm font-bold text-stone-900 mb-2">Where the money went</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={moneyOut}
                dataKey="value"
                nameKey="name"
                outerRadius={70}
                isAnimationActive={false}
                label={({ name, value }) => `${name} $${Number(value).toLocaleString()}`}
              >
                {moneyOut.map((entry, i) => (
                  <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="#fff" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs text-stone-500 mt-1">
            Feed was the biggest cost this month. At a glance you see exactly where the money is going.
          </p>
        </div>
      </div>

      {/* Written summary snippet */}
      <div className="mt-6 bg-orange-50 border border-orange-100 rounded-2xl p-4">
        <p className="text-sm font-bold text-orange-800 mb-1">Monthly summary, written for you</p>
        <p className="text-sm text-stone-700 leading-relaxed">
          In June the farm had 435 beef cattle and 88 dairy cattle. Milk reached 1,600 litres,
          the best month so far. The farm GAINED $4,400 and SPENT $2,550, so it made a profit of
          $1,850. The biggest money maker was milk. The biggest cost was feed.
        </p>
      </div>
    </div>
  );
}
