"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ImportCensus, type ImportedValues } from "./ImportCensus";
import { CropsFields, ExpensesFields, type CropRow, type ExpenseRow } from "./CropsExpenses";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type Farm = { id: string; name: string; ownerPro: boolean };

const LIVESTOCK_SECTIONS = [
  { key: "beef", label: "Beef Cattle", icon: "🐂" },
  { key: "dairy", label: "Dairy Cattle", icon: "🐄" },
  { key: "goats", label: "Goats", icon: "🐐" },
  { key: "layers", label: "Layers", icon: "🐔" },
  { key: "broilers", label: "Broilers", icon: "🐥" },
];
const FREE_SECTION_LIMIT = 2;

function NumberInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-stone-100">
      <label className="text-sm text-stone-700">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        disabled={disabled}
        className="w-24 text-right px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900 disabled:bg-stone-100"
      />
    </div>
  );
}

function SectionCard({
  title,
  color,
  children,
  defaultOpen = false,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between p-4 ${color} text-white font-medium`}
      >
        <span>{title}</span>
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
}

export function CensusForm({ farms }: { farms: Farm[] }) {
  const router = useRouter();
  const now = new Date();
  const [farmId, setFarmId] = useState(farms[0]?.id || "");
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Beef
  const [beef, setBeef] = useState({
    openingStock: 0, births: 0, movedIn: 0, movedOut: 0, sold: 0, slaughtered: 0, deaths: 0, closingStock: 0,
    bulls: 0, juvenileBulls: 0, cows: 0, bullingHeifers: 0, weanerHeifers: 0,
    feederSteers: 0, weanerSteers: 0, weanerMaleCalves: 0, calfSteers: 0, maleCaves: 0, femaleCalves: 0,
    notes: "",
  });

  // Dairy
  const [dairy, setDairy] = useState({
    openingStock: 0, births: 0, movedIn: 0, movedOut: 0, sold: 0, slaughtered: 0, deaths: 0, closingStock: 0,
    bulls: 0, juvenileBulls: 0, milkingCows: 0, dryCows: 0, bullingHeifers: 0, weanerHeifers: 0,
    feederSteers: 0, weanerSteers: 0, weanerMaleCalves: 0, calfSteers: 0, maleCalves: 0, femaleCalves: 0,
    totalMilkYield: 0, feedConsumedBags: 0, feedWeightKg: 50,
    notes: "",
  });

  // Goats
  const [goats, setGoats] = useState({
    openingStock: 0, births: 0, movedIn: 0, sold: 0, slaughtered: 0, deaths: 0, movedOut: 0, closingStock: 0,
    bucks: 0, juvenileBucks: 0, does: 0, maidenDoes: 0,
    castratedWeaners: 0, castratedMaleKids: 0, femaleKids: 0, maleKids: 0,
    notes: "",
  });

  // Layers
  const [layers, setLayers] = useState({
    openingStock: 0, mortalities: 0, movedIn: 0, closingStock: 0,
    cratesCollected: 0, eggTraysDelivered: 0, breakagesCrates: 0, binnedCrates: 0,
    averageLayingPct: 0, feedConsumedBags: 0, feedWeightKg: 50,
    notes: "",
  });

  // Broilers
  const [broilers, setBroilers] = useState({
    openingStock: 0, received: 0, sold: 0, deaths: 0, closingStock: 0,
    starterBags: 0, growerBags: 0, finisherBags: 0, feedWeightKg: 50,
    notes: "",
  });

  // Auto-calculate closing stock
  useEffect(() => {
    const closing = beef.openingStock + beef.births + beef.movedIn - beef.movedOut - beef.sold - beef.slaughtered - beef.deaths;
    setBeef((prev) => ({ ...prev, closingStock: Math.max(0, closing) }));
  }, [beef.openingStock, beef.births, beef.movedIn, beef.movedOut, beef.sold, beef.slaughtered, beef.deaths]);

  useEffect(() => {
    const closing = dairy.openingStock + dairy.births + dairy.movedIn - dairy.movedOut - dairy.sold - dairy.slaughtered - dairy.deaths;
    setDairy((prev) => ({ ...prev, closingStock: Math.max(0, closing) }));
  }, [dairy.openingStock, dairy.births, dairy.movedIn, dairy.movedOut, dairy.sold, dairy.slaughtered, dairy.deaths]);

  useEffect(() => {
    const closing = goats.openingStock + goats.births + goats.movedIn - goats.sold - goats.slaughtered - goats.deaths - goats.movedOut;
    setGoats((prev) => ({ ...prev, closingStock: Math.max(0, closing) }));
  }, [goats.openingStock, goats.births, goats.movedIn, goats.sold, goats.slaughtered, goats.deaths, goats.movedOut]);

  useEffect(() => {
    const closing = layers.openingStock + layers.movedIn - layers.mortalities;
    setLayers((prev) => ({ ...prev, closingStock: Math.max(0, closing) }));
  }, [layers.openingStock, layers.movedIn, layers.mortalities]);

  useEffect(() => {
    const closing = broilers.openingStock + broilers.received - broilers.sold - broilers.deaths;
    setBroilers((prev) => ({ ...prev, closingStock: Math.max(0, closing) }));
  }, [broilers.openingStock, broilers.received, broilers.sold, broilers.deaths]);

  // Load previous month's closing stock as opening
  useEffect(() => {
    if (!farmId) return;
    fetch(`/api/census/previous?farmId=${farmId}&month=${month}&year=${year}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.carryForward) {
          const cf = data.carryForward;
          setBeef((prev) => ({ ...prev, openingStock: cf.beefOpening }));
          setDairy((prev) => ({ ...prev, openingStock: cf.dairyOpening }));
          setGoats((prev) => ({ ...prev, openingStock: cf.goatOpening }));
          setLayers((prev) => ({ ...prev, openingStock: cf.layerOpening }));
          setBroilers((prev) => ({ ...prev, openingStock: cf.broilerOpening }));
        }
      })
      .catch(() => {});
  }, [farmId, month, year]);

  const [crops, setCrops] = useState<CropRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [enabledSections, setEnabledSections] = useState<string[]>(["beef", "goats"]);
  const [limitNote, setLimitNote] = useState("");

  const currentFarm = farms.find((f) => f.id === farmId);
  const isPro = currentFarm?.ownerPro ?? false;

  useEffect(() => {
    if (isPro) setEnabledSections(LIVESTOCK_SECTIONS.map((sec) => sec.key));
  }, [isPro]);

  function toggleSection(key: string) {
    setLimitNote("");
    setEnabledSections((prev) => {
      if (prev.includes(key)) return prev.filter((k) => k !== key);
      if (!isPro && prev.length >= FREE_SECTION_LIMIT) {
        setLimitNote(`The Free plan tracks ${FREE_SECTION_LIMIT} animal types. Go Pro to track them all.`);
        return prev;
      }
      return [...prev, key];
    });
  }

  function applyImport(values: ImportedValues) {
    const importedSections = LIVESTOCK_SECTIONS.map((sec) => sec.key).filter(
      (key) => Object.keys(values[key as keyof ImportedValues]).length > 0
    );
    setEnabledSections((prev) => {
      const merged = [...new Set([...prev, ...importedSections])];
      return isPro ? merged : merged.slice(0, FREE_SECTION_LIMIT);
    });
    setBeef((prev) => ({ ...prev, ...values.beef }));
    setDairy((prev) => ({ ...prev, ...values.dairy }));
    setGoats((prev) => ({ ...prev, ...values.goats }));
    setLayers((prev) => ({ ...prev, ...values.layers }));
    setBroilers((prev) => ({ ...prev, ...values.broilers }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate class totals match closing stock
    const beefClassTotal = beef.bulls + beef.juvenileBulls + beef.cows + beef.bullingHeifers +
      beef.weanerHeifers + beef.feederSteers + beef.weanerSteers + beef.weanerMaleCalves +
      beef.calfSteers + beef.maleCaves + beef.femaleCalves;

    if (beefClassTotal > 0 && beefClassTotal !== beef.closingStock) {
      setError(`Beef class total (${beefClassTotal}) does not match closing stock (${beef.closingStock})`);
      setLoading(false);
      return;
    }

    const dairyClassTotal = dairy.bulls + dairy.juvenileBulls + dairy.milkingCows + dairy.dryCows +
      dairy.bullingHeifers + dairy.weanerHeifers + dairy.feederSteers + dairy.weanerSteers +
      dairy.weanerMaleCalves + dairy.calfSteers + dairy.maleCalves + dairy.femaleCalves;

    if (dairyClassTotal > 0 && dairyClassTotal !== dairy.closingStock) {
      setError(`Dairy class total (${dairyClassTotal}) does not match closing stock (${dairy.closingStock})`);
      setLoading(false);
      return;
    }

    const goatClassTotal = goats.bucks + goats.juvenileBucks + goats.does + goats.maidenDoes +
      goats.castratedWeaners + goats.castratedMaleKids + goats.femaleKids + goats.maleKids;

    if (goatClassTotal > 0 && goatClassTotal !== goats.closingStock) {
      setError(`Goat class total (${goatClassTotal}) does not match closing stock (${goats.closingStock})`);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/census", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farmId, month, year,
        beef: enabledSections.includes("beef") ? beef : undefined,
        dairy: enabledSections.includes("dairy") ? dairy : undefined,
        goats: enabledSections.includes("goats") ? goats : undefined,
        layers: enabledSections.includes("layers") ? layers : undefined,
        broilers: enabledSections.includes("broilers") ? broilers : undefined,
        crops: crops
          .filter((c) => c.cropName.trim())
          .map((c) => ({
            cropName: c.cropName.trim(),
            hectares: parseFloat(c.hectares) || null,
            activity: c.activity.trim() || ", ",
          })),
        expenses: expenses
          .filter((e) => e.description.trim() || parseFloat(e.amountUsd) > 0)
          .map((e) => ({
            category: e.category,
            description: e.description.trim() || ", ",
            amountUsd: parseFloat(e.amountUsd) || 0,
          })),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto mt-10 bg-teal-50 text-teal-900 p-8 rounded-xl text-center">
        <div className="text-4xl mb-4">&#x2705;</div>
        <h3 className="text-xl font-bold">Census Submitted</h3>
        <p className="mt-2">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 pb-20">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">{error}</div>
      )}

      {/* Month/Year Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {farms.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Farm</label>
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900"
              >
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900"
            />
          </div>
        </div>
      </div>

      {/* Spreadsheet import */}
      <ImportCensus onImport={applyImport} />

      {/* What do you keep? */}
      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4">
        <p className="font-medium text-stone-900 mb-1">What do you keep on this farm?</p>
        <p className="text-sm text-stone-500 mb-3">
          Tap to choose. Only the animals you pick will show below.
          {!isPro && ` The Free plan tracks ${FREE_SECTION_LIMIT} animal types.`}
        </p>
        <div className="flex flex-wrap gap-2">
          {LIVESTOCK_SECTIONS.map((sec) => (
            <button
              key={sec.key}
              type="button"
              onClick={() => toggleSection(sec.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                enabledSections.includes(sec.key)
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-stone-700 border-stone-200 hover:border-orange-300"
              }`}
            >
              {sec.icon} {sec.label}
            </button>
          ))}
        </div>
        {limitNote && (
          <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
            🔒 {limitNote}{" "}
            <a href="/upgrade" className="font-bold underline">Go Pro</a>
          </p>
        )}
      </div>

      {/* BEEF SECTION */}
      {enabledSections.includes("beef") && (
      <SectionCard title="🐂 Beef Section" color="bg-orange-700" defaultOpen>
        <h4 className="font-medium text-stone-900 mb-2">Stock Movement</h4>
        <NumberInput label="Opening Stock" value={beef.openingStock} onChange={(v) => setBeef({ ...beef, openingStock: v })} />
        <NumberInput label="Births" value={beef.births} onChange={(v) => setBeef({ ...beef, births: v })} />
        <NumberInput label="Moved In" value={beef.movedIn} onChange={(v) => setBeef({ ...beef, movedIn: v })} />
        <NumberInput label="Moved Out" value={beef.movedOut} onChange={(v) => setBeef({ ...beef, movedOut: v })} />
        <NumberInput label="Sold" value={beef.sold} onChange={(v) => setBeef({ ...beef, sold: v })} />
        <NumberInput label="Slaughtered" value={beef.slaughtered} onChange={(v) => setBeef({ ...beef, slaughtered: v })} />
        <NumberInput label="Deaths" value={beef.deaths} onChange={(v) => setBeef({ ...beef, deaths: v })} />
        <div className="flex items-center justify-between py-2 bg-orange-50 px-3 rounded-lg mt-2">
          <span className="font-bold text-orange-800">Closing Stock</span>
          <span className="text-xl font-bold text-orange-800">{beef.closingStock}</span>
        </div>

        <h4 className="font-medium text-stone-900 mt-6 mb-2">Animal Classes</h4>
        <NumberInput label="Bulls" value={beef.bulls} onChange={(v) => setBeef({ ...beef, bulls: v })} />
        <NumberInput label="Juvenile Bulls" value={beef.juvenileBulls} onChange={(v) => setBeef({ ...beef, juvenileBulls: v })} />
        <NumberInput label="Cows" value={beef.cows} onChange={(v) => setBeef({ ...beef, cows: v })} />
        <NumberInput label="Bulling Heifers" value={beef.bullingHeifers} onChange={(v) => setBeef({ ...beef, bullingHeifers: v })} />
        <NumberInput label="Weaner Heifers" value={beef.weanerHeifers} onChange={(v) => setBeef({ ...beef, weanerHeifers: v })} />
        <NumberInput label="Feeder Steers" value={beef.feederSteers} onChange={(v) => setBeef({ ...beef, feederSteers: v })} />
        <NumberInput label="Weaner Steers" value={beef.weanerSteers} onChange={(v) => setBeef({ ...beef, weanerSteers: v })} />
        <NumberInput label="Weaner Male Calves" value={beef.weanerMaleCalves} onChange={(v) => setBeef({ ...beef, weanerMaleCalves: v })} />
        <NumberInput label="Calf Steers" value={beef.calfSteers} onChange={(v) => setBeef({ ...beef, calfSteers: v })} />
        <NumberInput label="Male Calves" value={beef.maleCaves} onChange={(v) => setBeef({ ...beef, maleCaves: v })} />
        <NumberInput label="Female Calves" value={beef.femaleCalves} onChange={(v) => setBeef({ ...beef, femaleCalves: v })} />

        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
          <textarea
            value={beef.notes}
            onChange={(e) => setBeef({ ...beef, notes: e.target.value })}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900"
            rows={2}
            placeholder="e.g. Need deworming, vaccinations pending..."
          />
        </div>
      </SectionCard>
      )}

      {/* DAIRY SECTION */}
      {enabledSections.includes("dairy") && (
      <SectionCard title="🐄 Dairy Section" color="bg-teal-700">
        <h4 className="font-medium text-stone-900 mb-2">Stock Movement</h4>
        <NumberInput label="Opening Stock" value={dairy.openingStock} onChange={(v) => setDairy({ ...dairy, openingStock: v })} />
        <NumberInput label="Births" value={dairy.births} onChange={(v) => setDairy({ ...dairy, births: v })} />
        <NumberInput label="Moved In" value={dairy.movedIn} onChange={(v) => setDairy({ ...dairy, movedIn: v })} />
        <NumberInput label="Moved Out" value={dairy.movedOut} onChange={(v) => setDairy({ ...dairy, movedOut: v })} />
        <NumberInput label="Sold" value={dairy.sold} onChange={(v) => setDairy({ ...dairy, sold: v })} />
        <NumberInput label="Slaughtered" value={dairy.slaughtered} onChange={(v) => setDairy({ ...dairy, slaughtered: v })} />
        <NumberInput label="Deaths" value={dairy.deaths} onChange={(v) => setDairy({ ...dairy, deaths: v })} />
        <div className="flex items-center justify-between py-2 bg-teal-50 px-3 rounded-lg mt-2">
          <span className="font-bold text-teal-800">Closing Stock</span>
          <span className="text-xl font-bold text-teal-800">{dairy.closingStock}</span>
        </div>

        <h4 className="font-medium text-stone-900 mt-6 mb-2">Animal Classes</h4>
        <NumberInput label="Bulls" value={dairy.bulls} onChange={(v) => setDairy({ ...dairy, bulls: v })} />
        <NumberInput label="Juvenile Bulls" value={dairy.juvenileBulls} onChange={(v) => setDairy({ ...dairy, juvenileBulls: v })} />
        <NumberInput label="Milking Cows" value={dairy.milkingCows} onChange={(v) => setDairy({ ...dairy, milkingCows: v })} />
        <NumberInput label="Dry Cows" value={dairy.dryCows} onChange={(v) => setDairy({ ...dairy, dryCows: v })} />
        <NumberInput label="Bulling Heifers" value={dairy.bullingHeifers} onChange={(v) => setDairy({ ...dairy, bullingHeifers: v })} />
        <NumberInput label="Weaner Heifers" value={dairy.weanerHeifers} onChange={(v) => setDairy({ ...dairy, weanerHeifers: v })} />
        <NumberInput label="Feeder Steers" value={dairy.feederSteers} onChange={(v) => setDairy({ ...dairy, feederSteers: v })} />
        <NumberInput label="Weaner Steers" value={dairy.weanerSteers} onChange={(v) => setDairy({ ...dairy, weanerSteers: v })} />
        <NumberInput label="Weaner Male Calves" value={dairy.weanerMaleCalves} onChange={(v) => setDairy({ ...dairy, weanerMaleCalves: v })} />
        <NumberInput label="Calf Steers" value={dairy.calfSteers} onChange={(v) => setDairy({ ...dairy, calfSteers: v })} />
        <NumberInput label="Male Calves" value={dairy.maleCalves} onChange={(v) => setDairy({ ...dairy, maleCalves: v })} />
        <NumberInput label="Female Calves" value={dairy.femaleCalves} onChange={(v) => setDairy({ ...dairy, femaleCalves: v })} />

        <h4 className="font-medium text-stone-900 mt-6 mb-2">Dairy Production</h4>
        <NumberInput label="Total Milk Yield (Litres)" value={dairy.totalMilkYield} onChange={(v) => setDairy({ ...dairy, totalMilkYield: v })} />
        <NumberInput label="Feed Consumed (bags)" value={dairy.feedConsumedBags} onChange={(v) => setDairy({ ...dairy, feedConsumedBags: v })} />

        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
          <textarea
            value={dairy.notes}
            onChange={(e) => setDairy({ ...dairy, notes: e.target.value })}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900"
            rows={2}
            placeholder="e.g. AI in progress, cows moved to dry due to low yield..."
          />
        </div>
      </SectionCard>
      )}

      {/* GOATS SECTION */}
      {enabledSections.includes("goats") && (
      <SectionCard title="🐐 Goats Section" color="bg-amber-700">
        <h4 className="font-medium text-stone-900 mb-2">Stock Movement</h4>
        <NumberInput label="Opening Stock" value={goats.openingStock} onChange={(v) => setGoats({ ...goats, openingStock: v })} />
        <NumberInput label="Births" value={goats.births} onChange={(v) => setGoats({ ...goats, births: v })} />
        <NumberInput label="Moved In" value={goats.movedIn} onChange={(v) => setGoats({ ...goats, movedIn: v })} />
        <NumberInput label="Sold" value={goats.sold} onChange={(v) => setGoats({ ...goats, sold: v })} />
        <NumberInput label="Slaughtered" value={goats.slaughtered} onChange={(v) => setGoats({ ...goats, slaughtered: v })} />
        <NumberInput label="Deaths" value={goats.deaths} onChange={(v) => setGoats({ ...goats, deaths: v })} />
        <NumberInput label="Moved Out" value={goats.movedOut} onChange={(v) => setGoats({ ...goats, movedOut: v })} />
        <div className="flex items-center justify-between py-2 bg-amber-50 px-3 rounded-lg mt-2">
          <span className="font-bold text-amber-800">Closing Stock</span>
          <span className="text-xl font-bold text-amber-800">{goats.closingStock}</span>
        </div>

        <h4 className="font-medium text-stone-900 mt-6 mb-2">Animal Classes</h4>
        <NumberInput label="Bucks" value={goats.bucks} onChange={(v) => setGoats({ ...goats, bucks: v })} />
        <NumberInput label="Juvenile Bucks" value={goats.juvenileBucks} onChange={(v) => setGoats({ ...goats, juvenileBucks: v })} />
        <NumberInput label="Does" value={goats.does} onChange={(v) => setGoats({ ...goats, does: v })} />
        <NumberInput label="Maiden Does" value={goats.maidenDoes} onChange={(v) => setGoats({ ...goats, maidenDoes: v })} />
        <NumberInput label="Castrated Weaners" value={goats.castratedWeaners} onChange={(v) => setGoats({ ...goats, castratedWeaners: v })} />
        <NumberInput label="Castrated Male Kids" value={goats.castratedMaleKids} onChange={(v) => setGoats({ ...goats, castratedMaleKids: v })} />
        <NumberInput label="Female Kids" value={goats.femaleKids} onChange={(v) => setGoats({ ...goats, femaleKids: v })} />
        <NumberInput label="Male Kids" value={goats.maleKids} onChange={(v) => setGoats({ ...goats, maleKids: v })} />

        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
          <textarea
            value={goats.notes}
            onChange={(e) => setGoats({ ...goats, notes: e.target.value })}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900"
            rows={2}
            placeholder="e.g. Vaccination done, new pen completed..."
          />
        </div>
      </SectionCard>
      )}

      {/* LAYERS SECTION */}
      {enabledSections.includes("layers") && (
      <SectionCard title="🐔 Layers Section" color="bg-amber-500">
        <h4 className="font-medium text-stone-900 mb-2">Stock Movement</h4>
        <NumberInput label="Opening Stock" value={layers.openingStock} onChange={(v) => setLayers({ ...layers, openingStock: v })} />
        <NumberInput label="Mortalities" value={layers.mortalities} onChange={(v) => setLayers({ ...layers, mortalities: v })} />
        <NumberInput label="Moved In" value={layers.movedIn} onChange={(v) => setLayers({ ...layers, movedIn: v })} />
        <div className="flex items-center justify-between py-2 bg-yellow-50 px-3 rounded-lg mt-2">
          <span className="font-bold text-yellow-800">Closing Stock</span>
          <span className="text-xl font-bold text-yellow-800">{layers.closingStock}</span>
        </div>

        <h4 className="font-medium text-stone-900 mt-6 mb-2">Egg Production</h4>
        <NumberInput label="Total Crates Collected" value={layers.cratesCollected} onChange={(v) => setLayers({ ...layers, cratesCollected: v })} />
        <NumberInput label="Egg Trays Delivered" value={layers.eggTraysDelivered} onChange={(v) => setLayers({ ...layers, eggTraysDelivered: v })} />
        <NumberInput label="Breakages (crates)" value={layers.breakagesCrates} onChange={(v) => setLayers({ ...layers, breakagesCrates: v })} />
        <NumberInput label="Binned (crates)" value={layers.binnedCrates} onChange={(v) => setLayers({ ...layers, binnedCrates: v })} />
        <NumberInput label="Average Laying %" value={layers.averageLayingPct} onChange={(v) => setLayers({ ...layers, averageLayingPct: v })} />
        <NumberInput label="Feed Consumed (bags)" value={layers.feedConsumedBags} onChange={(v) => setLayers({ ...layers, feedConsumedBags: v })} />

        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
          <textarea
            value={layers.notes}
            onChange={(e) => setLayers({ ...layers, notes: e.target.value })}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900"
            rows={2}
            placeholder="e.g. Birds in last laying phase, recommend replacement..."
          />
        </div>
      </SectionCard>
      )}

      {/* BROILERS SECTION */}
      {enabledSections.includes("broilers") && (
      <SectionCard title="🐥 Broiler Section" color="bg-rose-800">
        <h4 className="font-medium text-stone-900 mb-2">Stock Movement</h4>
        <NumberInput label="Opening Stock" value={broilers.openingStock} onChange={(v) => setBroilers({ ...broilers, openingStock: v })} />
        <NumberInput label="Received (day old chicks)" value={broilers.received} onChange={(v) => setBroilers({ ...broilers, received: v })} />
        <NumberInput label="Sold" value={broilers.sold} onChange={(v) => setBroilers({ ...broilers, sold: v })} />
        <NumberInput label="Deaths" value={broilers.deaths} onChange={(v) => setBroilers({ ...broilers, deaths: v })} />
        <div className="flex items-center justify-between py-2 bg-rose-50 px-3 rounded-lg mt-2">
          <span className="font-bold text-rose-800">Closing Stock</span>
          <span className="text-xl font-bold text-rose-800">{broilers.closingStock}</span>
        </div>

        <h4 className="font-medium text-stone-900 mt-6 mb-2">Feed Consumed</h4>
        <NumberInput label="Starter (bags)" value={broilers.starterBags} onChange={(v) => setBroilers({ ...broilers, starterBags: v })} />
        <NumberInput label="Grower (bags)" value={broilers.growerBags} onChange={(v) => setBroilers({ ...broilers, growerBags: v })} />
        <NumberInput label="Finisher (bags)" value={broilers.finisherBags} onChange={(v) => setBroilers({ ...broilers, finisherBags: v })} />

        <div className="mt-4">
          <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
          <textarea
            value={broilers.notes}
            onChange={(e) => setBroilers({ ...broilers, notes: e.target.value })}
            className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm text-stone-900"
            rows={2}
            placeholder="e.g. First sales started, batch received..."
          />
        </div>
      </SectionCard>
      )}

      {/* CROPS SECTION */}
      <SectionCard title="🌱 Crops Section" color="bg-teal-700">
        <CropsFields rows={crops} setRows={setCrops} />
      </SectionCard>

      {/* MONEY SPENT SECTION */}
      {isPro ? (
        <SectionCard title="💵 Money Spent This Month" color="bg-stone-700">
          <ExpensesFields rows={expenses} setRows={setExpenses} />
        </SectionCard>
      ) : (
        <a href="/upgrade" className="block bg-white rounded-2xl shadow-sm border border-stone-200 p-5 hover:border-orange-300">
          <p className="font-medium text-stone-500">🔒 💵 Money Spent This Month</p>
          <p className="text-sm text-stone-400 mt-1">
            Track feed, medicine, fuel and wages next to your production. This is a Pro feature. Tap to upgrade.
          </p>
        </a>
      )}

      {/* Submit */}
      {error && (
        <div ref={(el) => el?.scrollIntoView({ behavior: "smooth", block: "center" })} className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Census"}
        </button>
      </div>
    </form>
  );
}
