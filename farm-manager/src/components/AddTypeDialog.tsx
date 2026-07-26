"use client";

import { useState } from "react";

export type CustomClass = { id: string; name: string; sortOrder: number };
export type CustomSection = {
  id: string;
  name: string;
  icon: string;
  classes: CustomClass[];
};

// Ready-made starters so nobody faces an empty box. Tapping one fills
// in the name, the icon and the usual categories for that animal.
const PRESETS: { name: string; icon: string; classes: string[] }[] = [
  { name: "Pigs", icon: "🐖", classes: ["Boars", "Sows", "Gilts", "Weaners", "Piglets"] },
  { name: "Horses", icon: "🐎", classes: ["Stallions", "Mares", "Geldings", "Foals"] },
  { name: "Sheep", icon: "🐑", classes: ["Rams", "Ewes", "Hoggets", "Lambs"] },
  { name: "Rabbits", icon: "🐇", classes: ["Bucks", "Does", "Kits"] },
  { name: "Donkeys", icon: "🫏", classes: ["Jacks", "Jennies", "Foals"] },
  { name: "Turkeys", icon: "🦃", classes: ["Toms", "Hens", "Poults"] },
  { name: "Ducks", icon: "🦆", classes: ["Drakes", "Hens", "Ducklings"] },
  { name: "Fish", icon: "🐟", classes: ["Breeders", "Fingerlings"] },
  { name: "Bees", icon: "🐝", classes: ["Hives"] },
];

const ICONS = ["🐖", "🐎", "🐑", "🐇", "🫏", "🦃", "🦆", "🐟", "🐝", "🐕", "🐈", "🦌", "🐾"];

export function AddTypeDialog({
  farmId,
  onAdded,
  existingNames,
}: {
  farmId: string;
  onAdded: (section: CustomSection) => void;
  existingNames: string[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🐾");
  const [classes, setClasses] = useState<string[]>([]);
  const [newClass, setNewClass] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setName("");
    setIcon("🐾");
    setClasses([]);
    setNewClass("");
    setError("");
  }

  function usePreset(p: (typeof PRESETS)[number]) {
    setName(p.name);
    setIcon(p.icon);
    setClasses(p.classes);
    setError("");
  }

  function addClass() {
    const clean = newClass.trim();
    if (!clean) return;
    if (classes.some((c) => c.toLowerCase() === clean.toLowerCase())) {
      setNewClass("");
      return;
    }
    setClasses((prev) => [...prev, clean]);
    setNewClass("");
  }

  async function save() {
    const clean = name.trim();
    if (!clean) {
      setError("Please type a name, for example Pigs.");
      return;
    }
    if (existingNames.some((n) => n.toLowerCase() === clean.toLowerCase())) {
      setError(`${clean} is already on this farm.`);
      return;
    }

    setSaving(true);
    setError("");
    const res = await fetch("/api/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ farmId, name: clean, icon, classes }),
    });
    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Could not add that type.");
      return;
    }

    onAdded(data.section);
    reset();
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-full text-sm font-medium border border-dashed border-orange-400 text-orange-700 bg-white hover:bg-orange-50"
      >
        ➕ Add another type
      </button>
    );
  }

  return (
    <div className="w-full mt-1 border border-orange-200 rounded-2xl p-4 bg-orange-50/60">
      <p className="font-medium text-stone-900 mb-1">Add something else you keep</p>
      <p className="text-sm text-stone-500 mb-3">
        Pigs, horses, sheep, rabbits, anything. Pick a common one or type your own.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.filter((p) => !existingNames.some((n) => n.toLowerCase() === p.name.toLowerCase())).map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => usePreset(p)}
            className="px-3 py-1.5 rounded-full text-sm bg-white border border-stone-200 hover:border-orange-300 text-stone-700"
          >
            {p.icon} {p.name}
          </button>
        ))}
      </div>

      <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Pigs"
        className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-900 mb-3 bg-white"
      />

      <label className="block text-sm font-medium text-stone-700 mb-1">Picture</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {ICONS.map((ic) => (
          <button
            key={ic}
            type="button"
            onClick={() => setIcon(ic)}
            className={`w-10 h-10 rounded-lg text-xl border ${
              icon === ic ? "border-orange-500 bg-orange-100" : "border-stone-200 bg-white"
            }`}
          >
            {ic}
          </button>
        ))}
      </div>

      <label className="block text-sm font-medium text-stone-700 mb-1">
        Groups you want to count separately
      </label>
      <p className="text-xs text-stone-500 mb-2">
        For pigs this might be Sows, Boars and Piglets. You can leave this empty and just
        count the total.
      </p>
      <div className="flex flex-wrap gap-2 mb-2">
        {classes.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1 bg-white border border-stone-200 rounded-full px-3 py-1 text-sm text-stone-700"
          >
            {c}
            <button
              type="button"
              onClick={() => setClasses((prev) => prev.filter((x) => x !== c))}
              className="text-stone-400 hover:text-red-600 font-bold"
              aria-label={`Remove ${c}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        <input
          value={newClass}
          onChange={(e) => setNewClass(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addClass();
            }
          }}
          placeholder="Type a group and tap Add"
          className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-stone-900 bg-white"
        />
        <button
          type="button"
          onClick={addClass}
          className="px-4 py-2 rounded-lg bg-stone-100 text-stone-700 font-medium hover:bg-stone-200"
        >
          Add
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          {error}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg font-bold hover:bg-orange-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save this type"}
        </button>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="px-4 py-2.5 rounded-lg bg-white border border-stone-200 text-stone-700 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
