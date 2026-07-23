import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

const TRIAL_DAYS = 14;
const REFERRAL_BONUS_DAYS = 30;

function makeReferralCode(name: string) {
  const base = name.replace(/[^a-zA-Z]/g, "").slice(0, 5).toUpperCase() || "FARM";
  return `${base}${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(req: NextRequest) {
  const { name, email, password, phone, referralCode, joinCode } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email and password are required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const invite = joinCode
    ? await prisma.farmInvite.findUnique({ where: { code: String(joinCode) } })
    : null;
  const joiningFarm = invite && !invite.usedById ? invite : null;

  // While testing with a small group, only allowlisted emails (or people
  // using a farm invite link) can create an account. Leave
  // SIGNUP_ALLOWLIST unset once ready to open sign-ups to everyone.
  const allowlist = (process.env.SIGNUP_ALLOWLIST || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.length > 0 && !joiningFarm && !allowlist.includes(String(email).toLowerCase())) {
    return NextResponse.json(
      { error: "Sign-ups are limited to invited testers right now. Ask the founder for access." },
      { status: 403 }
    );
  }

  // Everyone starts with a free Pro trial; a valid invite code stretches it
  // to a full month and rewards the inviter with an extra month too.
  let referrer = null;
  if (referralCode) {
    referrer = await prisma.user.findUnique({
      where: { referralCode: String(referralCode).trim().toUpperCase() },
    });
  }
  const trialDays = referrer ? REFERRAL_BONUS_DAYS : TRIAL_DAYS;

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      phone,
      role: joiningFarm ? joiningFarm.role : "owner",
      plan: "pro",
      planExpiresAt: new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000),
      referralCode: makeReferralCode(name),
      referredById: referrer?.id ?? null,
    },
  });

  if (joiningFarm) {
    await prisma.farmAccess.create({
      data: { userId: user.id, farmId: joiningFarm.farmId, role: joiningFarm.role },
    });
    await prisma.farmInvite.update({
      where: { id: joiningFarm.id },
      data: { usedById: user.id, usedAt: new Date() },
    });
  }

  if (referrer) {
    const now = Date.now();
    const current = referrer.planExpiresAt?.getTime() ?? 0;
    const base = referrer.plan === "pro" && current > now ? current : now;
    await prisma.user.update({
      where: { id: referrer.id },
      data: {
        plan: "pro",
        planExpiresAt: new Date(base + REFERRAL_BONUS_DAYS * 24 * 60 * 60 * 1000),
      },
    });
  }

  const token = await createToken(user.id);
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email },
    trialDays,
  });
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
