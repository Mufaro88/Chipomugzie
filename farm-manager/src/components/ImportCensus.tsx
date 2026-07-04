"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";

// Maps every spreadsheet label a manager might use to a form field.
// Labels are normalized (lowercase, letters/digits/% only) before lookup.

export type ImportedValues = {
  beef: Record<string, number>;
  dairy: Record<string, number>;
  goats: Record<string, number>;
  layers: Record<string, number>;
  broilers: Record<string, number>;
};

type SectionKey = keyof ImportedValues;

const SECTION_ALIASES: Record<string, SectionKey> = {
  beef: "beef", beefsection: "beef", beefcattle: "beef",
  dairy: "dairy", dairysection: "dairy", dairycattle: "dairy",
  goat: "goats", goats: "goats", goatssection: "goats", goatsection: "goats",
  layer: "layers", layers: "layers", layerssection: "layers", layersection: "layers",
  broiler: "broilers", broilers: "broilers", broilersection: "broilers", broilerssection: "broilers",
};

const FIELD_MAP: Record<SectionKey, Record<string, string>> = {
  beef: {
    openingstock: "openingStock", births: "births", movedin: "movedIn", movedout: "movedOut",
    sold: "sold", slaughtered: "slaughtered", deaths: "deaths",
    bulls: "bulls", juvenilebulls: "juvenileBulls", cows: "cows",
    bullingheifers: "bullingHeifers", weanerheifers: "weanerHeifers",
    feedersteers: "feederSteers", weanersteers: "weanerSteers",
    weanermalecalves: "weanerMaleCalves", calfsteers: "calfSteers",
    malecalves: "maleCaves", femalecalves: "femaleCalves",
  },
  dairy: {
    openingstock: "openingStock", births: "births", movedin: "movedIn", movedout: "movedOut",
    sold: "sold", slaughtered: "slaughtered", deaths: "deaths",
    bulls: "bulls", juvenilebulls: "juvenileBulls", milkingcows: "milkingCows", drycows: "dryCows",
    bullingheifers: "bullingHeifers", weanerheifers: "weanerHeifers",
    feedersteers: "feederSteers", weanersteers: "weanerSteers",
    weanermalecalves: "weanerMaleCalves", calfsteers: "calfSteers",
    malecalves: "maleCalves", femalecalves: "femaleCalves",
    totalmilkyield: "totalMilkYield", totalmilkyieldlitres: "totalMilkYield", milkyield: "totalMilkYield",
    feedconsumed: "feedConsumedBags", feedconsumedbags: "feedConsumedBags",
  },
  goats: {
    openingstock: "openingStock", births: "births", movedin: "movedIn", movedout: "movedOut",
    sold: "sold", slaughtered: "slaughtered", deaths: "deaths",
    bucks: "bucks", juvenilebucks: "juvenileBucks", does: "does", maidendoes: "maidenDoes",
    castratedweaners: "castratedWeaners", castratedmalekids: "castratedMaleKids",
    femalekids: "femaleKids", malekids: "maleKids",
  },
  layers: {
    openingstock: "openingStock", mortalities: "mortalities", deaths: "mortalities", movedin: "movedIn",
    totalcratescollected: "cratesCollected", cratescollected: "cratesCollected",
    eggtraysdelivered: "eggTraysDelivered", traysdelivered: "eggTraysDelivered",
    breakages: "breakagesCrates", breakagescrates: "breakagesCrates",
    binned: "binnedCrates", binnedcrates: "binnedCrates",
    averagelaying: "averageLayingPct", averagelaying1: "averageLayingPct",
    layingpercentage: "averageLayingPct", "averagelaying%": "averageLayingPct",
    feedconsumed: "feedConsumedBags", feedconsumedbags: "feedConsumedBags",
  },
  broilers: {
    openingstock: "openingStock", received: "received", receiveddayoldchicks: "received",
    sold: "sold", deaths: "deaths",
    starter: "starterBags", starterbags: "starterBags",
    grower: "growerBags", growerbags: "growerBags",
    finisher: "finisherBags", finisherbags: "finisherBags",
  },
};

