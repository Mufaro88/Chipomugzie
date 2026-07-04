"use client";

import { useState } from "react";

const TYPES = [
  { value: "suggestion", label: "💡 Suggestion" },
  { value: "complaint", label: "😠 Complaint" },
  { value: "question", label: "❓ Question" },
  { value: "review", label: "⭐ Review" },
];

export default function ContactPage() {
  const [type, setType] = useState("suggestion");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setState("sending");
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, message }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Could not send — please try again");
      setState("idle");
      return;
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="max-w-lg mx-auto mt-20 bg-white rounded-2xl shadow-sm border border-orange-100 p-8 text-center">
        <p className="text-4xl mb-3">🙏</p>
        <h2 className="text-xl font-bold text-stone-900 mb-2">Thank you!</h2>
        <p className="text-stone-600">
          Your message went straight to the Pocket Book team. We read every single one.
        </p>
        <button
          onClick={() => {
            setMessage("");
            setState("idle");
          }}
          className="mt-6 text-orange-700 font-medium hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900">Contact Us</h2>
        <p className="text-stone-500">
          Suggestions, complaints, questions or a review — we want to hear it.
        </p>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`py-2 px-3 rounded-lg text-sm font-medium border text-left transition-colors ${
                type === t.value
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-stone-700 border-stone-200 hover:border-orange-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Tell us what's on your mind…"
          className="w-full border border-stone-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        {error && (
          <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={state === "sending"}
          className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Send Message"}
        </button>
      </form>
    </div>
  );
}
