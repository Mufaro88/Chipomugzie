import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import mammoth from "mammoth";
import { prisma } from "@/lib/db";
import { getSession, hasActivePro, isPlatformAdmin } from "@/lib/auth";
import { parseRows, textToRows, type ParseResult } from "@/lib/censusParse";
import { parseFarmBook } from "@/lib/farmbook";

// One uploader for everything: the farmer sends any file and the app works
// out what it is (census numbers, a money book, or something it cannot read
// yet) and says so in plain words.

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  const name = (file.name || "").toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  // Photos and scans need AI reading, which is the next phase.
  if (
    name.match(/\.(png|jpe?g|gif|webp|heic|pdf)$/) ||
    (file.type || "").startsWith("image/") ||
    file.type === "application/pdf"
  ) {
    return NextResponse.json({
      kind: "image",
      message:
        "This is a photo or scan. Reading handwritten and scanned pages is coming soon. For now, type the numbers or paste them as text.",
    });
  }

  // Word documents: pull the text out, then read it like a pasted report.
  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    try {
      const { value: text } = await mammoth.extractRawText({ buffer });
      const result = parseRows(textToRows(text));
      if (result.imported > 0) return censusResponse(result, "Word document");
      return NextResponse.json({
        kind: "unknown",
        message:
          "This Word document was read, but no farm numbers were recognized in it. It should have lines like: Beef ... Opening stock 390.",
      });
    } catch {
      return NextResponse.json(
        { error: "This Word document could not be opened. Save it as .docx and try again." },
        { status: 422 }
      );
    }
  }

  // Plain text files.
  if (name.endsWith(".txt")) {
    const result = parseRows(textToRows(buffer.toString("utf8")));
    if (result.imported > 0) return censusResponse(result, "text file");
    return NextResponse.json({
      kind: "unknown",
      message: "No farm numbers were recognized in this text file.",
    });
  }

  // Spreadsheets: try census numbers first, then the Daily Farm Book shape.
  try {
    const wb = XLSX.read(buffer);
    let best: ParseResult | null = null;
    for (const sheetName of wb.SheetNames) {
      const rows = XLSX.utils.sheet_to_json<(string | number | null)[]>(wb.Sheets[sheetName], {
        header: 1,
        raw: true,
      });
      const result = parseRows(rows);
      if (!best || result.imported > best.imported) best = result;
    }
    if (best && best.imported > 0) return censusResponse(best, "spreadsheet");

    const book = parseFarmBook(buffer);
    if (book) {
      // Store it against the user's farm when the plan allows.
      const farm = await prisma.farm.findFirst({
        where: {
          OR: [{ ownerId: user.id }, { farmAccess: { some: { userId: user.id, role: "admin" } } }],
        },
        include: { owner: { select: { plan: true, planExpiresAt: true } } },
      });
      const allowed = farm && (hasActivePro(farm.owner) || isPlatformAdmin(user));
      if (farm && allowed) {
        for (const e of book.enterprises) {
          await prisma.moneyMonth.upsert({
            where: {
              farmId_month_year_enterprise: {
                farmId: farm.id, month: book.month, year: book.year, enterprise: e.enterprise,
              },
            },
            update: { salesUsd: e.salesUsd, costsUsd: e.costsUsd },
            create: {
              farmId: farm.id, month: book.month, year: book.year,
              enterprise: e.enterprise, salesUsd: e.salesUsd, costsUsd: e.costsUsd,
            },
          });
        }
      }
      return NextResponse.json({
        kind: "farmbook",
        saved: Boolean(allowed),
        month: book.month,
        year: book.year,
        totalSales: book.totalSales,
        totalCosts: book.totalCosts,
      });
    }
  } catch {
    return NextResponse.json(
      { error: "This file could not be opened. Save it as .xlsx, .csv, .docx or .txt and try again." },
      { status: 422 }
    );
  }

  return NextResponse.json({
    kind: "unknown",
    message:
      "The file opened, but the app did not recognize farm numbers or a money book inside it. Use the Excel template, or a sheet with labels like Opening Stock next to numbers.",
  });
}

function censusResponse(result: ParseResult, source: string) {
  return NextResponse.json({
    kind: "census",
    source,
    values: result.values,
    imported: result.imported,
    unknown: result.unknown,
  });
}
