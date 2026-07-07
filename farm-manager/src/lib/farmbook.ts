import * as XLSX from "xlsx";

// Reads a "Daily Farm Book" workbook (Ruzambo style): one sheet per
// enterprise, each with SALES / CASH SALES / CREDIT SALES and COSTS blocks
// of dated transaction rows. Returns per-enterprise money-in/money-out
// totals plus a best guess at which month the book covers.

const ENTERPRISE_MAP: Record<string, string> = {
  dairy: "Dairy",
  layers: "Layers",
  layer: "Layers",
  broilers: "Broilers",
  broiler: "Broilers",
  cowlive: "Cattle",
  livecow: "Cattle",
  cattle: "Cattle",
  beef: "Cattle",
  abattoir: "Abattoir",
  goat: "Goats",
  goats: "Goats",
  horticulture: "Horticulture",
  other: "Other",
  capitalexpenses: "Capital",
  capitalexpenditure: "Capital",
  generalexpenses: "General expenses",
};

type Block = { kind: "sale" | "cost" | "ignore"; row: number; colStart: number; colEnd: number };

export type EnterpriseTotals = { enterprise: string; salesUsd: number; costsUsd: number };
export type FarmBookResult = {
  type: "farmbook";
  month: number;
  year: number;
  enterprises: EnterpriseTotals[];
  totalSales: number;
  totalCosts: number;
};

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

function excelSerialToDate(serial: number) {
  return new Date(Math.round((serial - 25569) * 86400 * 1000));
}

export function parseFarmBook(buffer: Buffer | ArrayBuffer): FarmBookResult | null {
  const wb = XLSX.read(buffer);
  const enterprises: EnterpriseTotals[] = [];
  const dateSerials: number[] = [];
  let blocksFound = 0;

  for (const sheetName of wb.SheetNames) {
    const enterprise = ENTERPRISE_MAP[norm(sheetName)] ?? sheetName.trim();
    const ws = wb.Sheets[sheetName];
    if (!ws) continue;
    const rows: (string | number | null)[][] = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: true,
    });

    // Find block headers like SALES / CASH SALES / CREDIT SALES / COSTS,
    // possibly side by side in different column groups.
    const blocks: Block[] = [];
    rows.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (typeof cell !== "string") return;
        const n = norm(cell);
        if (n === "sales" || n === "cashsales" || n === "creditsales") {
          blocks.push({ kind: "sale", row: r, colStart: c, colEnd: c + 4 });
        } else if (n === "costs" || n === "expenses") {
          blocks.push({ kind: "cost", row: r, colStart: c, colEnd: c + 5 });
        } else if (n === "creditors" || n === "debtors") {
          // money owed lists, not this month's cash: bounds only, never counted
          blocks.push({ kind: "ignore", row: r, colStart: c, colEnd: c + 5 });
        }
      });
    });
    if (blocks.length === 0) continue;
    blocksFound += blocks.length;

    // Column groups that share rows: clip each block's column range at the
    // next block that starts on the same row.
    for (const block of blocks) {
      const sameRow = blocks.filter((b) => b.row === block.row && b.colStart > block.colStart);
      if (sameRow.length) {
        block.colEnd = Math.min(block.colEnd, Math.min(...sameRow.map((b) => b.colStart)) - 1);
      }
    }

    let sales = 0;
    let costs = 0;
    for (const block of blocks) {
      if (block.kind === "ignore") continue;
      // A block ends where the next block using overlapping columns begins.
      const nextStart = blocks
        .filter(
          (b) => b.row > block.row && b.colStart <= block.colEnd && b.colEnd >= block.colStart
        )
        .reduce((min, b) => Math.min(min, b.row), rows.length);

      for (let r = block.row + 1; r < nextStart; r++) {
        const cells = (rows[r] ?? []).slice(block.colStart, block.colEnd + 1);
        const first = cells.find((c) => c !== null && c !== undefined && String(c).trim() !== "");
        if (first === undefined) continue;
        const firstText = String(first).trim().toLowerCase();
        if (firstText.startsWith("total") || firstText === "nil") continue;
        if (firstText.startsWith("date")) continue; // column header row

        // last numeric cell in the group = amount (never a date serial)
        let amount: number | null = null;
        for (let i = cells.length - 1; i >= 0; i--) {
          const v = cells[i];
          if (typeof v === "number" && Number.isFinite(v)) {
            const looksLikeDateSerial = i > 0 && Number.isInteger(v) && v > 40000 && v < 60000;
            if (looksLikeDateSerial) continue;
            amount = v;
            break;
          }
        }
        if (amount === null) continue;

        // Excel date serial in the first cell tells us the month.
        if (typeof cells[0] === "number" && cells[0] > 40000 && cells[0] < 60000) {
          dateSerials.push(cells[0]);
          if (amount === cells[0]) continue; // row with only a date, no amount
        } else if (typeof first === "number") {
          continue; // stray number row without a date or description
        }

        if (block.kind === "sale") sales += amount;
        else costs += amount;
      }
    }

    if (sales > 0 || costs > 0) {
      enterprises.push({
        enterprise,
        salesUsd: Math.round(sales * 100) / 100,
        costsUsd: Math.round(costs * 100) / 100,
      });
    }
  }

  if (blocksFound === 0 || enterprises.length === 0) return null;

  // The month is whichever month most transaction dates fall in.
  const counts = new Map<string, number>();
  for (const serial of dateSerials) {
    const d = excelSerialToDate(serial);
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();
  let best = 0;
  for (const [key, count] of counts) {
    if (count > best) {
      best = count;
      const [y, m] = key.split("-").map(Number);
      year = y;
      month = m;
    }
  }

  const totalSales = enterprises.reduce((sum, e) => sum + e.salesUsd, 0);
  const totalCosts = enterprises.reduce((sum, e) => sum + e.costsUsd, 0);
  return {
    type: "farmbook",
    month,
    year,
    enterprises,
    totalSales: Math.round(totalSales * 100) / 100,
    totalCosts: Math.round(totalCosts * 100) / 100,
  };
}
