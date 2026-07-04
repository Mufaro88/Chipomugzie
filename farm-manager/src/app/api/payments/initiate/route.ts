import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { initiateMobilePayment, paynowConfigured, proPriceUsd } from "@/lib/paynow";

export async function POST(req: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const months = [1, 3, 6, 12].includes(Number(body.months)) ? Number(body.months) : 1;
  const phone = String(body.phone ?? "").replace(/[^\d+]/g, "");
  const amountUsd = proPriceUsd() * months;
  const reference = `FPB-${user.id.slice(-6)}-${Date.now()}`;

  if (!paynowConfigured()) {
    await prisma.payment.create({
      data: {
        userId: user.id, plan: "pro", months, amountUsd,
        method: "manual", phone: phone || null, reference, status: "created",
      },
    });
    return NextResponse.json({ manual: true, reference, amountUsd });
  }

  if (!/^(\+263|0)7\d{8}$/.test(phone)) {
    return NextResponse.json(
      { error: "Enter a valid Zimbabwe mobile number, e.g. 0771234567" },
      { status: 400 }
    );
  }

  const payment = await prisma.payment.create({
    data: {
      userId: user.id, plan: "pro", months, amountUsd,
      method: "ecocash", phone, reference, status: "created",
    },
  });

  try {
    const origin = new URL(req.url).origin;
    const { pollUrl, instructions } = await initiateMobilePayment({
      reference,
      amountUsd,
      phone,
      email: user.email,
      resultUrl: `${origin}/api/payments/result`,
    });
    await prisma.payment.update({
      where: { id: payment.id },
      data: { pollUrl, status: "sent" },
    });
    return NextResponse.json({ paymentId: payment.id, instructions, amountUsd });
  } catch (err) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "failed" },
    });
    const message = err instanceof Error ? err.message : "Payment failed to start";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
