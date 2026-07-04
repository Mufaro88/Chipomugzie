import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, hasActivePro, isPlatformAdmin } from "@/lib/auth";

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
    if (!isPlatformAdmin(user)) {
      if (!hasActivePro(user) && farmCount >= 1) {
        return NextResponse.json(
          { error: "The free plan includes one farm. Go Pro to add more farms." },
          { status: 403 }
        );
      }
      if (hasActivePro(user) && farmCount >= 3) {
        return NextResponse.json(
          { error: "Pro includes up to 3 farms. Contact us if you need more." },
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
