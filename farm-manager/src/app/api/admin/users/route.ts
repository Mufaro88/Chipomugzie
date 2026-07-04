import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, isPlatformAdmin } from "@/lib/auth";

export async function GET() {
  const user = await getSession();
  if (!isPlatformAdmin(user)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, phone: true, role: true,
      plan: true, planExpiresAt: true, createdAt: true,
      _count: { select: { ownedFarms: true } },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { status: true, amountUsd: true, months: true, createdAt: true, method: true },
      },
    },
  });
  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const admin = await getSession();
  if (!isPlatformAdmin(admin)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { userId, action } = body as { userId?: string; action?: string };
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (action === "activate") {
    const months = [1, 3, 6, 12].includes(Number(body.months)) ? Number(body.months) : 1;
    const now = Date.now();
    const currentExpiry = target.planExpiresAt?.getTime() ?? 0;
    const base = target.plan === "pro" && currentExpiry > now ? currentExpiry : now;
    const expiresAt = new Date(base + months * 30 * 24 * 60 * 60 * 1000);
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { plan: "pro", planExpiresAt: expiresAt },
    });
    return NextResponse.json({ ok: true, plan: updated.plan, planExpiresAt: updated.planExpiresAt });
  }

  if (action === "deactivate") {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { plan: "free", planExpiresAt: null },
    });
    return NextResponse.json({ ok: true, plan: updated.plan, planExpiresAt: null });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
