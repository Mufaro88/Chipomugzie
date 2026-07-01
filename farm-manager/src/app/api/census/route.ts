import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    const farmId = req.nextUrl.searchParams.get("farmId");

    if (!farmId) {
      return NextResponse.json({ error: "farmId is required" }, { status: 400 });
    }

    const censuses = await prisma.monthlyCensus.findMany({
      where: { farmId },
      include: {
        beefSection: true,
        dairySection: true,
        goatSection: true,
        layerSection: true,
        broilerSection: true,
        submittedBy: { select: { name: true } },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    });

    return NextResponse.json({ censuses });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const data = await req.json();
    const { farmId, month, year, beef, dairy, goats, layers, broilers, crops, workshop, notes } = data;

    if (!farmId || !month || !year) {
      return NextResponse.json({ error: "farmId, month and year are required" }, { status: 400 });
    }

    const existing = await prisma.monthlyCensus.findUnique({
      where: { farmId_month_year: { farmId, month, year } },
    });
    if (existing) {
      return NextResponse.json({ error: "Census for this month already exists" }, { status: 400 });
    }

    // Get previous month's census for carry-forward
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const previousCensus = await prisma.monthlyCensus.findUnique({
      where: { farmId_month_year: { farmId, month: prevMonth, year: prevYear } },
      include: {
        beefSection: true,
        dairySection: true,
        goatSection: true,
        layerSection: true,
        broilerSection: true,
      },
    });

    const census = await prisma.monthlyCensus.create({
      data: {
        farmId,
        userId: user.id,
        month,
        year,
        notes,
        beefSection: beef ? { create: { ...beef } } : undefined,
        dairySection: dairy ? { create: { ...dairy } } : undefined,
        goatSection: goats ? { create: { ...goats } } : undefined,
        layerSection: layers ? { create: { ...layers } } : undefined,
        broilerSection: broilers ? { create: { ...broilers } } : undefined,
        cropActivities: crops?.length ? { create: crops } : undefined,
        workshopItems: workshop?.length ? { create: workshop } : undefined,
      },
      include: {
        beefSection: true,
        dairySection: true,
        goatSection: true,
        layerSection: true,
        broilerSection: true,
        cropActivities: true,
        workshopItems: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        farmId,
        userId: user.id,
        action: "create",
        entity: "monthly_census",
        entityId: census.id,
        newValues: JSON.stringify({ month, year }),
      },
    });

    return NextResponse.json({ census });
  } catch (error) {
    console.error("Census creation error:", error);
    return NextResponse.json({ error: "Failed to create census" }, { status: 500 });
  }
}