const TEMPLATE_ROWS: [string, string][] = [
  ["Beef", "Opening Stock"], ["Beef", "Births"], ["Beef", "Moved In"], ["Beef", "Moved Out"],
  ["Beef", "Sold"], ["Beef", "Slaughtered"], ["Beef", "Deaths"],
  ["Beef", "Bulls"], ["Beef", "Juvenile Bulls"], ["Beef", "Cows"], ["Beef", "Bulling Heifers"],
  ["Beef", "Weaner Heifers"], ["Beef", "Feeder Steers"], ["Beef", "Weaner Steers"],
  ["Beef", "Weaner Male Calves"], ["Beef", "Calf Steers"], ["Beef", "Male Calves"], ["Beef", "Female Calves"],
  ["Dairy", "Opening Stock"], ["Dairy", "Births"], ["Dairy", "Moved In"], ["Dairy", "Moved Out"],
  ["Dairy", "Sold"], ["Dairy", "Slaughtered"], ["Dairy", "Deaths"],
  ["Dairy", "Bulls"], ["Dairy", "Juvenile Bulls"], ["Dairy", "Milking Cows"], ["Dairy", "Dry Cows"],
  ["Dairy", "Bulling Heifers"], ["Dairy", "Weaner Heifers"], ["Dairy", "Feeder Steers"],
  ["Dairy", "Weaner Steers"], ["Dairy", "Weaner Male Calves"], ["Dairy", "Calf Steers"],
  ["Dairy", "Male Calves"], ["Dairy", "Female Calves"],
  ["Dairy", "Total Milk Yield (Litres)"], ["Dairy", "Feed Consumed (bags)"],
  ["Goats", "Opening Stock"], ["Goats", "Births"], ["Goats", "Moved In"], ["Goats", "Sold"],
  ["Goats", "Slaughtered"], ["Goats", "Deaths"], ["Goats", "Moved Out"],
  ["Goats", "Bucks"], ["Goats", "Juvenile Bucks"], ["Goats", "Does"], ["Goats", "Maiden Does"],
  ["Goats", "Castrated Weaners"], ["Goats", "Castrated Male Kids"], ["Goats", "Female Kids"], ["Goats", "Male Kids"],
  ["Layers", "Opening Stock"], ["Layers", "Mortalities"], ["Layers", "Moved In"],
  ["Layers", "Total Crates Collected"], ["Layers", "Egg Trays Delivered"],
  ["Layers", "Breakages (crates)"], ["Layers", "Binned (crates)"],
  ["Layers", "Average Laying %"], ["Layers", "Feed Consumed (bags)"],
  ["Broilers", "Opening Stock"], ["Broilers", "Received (day old chicks)"], ["Broilers", "Sold"],
  ["Broilers", "Deaths"], ["Broilers", "Starter (bags)"], ["Broilers", "Grower (bags)"], ["Broilers", "Finisher (bags)"],
];

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9%]/g, "");
}

function parseRows(rows: (string | number | null | undefined)[][]) {
  const values: ImportedValues = { beef: {}, dairy: {}, goats: {}, layers: {}, broilers: {} };
  let currentSection: SectionKey | null = null;
  let imported = 0;
  const unknown: string[] = [];

  for (const rawRow of rows) {
    const cells = rawRow
      .map((c) => (c === null || c === undefined ? "" : String(c).trim()))
      .filter((_, i, arr) => i < arr.length);
    while (cells.length && cells[cells.length - 1] === "") cells.pop();
    if (cells.length === 0) continue;

    // A row that is just a section name switches the current section.
    if (cells.length === 1) {
      const section = SECTION_ALIASES[normalize(cells[0])];
      if (section) currentSection = section;
      continue;
    }

    let section: SectionKey | null = null;
    let label = "";
    let valueText = "";

    if (cells.length >= 3 && SECTION_ALIASES[normalize(cells[0])]) {
      section = SECTION_ALIASES[normalize(cells[0])];
      label = cells[1];
      valueText = cells[2];
    } else {
      const maybeSection = SECTION_ALIASES[normalize(cells[0])];
      if (maybeSection && cells.length === 2 && SECTION_ALIASES[normalize(cells[1])] === undefined && isNaN(parseFloat(cells[1]))) {
        currentSection = maybeSection;
        continue;
      }
      section = currentSection;
      label = cells[0];
      valueText = cells[1];
    }

    const value = parseFloat(valueText.replace(/[, ]/g, ""));
    if (!Number.isFinite(value)) continue;
    if (!section) {
      unknown.push(label);
      continue;
    }

    const field = FIELD_MAP[section][normalize(label)];
    if (!field) {
      unknown.push(label);
      continue;
    }
    values[section][field] = value;
    imported++;
    currentSection = section;
  }

  return { values, imported, unknown };
}

