import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { checkPaymentStatus } from "@/lib/paynow";
import { applyPaidPayment } from "@/lib/subscription";

export async function GET(req: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment || payment.userId !== user.id) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  if (payment.status === "paid") {
    return NextResponse.json({ status: "paid" });
  }
  if (!payment.pollUrl) {
    return NextResponse.json({ status: payment.status });
  }

  const { status, paid } = await checkPaymentStatus(payment.pollUrl);
  if (paid) {
    await applyPaidPayment(payment.id);
    return NextResponse.json({ status: "paid" });
  }
  if (status === "cancelled" || status === "failed") {
    await prisma.payment.update({ where: { id }, data: { status: "cancelled" } });
    return NextResponse.json({ status: "cancelled" });
  }
  return NextResponse.json({ status: payment.status });
}
