// Shared census parsing: turns rows of [label, number] (from Excel sheets,
// Word documents, pasted WhatsApp text, plain text) into census form values.
// Used by both the browser import panel and the server smart-import API.

export type ImportedValues = {
  beef: Record<string, number>;
  dairy: Record<string, number>;
  goats: Record<string, number>;
  layers: Record<string, number>;
  broilers: Record<string, number>;
};

export type SectionKey = keyof ImportedValues;

export const SECTION_ALIASES: Record<string, SectionKey> = {
  beef: "beef", beefsection: "beef", beefcattle: "beef",
  dairy: "dairy", dairysection: "dairy", dairycattle: "dairy",
  goat: "goats", goats: "goats", goatssection: "goats", goatsection: "goats",
  layer: "layers", layers: "layers", layerssection: "layers", layersection: "layers",
  broiler: "broilers", broilers: "broilers", broilersection: "broilers", broilerssection: "broilers",
};

export const FIELD_MAP: Record<SectionKey, Record<string, string>> = {
  beef: {
    openingstock: "openingStock", births: "births", movedin: "movedIn", movedout: "movedOut",
    sold: "sold", slaughtered: "slaughtered", deaths: "deaths",
    bulls: "bulls", juvenilebulls: "juvenileBulls", cows: "cows",
    bullingheifers: "bullingHeifers", weanerheifers: "weanerHeifers",
    feedersteers: "feederSteers", weanersteers: "weanerSteers",
    weanermalecalves: "weanerMaleCalves", weanermalecalve: "weanerMaleCalves", calfsteers: "calfSteers",
    malecalves: "maleCaves", femalecalves: "femaleCalves",
  },
  dairy: {
    openingstock: "openingStock", births: "births", movedin: "movedIn", movedout: "movedOut",
    sold: "sold", slaughtered: "slaughtered", deaths: "deaths",
    bulls: "bulls", juvenilebulls: "juvenileBulls", milkingcows: "milkingCows", drycows: "dryCows",
    bullingheifers: "bullingHeifers", weanerheifers: "weanerHeifers",
    feedersteers: "feederSteers", weanersteers: "weanerSteers",
    weanermalecalves: "weanerMaleCalves", weanermalecalve: "weanerMaleCalves", calfsteers: "calfSteers",
    malecalves: "maleCalves", femalecalves: "femaleCalves",
    totalmilkyield: "totalMilkYield", totalmilkyieldlitres: "totalMilkYield", milkyield: "totalMilkYield",
    feedconsumed: "feedConsumedBags", feedconsumedbags: "feedConsumedBags",
  },
  goats: {
    openingstock: "openingStock", births: "births", movedin: "movedIn", movedout: "movedOut",
    sold: "sold", slaughtered: "slaughtered", deaths: "deaths",
    soldmovedout: "sold", movedoutsold: "sold",
    bucks: "bucks", juvenilebucks: "juvenileBucks", does: "does", maidendoes: "maidenDoes",
    castratedweaners: "castratedWeaners", castratedmalekids: "castratedMaleKids",
    femalekids: "femaleKids", malekids: "maleKids",
  },
  layers: {
    openingstock: "openingStock", mortalities: "mortalities", mortality: "mortalities", deaths: "mortalities", movedin: "movedIn",
    totalcratescollected: "cratesCollected", cratescollected: "cratesCollected",
    totalcratescollectd: "cratesCollected", cratescollectd: "cratesCollected",
    eggtraysdelivered: "eggTraysDelivered", traysdelivered: "eggTraysDelivered",
    breakages: "breakagesCrates", breakagescrates: "breakagesCrates",
    binned: "binnedCrates", binnedcrates: "binnedCrates",
    averagelaying: "averageLayingPct", averagelaying1: "averageLayingPct",
    layingpercentage: "averageLayingPct", "averagelaying%": "averageLayingPct",
    feedconsumed: "feedConsumedBags", feedconsumedbags: "feedConsumedBags",
  },
  broilers: {
    openingstock: "openingStock", received: "received", receiveddayoldchicks: "received",
    sold: "sold", deaths: "deaths", mortalities: "deaths", mortality: "deaths",
    starter: "starterBags", starterbags: "starterBags",
    grower: "growerBags", growerbags: "growerBags",
    finisher: "finisherBags", finisherbags: "finisherBags",
  },
};

export const TEMPLATE_ROWS: [string, string][] = [
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

export function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9%]/g, "");
}

export type ParseResult = { values: ImportedValues; imported: number; unknown: string[]; cropLines: string[] };

const CROP_HEADERS = new Set([
  "crops", "crop", "cropssection", "cropsection", "fieldcrops", "fieldcropsactivities",
  "fieldcropactivities", "horticulture", "hortcrops", "horticultureandcrops", "cropsactivities",
]);
const STOP_HEADERS = new Set(["workshop", "workinprogress", "generalexpenses", "capitalexpenses"]);

export function parseRows(rows: (string | number | null | undefined)[][]): ParseResult {
  const values: ImportedValues = { beef: {}, dairy: {}, goats: {}, layers: {}, broilers: {} };
  let currentSection: SectionKey | null = null;
  let inCrops = false;
  let imported = 0;
  const unknown: string[] = [];
  const cropLines: string[] = [];

  for (const rawRow of rows) {
    const cells = Array.from(rawRow, (c) => (c === null || c === undefined ? "" : String(c).trim()));
    while (cells.length && cells[cells.length - 1] === "") cells.pop();
    if (cells.length === 0) continue;

    const headKey = normalize(cells[0]);
    if (CROP_HEADERS.has(headKey)) {
      inCrops = true;
      currentSection = null;
      continue;
    }
    if (STOP_HEADERS.has(headKey)) {
      inCrops = false;
      currentSection = null;
      continue;
    }
    if (SECTION_ALIASES[headKey]) inCrops = false;

    // Crop activities are free text lines, kept as written.
    if (inCrops) {
      const line = cells.join(" ").trim();
      if (line) cropLines.push(line);
      continue;
    }

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

    const key = normalize(label);
    if (key === "closingstock" || key === "total" || key === "animalclasses") continue;
    const field = FIELD_MAP[section][key];
    if (!field) {
      unknown.push(label);
      continue;
    }
    values[section][field] = value;
    imported++;
    currentSection = section;
  }

  return { values, imported, unknown, cropLines };
}

// Splits free text (WhatsApp reports, Word documents, .txt) into label/number rows.
export function textToRows(text: string): string[][] {
  return text.split(/\r?\n/).map((line) => {
    if (line.includes("\t")) return line.split("\t");
    if (line.includes(",")) return line.split(",");
    const match = line.trim().match(/^(.*?)[\s:]+(-?[\d,]+\.?\d*)\s*%?$/);
    if (match) return [match[1], match[2]];
    // handles lines like "Castrated male kids10" with no space before the number
    const tight = line.trim().match(/^([A-Za-z][A-Za-z\s()\/%-]*?)(\d+\.?\d*)\s*%?$/);
    if (tight) return [tight[1], tight[2]];
    return [line.trim()];
  });
}
