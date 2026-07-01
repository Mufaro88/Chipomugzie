import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    await requireAuth();
    const farmId = req.nextUrl.searchParams.get("farmId");
    const month = parseInt(req.nextUrl.searchParams.get("month") || "0");
    const year = parseInt(req.nextUrl.searchParams.get("year") || "0");

    if (!farmId || !month || !year) {
      return NextResponse.json({ error: "farmId, month and year are required" }, { status: 400 });
    }

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;

    const previous = await prisma.monthlyCensus.findUnique({
      where: { farmId_month_year: { farmId, month: prevMonth, year: prevYear } },
      include: {
        beefSection: true,
        dairySection: true,
        goatSection: true,
        layerSection: true,
        broilerSection: true,
      },
    });

    return NextResponse.json({
      previous,
      carryForward: {
        beefOpening: previous?.beefSection?.closingStock ?? 0,
        dairyOpening: previous?.dairySection?.closingStock ?? 0,
        goatOpening: previous?.goatSection?.closingStock ?? 0,
        layerOpening: previous?.layerSection?.closingStock ?? 0,
        broilerOpening: previous?.broilerSection?.closingStock ?? 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
