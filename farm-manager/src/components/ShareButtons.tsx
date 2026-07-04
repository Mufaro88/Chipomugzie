"use client";

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
