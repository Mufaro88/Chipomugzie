import { prisma } from "./db";

// Marks a payment paid and extends the user's Pro plan by the paid months.
// Safe to call twice: a payment already marked paid is skipped.
export async function applyPaidPayment(paymentId: string) {
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment || payment.status === "paid") return payment;

    const user = await tx.user.findUnique({ where: { id: payment.userId } });
    if (!user) return payment;

    const now = Date.now();
    const currentExpiry = user.planExpiresAt?.getTime() ?? 0;
    const base = user.plan === "pro" && currentExpiry > now ? currentExpiry : now;
    const expiresAt = new Date(base + payment.months * 30 * 24 * 60 * 60 * 1000);

    await tx.user.update({
      where: { id: user.id },
      data: { plan: "pro", planExpiresAt: expiresAt },
    });
    return tx.payment.update({
      where: { id: payment.id },
      data: { status: "paid", paidAt: new Date() },
    });
  });
}
