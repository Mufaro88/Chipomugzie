"use client";

import { useState } from "react";

export function ShareLinkButton({ censusId }: { censusId: string }) {
  const [state, setState] = useState<"idle" | "working" | "copied">("idle");

  async function getLink() {
    setState("working");
    const res = await fetch("/api/census/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ censusId }),
    });
    const data = await res.json();
    if (data.url) {
      try {
        await navigator.clipboard.writeText(data.url);
        setState("copied");
        setTimeout(() => setState("idle"), 3000);
      } catch {
        window.prompt("Copy this link:", data.url);
        setState("idle");
      }
    } else {
      setState("idle");
    }
  }

  return (
    <button
      onClick={getLink}
      disabled={state === "working"}
      className="bg-orange-100 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors disabled:opacity-60"
    >
      {state === "copied" ? "✓ Link copied!" : "Copy share link"}
    </button>
  );
}

export function WhatsAppShareButton({ summary }: { summary: string }) {
  function share() {
    const text = encodeURIComponent(summary + "\n\nSent from The Farmer's Pocket Book 🌅");
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }
  return (
    <button
      onClick={share}
      className="bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
    >
      Share on WhatsApp
    </button>
  );
}
