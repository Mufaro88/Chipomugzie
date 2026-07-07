import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, hasActivePro, isPlatformAdmin } from "@/lib/auth";
import { parseFarmBook } from "@/lib/farmbook";

async function usableFarm(userId: string) {
  return prisma.farm.findFirst({
    where: {
      OR: [
        { ownerId: userId },
        { farmAccess: { some: { userId, role: "manager" } } },
      ],
    },
    include: { owner: { select: { plan: true, planExpiresAt: true } } },
  });
}

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const farm = await usableFarm(user.id);
  if (!farm) return NextResponse.json({ months: [] });

  const rows = await prisma.moneyMonth.findMany({
    where: { farmId: farm.id },
    orderBy: [{ year: "asc" }, { month: "asc" }],
  });
  return NextResponse.json({ months: rows, farmName: farm.name });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const farm = await usableFarm(user.id);
  if (!farm) return NextResponse.json({ error: "Create a farm first" }, { status: 400 });

  const allowed = hasActivePro(farm.owner) || isPlatformAdmin(user);
  if (!allowed) {
    return NextResponse.json(
      { error: "The Money Book is a Pro feature. Go Pro to track money in and out." },
      { status: 403 }
    );
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let result;
  try {
    result = parseFarmBook(buffer);
  } catch {
    result = null;
  }
  if (!result) {
    return NextResponse.json(
      {
        error:
          "This file was not recognized as a farm money book. It should have sheets like DAIRY, LAYERS with SALES and COSTS columns. For animal counts, use the Import on the New Census page instead.",
      },
      { status: 422 }
    );
  }

  for (const e of result.enterprises) {
    await prisma.moneyMonth.upsert({
      where: {
        farmId_month_year_enterprise: {
          farmId: farm.id,
          month: result.month,
          year: result.year,
          enterprise: e.enterprise,
        },
      },
      update: { salesUsd: e.salesUsd, costsUsd: e.costsUsd },
      create: {
        farmId: farm.id,
        month: result.month,
        year: result.year,
        enterprise: e.enterprise,
        salesUsd: e.salesUsd,
        costsUsd: e.costsUsd,
      },
    });
  }

  return NextResponse.json({ result });
}
