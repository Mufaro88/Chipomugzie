import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { censusId } = await req.json().catch(() => ({}));
  if (!censusId) return NextResponse.json({ error: "Missing censusId" }, { status: 400 });

  const census = await prisma.monthlyCensus.findUnique({
    where: { id: censusId },
    include: { farm: true },
  });
  if (!census) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const hasAccess =
    census.farm.ownerId === user.id ||
    (await prisma.farmAccess.findFirst({ where: { farmId: census.farmId, userId: user.id } }));
  if (!hasAccess) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const shareToken =
    census.shareToken ??
    (
      await prisma.monthlyCensus.update({
        where: { id: censusId },
        data: { shareToken: crypto.randomBytes(12).toString("hex") },
      })
    ).shareToken;

  return NextResponse.json({ url: `${new URL(req.url).origin}/r/${shareToken}` });
}
