import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, isPlatformAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getSession();
  const body = await req.json().catch(() => ({}));
  const message = String(body.message ?? "").trim();
  const type = ["suggestion", "complaint", "question", "review"].includes(body.type)
    ? body.type
    : "suggestion";

  if (message.length < 3) {
    return NextResponse.json({ error: "Please write a message first" }, { status: 400 });
  }

  await prisma.feedback.create({
    data: {
      userId: user?.id ?? null,
      name: user?.name ?? String(body.name ?? "Visitor").slice(0, 100),
      email: user?.email ?? (body.email ? String(body.email).slice(0, 200) : null),
      type,
      message: message.slice(0, 4000),
    },
  });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const user = await getSession();
  if (!isPlatformAdmin(user)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ feedback });
}
