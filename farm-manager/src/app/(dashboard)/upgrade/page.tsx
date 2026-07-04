import { getSession, hasActivePro } from "@/lib/auth";
import { proPriceUsd, paynowConfigured } from "@/lib/paynow";
import { redirect } from "next/navigation";
import { UpgradeClient } from "@/components/UpgradeClient";

export default async function UpgradePage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <UpgradeClient
      pricePerMonth={proPriceUsd()}
      paymentsLive={paynowConfigured()}
      isPro={hasActivePro(user)}
      proExpiresAt={user.planExpiresAt ? user.planExpiresAt.toISOString() : null}
    />
  );
}
