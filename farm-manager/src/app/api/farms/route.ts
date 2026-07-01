import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireAuth();
    const ownedFarms = await prisma.farm.findMany({
      where: { ownerId: user.id },
      include: { _count: { select: { monthlyCensus: true } } },
    });
    const accessFarms = await prisma.farmAccess.findMany({
      where: { userId: user.id },
      include: { farm: { include: { _count: { select: { monthlyCensus: true } } } } },
    });
    const farms = [
      ...ownedFarms.map((f) => ({ ...f, userRole: "owner" })),
      ...accessFarms.map((a) => ({ ...a.farm, userRole: a.role })),
    ];
    return NextResponse.json({ farms });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { name, location } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Farm name is required" }, { status: 400 });
    }

    const farmCount = await prisma.farm.count({ where: { ownerId: user.id } });
    if (user.role !== "platform_admin" && farmCount >= 1) {
      const existingFarm = await prisma.farm.findFirst({ where: { ownerId: user.id } });
      if (existingFarm?.tier === "free" || existingFarm?.tier === "basic") {
        return NextResponse.json(
          { error: "Upgrade to Pro to add more farms" },
          { status: 403 }
        );
      }
    }

    const farm = await prisma.farm.create({
      data: { name, location, ownerId: user.id },
    });

    return NextResponse.json({ farm });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
