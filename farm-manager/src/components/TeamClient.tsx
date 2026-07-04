"use client";

import { useEffect, useState } from "react";

type Member = {
  id: string;
  role: string;
  user: { id: string; name: string; email: string; phone: string | null };
};
type Invite = { id: string; role: string; code: string };
type TeamFarm = {
  id: string;
  name: string;
  owner: { name: string; email: string };
  farmAccess: Member[];
  invites: Invite[];
};

const ROLE_HELP = [
  { role: "Owner", icon: "👑", text: "That is you. Sees everything, invites people, and approves changes." },
  { role: "Manager", icon: "🧑‍🌾", text: "Enters the monthly numbers and can see the dashboard. Cannot invite people." },
  { role: "Viewer", icon: "👀", text: "Can only look at dashboards and reports. Cannot change anything. Good for family, partners, or the bank." },
];

export function TeamClient() {
  const [farms, setFarms] = useState<TeamFarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [newLink, setNewLink] = useState<{ url: string; role: string } | null>(null);

  async function load() {
    const res = await fetch("/api/team");
    const data = await res.json();
    setFarms(data.farms ?? []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function invite(farmId: string, role: string) {
    setBusy(true);
    setNewLink(null);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmId, role }),
    });
    const data = await res.json();
    if (data.url) setNewLink({ url: data.url, role });
    await load();
    setBusy(false);
  }

  async function remove(body: { accessId?: string; inviteId?: string }) {
    await fetch("/api/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await load();
  }

  function whatsAppInvite(url: string, role: string, farmName: string) {
    const text = encodeURIComponent(
      role === "manager"
        ? `Hi! I want you to enter the monthly farm numbers for ${farmName} on The Farmer's Pocket Book 🌅. Open this link, create your account, and you are in: ${url}`
        : `Hi! I want to show you how ${farmName} is doing. Open this link, create a free account, and you can see the farm dashboard and reports: ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-stone-900">My Team</h2>
        <p className="text-stone-500">Who can see and enter things on your farm.</p>
      </div>

      {/* Who is who */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {ROLE_HELP.map((r) => (
          <div key={r.role} className="bg-white rounded-2xl shadow-sm border border-orange-100 p-4">
            <p className="text-2xl">{r.icon}</p>
            <p className="font-bold text-stone-900 mt-1">{r.role}</p>
            <p className="text-sm text-stone-600 mt-1 leading-relaxed">{r.text}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-stone-500">Loading your team…</p>
      ) : farms.length === 0 ? (
        <p className="text-stone-500 bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
          You do not own a farm yet. Create one from the Dashboard first.
        </p>
      ) : (
        farms.map((farm) => (
          <div key={farm.id} className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6 mb-6">
            <h3 className="font-bold text-stone-900 text-lg mb-4">🌾 {farm.name}</h3>

            <div className="space-y-2 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <div>
                  <p className="font-medium text-stone-900">👑 {farm.owner.name}</p>
                  <p className="text-xs text-stone-400">{farm.owner.email}</p>
                </div>
                <span className="text-xs bg-amber-100 text-amber-900 rounded-full px-3 py-1 font-medium">Owner</span>
              </div>
              {farm.farmAccess.map((member) => (
                <div key={member.id} className="flex items-center justify-between py-2 border-b border-stone-100">
                  <div>
                    <p className="font-medium text-stone-900">
                      {member.role === "manager" ? "🧑‍🌾" : "👀"} {member.user.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      {member.user.email}
                      {member.user.phone ? ` · ${member.user.phone}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-teal-100 text-teal-900 rounded-full px-3 py-1 font-medium capitalize">
                      {member.role}
                    </span>
                    <button
                      onClick={() => remove({ accessId: member.id })}
                      className="text-xs text-stone-400 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {farm.farmAccess.length === 0 && (
                <p className="text-sm text-stone-500 py-2">
                  Nobody else has access yet. Invite your manager below.
                </p>
              )}
            </div>

            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
              <p className="font-medium text-stone-900 mb-3">Invite someone to {farm.name}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => invite(farm.id, "manager")}
                  disabled={busy}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50"
                >
                  🧑‍🌾 Invite a Manager
                </button>
                <button
                  onClick={() => invite(farm.id, "viewer")}
                  disabled={busy}
                  className="bg-white border border-orange-300 text-orange-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-100 disabled:opacity-50"
                >
                  👀 Invite a Viewer
                </button>
              </div>

              {newLink && (
                <div className="mt-4 bg-white border border-teal-200 rounded-lg p-3">
                  <p className="text-sm text-stone-700 mb-2">
                    Invite link created for a <strong className="capitalize">{newLink.role}</strong>. Send it to them:
                  </p>
                  <p className="text-xs font-mono bg-stone-50 border border-stone-200 rounded px-2 py-2 break-all mb-2">
                    {newLink.url}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => whatsAppInvite(newLink.url, newLink.role, farm.name)}
                      className="bg-[#25D366] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-90"
                    >
                      Send on WhatsApp
                    </button>
                    <button
                      onClick={() => navigator.clipboard.writeText(newLink.url)}
                      className="bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-stone-200"
                    >
                      Copy link
                    </button>
                  </div>
                </div>
              )}

              {farm.invites.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-stone-500 mb-2">Invites waiting to be used:</p>
                  {farm.invites.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between text-xs text-stone-600 py-1">
                      <span className="capitalize">{inv.role} invite · code {inv.code.slice(0, 6)}…</span>
                      <button onClick={() => remove({ inviteId: inv.id })} className="text-stone-400 hover:text-red-600">
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
