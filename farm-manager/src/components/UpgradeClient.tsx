"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const PLAN_MONTHS = [
  { months: 1, label: "1 month" },
  { months: 3, label: "3 months" },
  { months: 6, label: "6 months" },
  { months: 12, label: "12 months" },
];

const PRO_BENEFITS = [
  "Add more than one farm",
  "Unlimited monthly reports and history",
  "Spreadsheet import for fast census entry",
  "Priority support from the Pocket Book team",
];

export function UpgradeClient({
  pricePerMonth,
  paymentsLive,
  isPro,
  proExpiresAt,
  referralCode,
}: {
  pricePerMonth: number;
  paymentsLive: boolean;
  isPro: boolean;
  proExpiresAt: string | null;
  referralCode: string;
}) {
  const router = useRouter();
  const [months, setMonths] = useState(1);
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "starting" | "waiting" | "paid" | "manual">("idle");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");
  const pollTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearInterval(pollTimer.current);
    };
  }, []);

  async function startPayment() {
    setError("");
    setState("starting");
    try {
      const res = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ months, phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start payment");

      if (data.manual) {
        setState("manual");
        return;
      }

      setInstructions(data.instructions || "Check your phone and enter your EcoCash PIN to approve the payment.");
      setState("waiting");
      pollTimer.current = setInterval(async () => {
        const statusRes = await fetch(`/api/payments/status?id=${data.paymentId}`);
        const statusData = await statusRes.json();
        if (statusData.status === "paid") {
          if (pollTimer.current) clearInterval(pollTimer.current);
          setState("paid");
          setTimeout(() => router.push("/dashboard"), 2500);
        } else if (statusData.status === "cancelled") {
          if (pollTimer.current) clearInterval(pollTimer.current);
          setState("idle");
          setError("The payment was cancelled. You can try again.");
        }
      }, 5000);
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const total = (pricePerMonth * months).toFixed(2);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900">Go Pro</h2>
        <p className="text-stone-500">Grow your farm records without limits.</p>
      </div>

      {isPro && (
        <div className="bg-teal-50 border border-teal-200 text-teal-900 rounded-xl p-4 mb-6">
          <p className="font-semibold">You are on the Pro plan. 🎉</p>
          {proExpiresAt && (
            <p className="text-sm mt-1">
              Active until {new Date(proExpiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.
              Paying again adds more time.
            </p>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white p-6">
          <p className="text-sm uppercase tracking-wide text-orange-100">Pro plan</p>
          <p className="text-4xl font-bold mt-1">
            ${pricePerMonth}
            <span className="text-lg font-normal text-orange-100"> / month</span>
          </p>
        </div>

        <div className="p-6">
          <ul className="space-y-3 mb-6">
            {PRO_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 text-stone-700">
                <span className="text-orange-600 font-bold mt-0.5">✓</span>
                {benefit}
              </li>
            ))}
          </ul>

          {state === "paid" ? (
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-6 text-center">
              <p className="text-3xl mb-2">🎉</p>
              <p className="font-bold text-teal-900">Payment received — you are now Pro!</p>
              <p className="text-sm text-teal-800 mt-1">Taking you back to your dashboard...</p>
            </div>
          ) : state === "manual" ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="font-bold text-stone-900 mb-2">Almost there — pay the Pocket Book team directly</p>
              <p className="text-stone-700 text-sm leading-relaxed">
                Automatic EcoCash payments are being switched on. For now, send{" "}
                <strong>${total}</strong> to the Pocket Book team by EcoCash or bank
                transfer, and your Pro plan will be activated the same day. Your
                request has been recorded.
              </p>
            </div>
          ) : state === "waiting" ? (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
              <p className="text-3xl mb-2">📱</p>
              <p className="font-bold text-stone-900">Check your phone now</p>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">{instructions}</p>
              <p className="text-xs text-stone-400 mt-4">Waiting for your approval…</p>
            </div>
          ) : (
            <>
              <label className="block text-sm font-medium text-stone-700 mb-2">How long?</label>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {PLAN_MONTHS.map((option) => (
                  <button
                    key={option.months}
                    type="button"
                    onClick={() => setMonths(option.months)}
                    className={`py-2 rounded-lg text-sm font-medium border transition-colors ${
                      months === option.months
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-white text-stone-700 border-stone-200 hover:border-orange-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {paymentsLive && (
                <>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Your EcoCash number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0771234567"
                    className="w-full border border-stone-200 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </>
              )}

              {error && (
                <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm mb-4">{error}</p>
              )}

              <button
                onClick={startPayment}
                disabled={state === "starting"}
                className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-700 transition-colors disabled:opacity-60"
              >
                {state === "starting"
                  ? "Starting…"
                  : paymentsLive
                    ? `Pay $${total} with EcoCash`
                    : `Request Pro — $${total}`}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Referral card */}
      <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-6 mt-8">
        <h3 className="font-bold text-stone-900 mb-1">🎁 Give a month, get a month</h3>
        <p className="text-sm text-stone-600 mb-4">
          Invite a farming friend with your code. When they sign up with it, you BOTH
          get a free month of Pro. No limit — invite ten friends, get ten months.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-mono text-lg font-bold bg-teal-50 border border-teal-200 text-teal-900 rounded-lg px-4 py-2 tracking-wider">
            {referralCode}
          </span>
          <button
            type="button"
            onClick={() => {
              const text = encodeURIComponent(
                `I keep my farm records on The Farmer's Pocket Book 🌅 — livestock, crops, money, all in one place with monthly charts.\n\nSign up free here: ${window.location.origin}/signup?invite=${referralCode}\n\nUse my invite code ${referralCode} and we both get a free month of Pro!`
              );
              window.open(`https://wa.me/?text=${text}`, "_blank");
            }}
            className="bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            Invite on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
