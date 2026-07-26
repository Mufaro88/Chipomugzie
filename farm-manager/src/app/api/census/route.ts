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
    const { farmId, month, year, beef, dairy, goats, layers, broilers, crops, workshop, expenses, notes, flags, flagNote, customEntries } = data;

    if (!farmId || !month || !year) {
      return NextResponse.json({ error: "farmId, month and year are required" }, { status: 400 });
    }

    const existing = await prisma.monthlyCensus.findUnique({
      where: { farmId_month_year: { farmId, month, year } },
    });
    if (existing) {
      return NextResponse.json({ error: "Census for this month already exists" }, { status: 400 });
    }

    // Only accept custom types that really belong to this farm, and only
    // counts for groups that really belong to those types.
    const ownedSections = await prisma.farmSection.findMany({
      where: { farmId },
      include: { classes: { select: { id: true } } },
    });
    const classesBySection = new Map(
      ownedSections.map((s) => [s.id, new Set(s.classes.map((c) => c.id))])
    );
    const validEntries = (Array.isArray(customEntries) ? customEntries : [])
      .filter((e: { sectionId?: string }) => e?.sectionId && classesBySection.has(e.sectionId))
      .map((e: {
        sectionId: string;
        openingStock?: number; births?: number; movedIn?: number; movedOut?: number;
        sold?: number; slaughtered?: number; deaths?: number; closingStock?: number;
        notes?: string | null;
        classCounts?: { classId: string; count?: number }[];
      }) => {
        const allowed = classesBySection.get(e.sectionId)!;
        return {
          sectionId: e.sectionId,
          openingStock: Number(e.openingStock) || 0,
          births: Number(e.births) || 0,
          movedIn: Number(e.movedIn) || 0,
          movedOut: Number(e.movedOut) || 0,
          sold: Number(e.sold) || 0,
          slaughtered: Number(e.slaughtered) || 0,
          deaths: Number(e.deaths) || 0,
          closingStock: Number(e.closingStock) || 0,
          notes: e.notes || null,
          classCounts: {
            create: (e.classCounts ?? [])
              .filter((c) => allowed.has(c.classId))
              .map((c) => ({ classId: c.classId, count: Number(c.count) || 0 })),
          },
        };
      });

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
        status: "submitted",
        flags: flags || null,
        flagNote: flagNote || null,
        notes,
        beefSection: beef ? { create: { ...beef } } : undefined,
        dairySection: dairy ? { create: { ...dairy } } : undefined,
        goatSection: goats ? { create: { ...goats } } : undefined,
        layerSection: layers ? { create: { ...layers } } : undefined,
        broilerSection: broilers ? { create: { ...broilers } } : undefined,
        cropActivities: crops?.length ? { create: crops } : undefined,
        workshopItems: workshop?.length ? { create: workshop } : undefined,
        expenses: expenses?.length ? { create: expenses } : undefined,
        customEntries: validEntries.length ? { create: validEntries } : undefined,
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
