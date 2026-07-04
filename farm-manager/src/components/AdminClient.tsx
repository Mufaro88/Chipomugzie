"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  plan: string;
  planExpiresAt: string | null;
  createdAt: string;
  _count: { ownedFarms: number };
  payments: { status: string; amountUsd: number; months: number; createdAt: string; method: string }[];
};

export function AdminClient() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [monthsByUser, setMonthsByUser] = useState<Record<string, number>>({});

  const [feedback, setFeedback] = useState<
    { id: string; name: string; email: string | null; type: string; message: string; createdAt: string }[]
  >([]);

  async function load() {
    const [usersRes, feedbackRes] = await Promise.all([
      fetch("/api/admin/users"),
      fetch("/api/feedback"),
    ]);
    const usersData = await usersRes.json();
    const feedbackData = await feedbackRes.json();
    setUsers(usersData.users ?? []);
    setFeedback(feedbackData.feedback ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function act(userId: string, action: "activate" | "deactivate") {
    setBusy(userId);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, action, months: monthsByUser[userId] ?? 1 }),
    });
    await load();
    setBusy(null);
  }

  const proCount = users.filter((u) => u.plan === "pro").length;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900">Founder Control Panel</h2>
        <p className="text-stone-500">Every account on the platform. Activate or pause Pro plans here.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100">
          <p className="text-xs text-stone-500 uppercase tracking-wide">Accounts</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100">
          <p className="text-xs text-stone-500 uppercase tracking-wide">Pro</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{proCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 border border-orange-100">
          <p className="text-xs text-stone-500 uppercase tracking-wide">Free</p>
          <p className="text-2xl font-bold text-stone-900 mt-1">{users.length - proCount}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-stone-500">Loading accounts…</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-orange-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-stone-500 uppercase tracking-wide border-b border-stone-100">
                <th className="px-4 py-3">Person</th>
                <th className="px-4 py-3">Farms</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Last payment</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-stone-50 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-stone-900">{u.name}</p>
                    <p className="text-stone-500 text-xs">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-700">{u._count.ownedFarms}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        u.plan === "pro"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {u.plan === "pro" ? "Pro" : "Free"}
                    </span>
                    {u.plan === "pro" && u.planExpiresAt && (
                      <p className="text-xs text-stone-400 mt-1">
                        until {new Date(u.planExpiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-xs">
                    {u.payments[0]
                      ? `$${u.payments[0].amountUsd} · ${u.payments[0].months}mo · ${u.payments[0].status} (${u.payments[0].method})`
                      : ", "}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={monthsByUser[u.id] ?? 1}
                        onChange={(e) =>
                          setMonthsByUser((m) => ({ ...m, [u.id]: Number(e.target.value) }))
                        }
                        className="border border-stone-200 rounded-lg px-2 py-1 text-xs"
                      >
                        {[1, 3, 6, 12].map((n) => (
                          <option key={n} value={n}>{n} mo</option>
                        ))}
                      </select>
                      <button
                        onClick={() => act(u.id, "activate")}
                        disabled={busy === u.id}
                        className="bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-orange-700 disabled:opacity-50"
                      >
                        Give Pro
                      </button>
                      {u.plan === "pro" && (
                        <button
                          onClick={() => act(u.id, "deactivate")}
                          disabled={busy === u.id}
                          className="bg-stone-100 text-stone-700 px-3 py-1 rounded-lg text-xs font-medium hover:bg-stone-200 disabled:opacity-50"
                        >
                          Pause
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-10">
        <h3 className="text-lg font-bold text-stone-900 mb-3">
          Messages from users {feedback.length > 0 && `(${feedback.length})`}
        </h3>
        {feedback.length === 0 ? (
          <p className="text-stone-500 text-sm">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {feedback.map((f) => (
              <div key={f.id} className="bg-white rounded-xl shadow-sm border border-orange-100 p-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-sm font-medium text-stone-900">
                    {f.name}
                    {f.email && <span className="text-stone-400 font-normal"> · {f.email}</span>}
                  </p>
                  <span className="text-xs bg-stone-100 text-stone-600 rounded-full px-2 py-1 capitalize">{f.type}</span>
                </div>
                <p className="text-sm text-stone-700 whitespace-pre-wrap">{f.message}</p>
                <p className="text-xs text-stone-400 mt-2">
                  {new Date(f.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
