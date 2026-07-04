import { getSession, hasActivePro } from "@/lib/auth";
import { proPriceUsd, paynowConfigured } from "@/lib/paynow";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { UpgradeClient } from "@/components/UpgradeClient";

export default async function UpgradePage() {
  const user = await getSession();
  if (!user) redirect("/login");

  // Older accounts were created before invite codes existed, give them one.
  let referralCode = user.referralCode;
  if (!referralCode) {
    const base = user.name.replace(/[^a-zA-Z]/g, "").slice(0, 5).toUpperCase() || "FARM";
    referralCode = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    await prisma.user.update({ where: { id: user.id }, data: { referralCode } });
  }

  return (
    <UpgradeClient
      pricePerMonth={proPriceUsd()}
      paymentsLive={paynowConfigured()}
      isPro={hasActivePro(user)}
      proExpiresAt={user.planExpiresAt ? user.planExpiresAt.toISOString() : null}
      referralCode={referralCode}
      cardPaymentLink={process.env.CARD_PAYMENT_LINK || null}
    />
  );
}