export function downloadTemplate() {
  const aoa: (string | number)[][] = [["Section", "Item", "Number"]];
  for (const [section, item] of TEMPLATE_ROWS) aoa.push([section, item, ""]);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 12 }, { wch: 28 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Monthly Census");
  XLSX.writeFile(wb, "pocket-book-census-template.xlsx");
}

export function ImportCensus({ onImport }: { onImport: (values: ImportedValues) => void }) {
  const [open, setOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "warn"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function finish(result: ReturnType<typeof parseRows>) {
    if (result.imported === 0) {
      setMessage({
        kind: "warn",
        text: "No numbers were recognized. Use the template, or lines like: Beef Opening Stock 390",
      });
      return;
    }
    onImport(result.values);
    const skipped = result.unknown.length
      ? ` (${result.unknown.length} line${result.unknown.length > 1 ? "s" : ""} not recognized: ${result.unknown.slice(0, 3).join(", ")}${result.unknown.length > 3 ? "…" : ""})`
      : "";
    setMessage({ kind: "ok", text: `Filled in ${result.imported} numbers below — scroll down to check them, then submit.${skipped}` });
    setPasteText("");
  }

  async function handleFile(file: File) {
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data);
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(ws, { header: 1, raw: true });
      finish(parseRows(rows));
    } catch {
      setMessage({ kind: "warn", text: "That file could not be read. Save it as .xlsx or .csv and try again." });
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function handlePaste() {
    const rows = pasteText
      .split(/\r?\n/)
      .map((line) => {
        if (line.includes("\t")) return line.split("\t");
        if (line.includes(",")) return line.split(",");
        const match = line.trim().match(/^(.*?)[\s:]+(-?[\d,]+\.?\d*)\s*%?$/);
        if (match) return [match[1], match[2]];
        return [line.trim()];
      });
    finish(parseRows(rows));
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-teal-700 text-white font-medium"
      >
        <span>📥 Import from spreadsheet — no typing needed</span>
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="p-5 space-y-5">
          <div>
            <p className="text-sm text-stone-600 leading-relaxed mb-3">
              <strong>Step 1:</strong> Download the Excel template and fill in your numbers
              (or use your own sheet with the same item names).
            </p>
            <button
              type="button"
              onClick={downloadTemplate}
              className="bg-teal-50 text-teal-800 border border-teal-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-100"
            >
              ⬇️ Download Excel template
            </button>
          </div>

          <div>
            <p className="text-sm text-stone-600 mb-3">
              <strong>Step 2:</strong> Bring the numbers back — either way works:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-stone-200 rounded-xl p-4">
                <p className="text-sm font-medium text-stone-800 mb-2">Upload the file</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  className="block w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white file:font-medium hover:file:bg-orange-700 file:cursor-pointer"
                />
              </div>
              <div className="border border-stone-200 rounded-xl p-4">
                <p className="text-sm font-medium text-stone-800 mb-2">Or paste your numbers</p>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  rows={3}
                  placeholder={"Beef\nOpening Stock\t390\nBirths\t4"}
                  className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={handlePaste}
                  disabled={!pasteText.trim()}
                  className="mt-2 bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                >
                  Read pasted numbers
                </button>
              </div>
            </div>
          </div>

          {message && (
            <p
              className={`text-sm rounded-lg px-4 py-3 border ${
                message.kind === "ok"
                  ? "bg-teal-50 border-teal-200 text-teal-900"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              {message.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
