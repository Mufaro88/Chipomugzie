"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type MoneyMonth = {
  id: string;
  month: number;
  year: number;
  enterprise: string;
  salesUsd: number;
  costsUsd: number;
};

type UploadResult = {
  month: number;
  year: number;
  totalSales: number;
  totalCosts: number;
  enterprises: { enterprise: string; salesUsd: number; costsUsd: number }[];
};

export function MoneyBookClient() {
  const [months, setMonths] = useState<MoneyMonth[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "warn"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    const res = await fetch("/api/moneybook");
    const data = await res.json();
    setMonths(data.months ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function upload(file: File) {
    setUploading(true);
    setMessage(null);
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/moneybook", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      setMessage({ kind: "warn", text: data.error || "Something went wrong" });
    } else {
      const r: UploadResult = data.result;
      const profit = r.totalSales - r.totalCosts;
      setMessage({
        kind: "ok",
        text: `Recognized: Daily Farm Book for ${MONTH_NAMES[r.month]} ${r.year}. Money in $${r.totalSales.toLocaleString()}, money out $${r.totalCosts.toLocaleString()}. ${
          profit >= 0
            ? `The farm kept $${profit.toLocaleString()} that month. 🎉`
            : `The farm spent $${Math.abs(profit).toLocaleString()} more than it earned that month.`
        }`,
      });
      await load();
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  // Roll up per-month totals for the chart.
  const byMonth = new Map<string, { label: string; moneyIn: number; moneyOut: number }>();
  for (const row of months) {
    const key = `${row.year}-${String(row.month).padStart(2, "0")}`;
    const entry = byMonth.get(key) ?? {
      label: `${MONTH_NAMES[row.month]} ${row.year}`,
      moneyIn: 0,
      moneyOut: 0,
    };
    entry.moneyIn += row.salesUsd;
    entry.moneyOut += row.costsUsd;
    byMonth.set(key, entry);
  }
  const chartData = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ ...v, moneyIn: Math.round(v.moneyIn), moneyOut: Math.round(v.moneyOut) }));

  const latestKey = [...byMonth.keys()].sort().pop();
  const latestRows = latestKey
    ? months
        .filter((r) => `${r.year}-${String(r.month).padStart(2, "0")}` === latestKey)
        .sort((a, b) => b.salesUsd - a.salesUsd)
    : [];

  let caption = "";
  if (chartData.length >= 2) {
    const last = chartData[chartData.length - 1];
    const profitMonths = chartData.filter((m) => m.moneyIn > m.moneyOut).length;
    caption = `Over these ${chartData.length} months, the farm made more than it spent in ${profitMonths} of them. Last month (${last.label}): $${last.moneyIn.toLocaleString()} came in and $${last.moneyOut.toLocaleString()} went out.`;
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900">Money Book 💰</h2>
        <p className="text-stone-500">
          Upload your monthly farm book. The app reads it, adds up every sale and
          every cost, and shows the trends.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-8">
        <p className="font-medium text-stone-900 mb-2">Upload a Daily Farm Book (.xlsx)</p>
        <p className="text-sm text-stone-500 mb-4">
          Use your normal monthly transactions workbook, with sheets like DAIRY,
          LAYERS, GENERAL EXPENSES. The app works out which month it is by itself.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          disabled={uploading}
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          className="block w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white file:font-medium hover:file:bg-orange-700 file:cursor-pointer"
        />
        {uploading && <p className="text-sm text-stone-500 mt-3">Reading your book…</p>}
        {message && (
          <p
            className={`text-sm rounded-lg px-4 py-3 mt-4 border ${
              message.kind === "ok"
                ? "bg-teal-50 border-teal-200 text-teal-900"
                : "bg-amber-50 border-amber-200 text-amber-900"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-stone-500">Loading…</p>
      ) : chartData.length === 0 ? (
        <p className="text-stone-500 bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          No money records yet. Upload your first monthly book above.
        </p>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-8">
            <h3 className="text-lg font-bold text-stone-900 mb-4">Money In vs Money Out</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar isAnimationActive={false} dataKey="moneyIn" fill="#009E73" name="Money In" />
                <Bar isAnimationActive={false} dataKey="moneyOut" fill="#D55E00" name="Money Out" />
              </BarChart>
            </ResponsiveContainer>
            {caption && (
              <p className="text-sm text-stone-600 bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 mt-3 leading-relaxed">
                💬 {caption}
              </p>
            )}
          </div>

          {latestRows.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
              <h3 className="text-lg font-bold text-stone-900 mb-4">
                Where the money moved, {MONTH_NAMES[latestRows[0].month]} {latestRows[0].year}
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-stone-500 uppercase tracking-wide border-b border-stone-100">
                    <th className="py-2">Enterprise</th>
                    <th className="py-2 text-right">Money in</th>
                    <th className="py-2 text-right">Money out</th>
                    <th className="py-2 text-right">Kept</th>
                  </tr>
                </thead>
                <tbody>
                  {latestRows.map((row) => {
                    const kept = row.salesUsd - row.costsUsd;
                    return (
                      <tr key={row.id} className="border-b border-stone-50 last:border-0">
                        <td className="py-2 font-medium text-stone-900">{row.enterprise}</td>
                        <td className="py-2 text-right text-stone-700">${row.salesUsd.toLocaleString()}</td>
                        <td className="py-2 text-right text-stone-700">${row.costsUsd.toLocaleString()}</td>
                        <td className={`py-2 text-right font-medium ${kept >= 0 ? "text-teal-700" : "text-red-700"}`}>
                          {kept >= 0 ? "" : "−"}${Math.abs(kept).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
