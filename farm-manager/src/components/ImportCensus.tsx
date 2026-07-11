"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  parseRows,
  textToRows,
  TEMPLATE_ROWS,
  type ImportedValues,
  type ParseResult,
} from "@/lib/censusParse";

export type { ImportedValues };

const MONTH_NAMES = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function downloadTemplate() {
  const aoa: (string | number)[][] = [["Section", "Item", "Number"]];
  for (const [section, item] of TEMPLATE_ROWS) aoa.push([section, item, ""]);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 12 }, { wch: 28 }, { wch: 10 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Monthly Census");
  XLSX.writeFile(wb, "pocket-book-census-template.xlsx");
}

export function ImportCensus({ onImport }: { onImport: (values: ImportedValues, cropLines?: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "warn"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function finish(result: ParseResult) {
    if (result.imported === 0 && result.cropLines.length === 0) {
      setMessage({
        kind: "warn",
        text: "No numbers were recognized. Use the template, or lines like: Beef Opening Stock 390",
      });
      return;
    }
    onImport(result.values, result.cropLines);
    const skipped = result.unknown.length
      ? ` (${result.unknown.length} line${result.unknown.length > 1 ? "s" : ""} not recognized: ${result.unknown.slice(0, 3).join(", ")}${result.unknown.length > 3 ? "…" : ""})`
      : "";
    const cropNote = result.cropLines.length ? ` Also found ${result.cropLines.length} crop activities.` : "";
    setMessage({
      kind: "ok",
      text: `Filled in ${result.imported} numbers below.${cropNote} Scroll down to check them, then submit.${skipped}`,
    });
    setPasteText("");
  }

  // Every file goes to the smart importer, which works out what it is.
  async function handleFile(file: File) {
    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/smart-import", { method: "POST", body: form });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ kind: "warn", text: data.error || "That file could not be read." });
      } else if (data.kind === "census") {
        finish({ values: data.values, imported: data.imported, unknown: data.unknown ?? [], cropLines: data.cropLines ?? [] });
      } else if (data.kind === "farmbook") {
        setMessage({
          kind: "ok",
          text: `Recognized: a Daily Farm Book for ${MONTH_NAMES[data.month]} ${data.year} (money in $${Number(data.totalSales).toLocaleString()}, money out $${Number(data.totalCosts).toLocaleString()}). ${
            data.saved
              ? "It has been added to your Money Book page. This page here is for animal counts."
              : "The Money Book is a Pro feature, so it was not saved. Go Pro to store it."
          }`,
        });
      } else {
        setMessage({ kind: "warn", text: data.message || "The file was not recognized." });
      }
    } catch {
      setMessage({ kind: "warn", text: "Something went wrong reading the file. Please try again." });
    }
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handlePaste() {
    finish(parseRows(textToRows(pasteText)));
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-teal-700 text-white font-medium"
      >
        <span>📥 Upload any document (Excel, Word, text)</span>
        <span className="text-xl">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="p-5 space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-stone-200 rounded-xl p-4">
              <p className="text-sm font-medium text-stone-800 mb-2">Upload a file</p>
              <p className="text-xs text-stone-500 mb-3">
                Excel, Word or text. The app works out what is inside: animal counts
                fill this form, and a money book goes to your Money Book page.
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv,.docx,.doc,.txt"
                disabled={busy}
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="block w-full text-sm text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-600 file:text-white file:font-medium hover:file:bg-orange-700 file:cursor-pointer"
              />
              {busy && <p className="text-xs text-stone-500 mt-2">Reading your file…</p>}
              <button
                type="button"
                onClick={downloadTemplate}
                className="mt-3 bg-teal-50 text-teal-800 border border-teal-200 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-teal-100"
              >
                ⬇️ Download the Excel template
              </button>
            </div>

            <div className="border border-stone-200 rounded-xl p-4">
              <p className="text-sm font-medium text-stone-800 mb-2">Or paste your report</p>
              <p className="text-xs text-stone-500 mb-3">
                Copy a WhatsApp report or any typed list and paste it here.
              </p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={3}
                placeholder={"Beef\nOpening Stock  390\nBirths  4"}
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

          <p className="text-xs text-stone-400">
            📷 Photos of handwritten pages are coming soon. For now, type or paste those numbers.
          </p>

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
