"use client";

export type CropRow = { cropName: string; hectares: string; activity: string };
export type ExpenseRow = { category: string; description: string; amountUsd: string };

export const EXPENSE_CATEGORIES = [
  { value: "feed", label: "Feed" },
  { value: "medicine", label: "Medicine & Vet" },
  { value: "fuel", label: "Fuel" },
  { value: "labour", label: "Wages / Labour" },
  { value: "equipment", label: "Equipment & Repairs" },
  { value: "other", label: "Other" },
];

export function CropsFields({
  rows,
  setRows,
}: {
  rows: CropRow[];
  setRows: (rows: CropRow[]) => void;
}) {
  function update(i: number, patch: Partial<CropRow>) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-600">
        What is growing in the fields this month? Add each crop and what was done.
      </p>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <input
            value={row.cropName}
            onChange={(e) => update(i, { cropName: e.target.value })}
            placeholder="Crop e.g. Maize"
            className="col-span-4 border border-stone-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={row.hectares}
            onChange={(e) => update(i, { hectares: e.target.value })}
            placeholder="Ha"
            inputMode="decimal"
            className="col-span-2 border border-stone-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={row.activity}
            onChange={(e) => update(i, { activity: e.target.value })}
            placeholder="Activity e.g. Planting done, weeding"
            className="col-span-5 border border-stone-200 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
            className="col-span-1 text-stone-400 hover:text-red-600 text-lg"
            aria-label="Remove crop"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows([...rows, { cropName: "", hectares: "", activity: "" }])}
        className="text-sm font-medium text-teal-800 bg-teal-50 border border-teal-200 px-3 py-2 rounded-lg hover:bg-teal-100"
      >
        + Add a crop
      </button>
    </div>
  );
}

export function ExpensesFields({
  rows,
  setRows,
}: {
  rows: ExpenseRow[];
  setRows: (rows: ExpenseRow[]) => void;
}) {
  function update(i: number, patch: Partial<ExpenseRow>) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  const total = rows.reduce((sum, r) => sum + (parseFloat(r.amountUsd) || 0), 0);
  return (
    <div className="space-y-3">
      <p className="text-sm text-stone-600">
        What money went out this month? Feed, medicine, fuel, wages, so the owner
        sees costs next to production.
      </p>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <select
            value={row.category}
            onChange={(e) => update(i, { category: e.target.value })}
            className="col-span-3 border border-stone-200 rounded-lg px-2 py-2 text-sm"
          >
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <input
            value={row.description}
            onChange={(e) => update(i, { description: e.target.value })}
            placeholder="What was bought e.g. 50 bags layer mash"
            className="col-span-6 border border-stone-200 rounded-lg px-3 py-2 text-sm"
          />
          <input
            value={row.amountUsd}
            onChange={(e) => update(i, { amountUsd: e.target.value })}
            placeholder="US$"
            inputMode="decimal"
            className="col-span-2 border border-stone-200 rounded-lg px-3 py-2 text-sm text-right"
          />
          <button
            type="button"
            onClick={() => setRows(rows.filter((_, idx) => idx !== i))}
            className="col-span-1 text-stone-400 hover:text-red-600 text-lg"
            aria-label="Remove expense"
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setRows([...rows, { category: "feed", description: "", amountUsd: "" }])}
          className="text-sm font-medium text-teal-800 bg-teal-50 border border-teal-200 px-3 py-2 rounded-lg hover:bg-teal-100"
        >
          + Add money spent
        </button>
        {total > 0 && (
          <span className="text-sm font-bold text-stone-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Total: ${total.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        )}
      </div>
    </div>
  );
}
