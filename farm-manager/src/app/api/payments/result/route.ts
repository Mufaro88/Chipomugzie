import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkPaymentStatus } from "@/lib/paynow";
import { applyPaidPayment } from "@/lib/subscription";

// Paynow server-to-server callback. We never trust the posted fields —
// we re-check the payment against the poll URL we stored at initiation.
export async function POST(req: Request) {
  const raw = await req.text();
  const params = new URLSearchParams(raw);
  const reference = params.get("reference");
  if (!reference) return NextResponse.json({ ok: true });

  const payment = await prisma.payment.findUnique({ where: { reference } });
  if (!payment || !payment.pollUrl || payment.status === "paid") {
    return NextResponse.json({ ok: true });
  }

  const { paid, status } = await checkPaymentStatus(payment.pollUrl);
  if (paid) {
    await applyPaidPayment(payment.id);
  } else if (status === "cancelled" || status === "failed") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "cancelled" },
    });
  }
  return NextResponse.json({ ok: true });
}

export async function GET() {
  // Paynow may also send the customer's browser here after payment.
  return NextResponse.redirect(
    new URL("/upgrade", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  );
}
