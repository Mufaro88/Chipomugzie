import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import crypto from "crypto";

// Team management: the farm owner sees everyone with access and creates
// invite links for managers (can enter data) and viewers (can only look).

export async function GET() {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const farms = await prisma.farm.findMany({
    where: { ownerId: user.id },
    include: {
      owner: { select: { name: true, email: true } },
      farmAccess: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
      invites: { where: { usedById: null }, orderBy: { createdAt: "desc" } },
    },
  });
  return NextResponse.json({ farms });
}

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { farmId, role } = body as { farmId?: string; role?: string };
  if (!farmId || !["manager", "viewer", "admin"].includes(role ?? "")) {
    return NextResponse.json({ error: "Choose a farm and a role" }, { status: 400 });
  }

  const farm = await prisma.farm.findUnique({ where: { id: farmId } });
  if (!farm || farm.ownerId !== user.id) {
    return NextResponse.json({ error: "Only the farm owner can invite people" }, { status: 403 });
  }

  const invite = await prisma.farmInvite.create({
    data: { farmId, role: role!, code: crypto.randomBytes(8).toString("hex") },
  });
  return NextResponse.json({
    invite: { id: invite.id, role: invite.role, code: invite.code },
    url: `${new URL(req.url).origin}/join/${invite.code}`,
  });
}

export async function DELETE(req: Request) {
  const user = await getSession();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { accessId, inviteId } = body as { accessId?: string; inviteId?: string };

  if (accessId) {
    const access = await prisma.farmAccess.findUnique({ where: { id: accessId }, include: { farm: true } });
    if (!access || access.farm.ownerId !== user.id) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }
    await prisma.farmAccess.delete({ where: { id: accessId } });
    return NextResponse.json({ ok: true });
  }
  if (inviteId) {
    const invite = await prisma.farmInvite.findUnique({ where: { id: inviteId }, include: { farm: true } });
    if (!invite || invite.farm.ownerId !== user.id) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }
    await prisma.farmInvite.delete({ where: { id: inviteId } });
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Nothing to remove" }, { status: 400 });
}
