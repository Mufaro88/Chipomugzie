"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/census/new", label: "New Census", icon: "📝" },
  { href: "/farms", label: "My Farms", icon: "🌾" },
  { href: "/team", label: "My Team", icon: "👥" },
  { href: "/reports", label: "Reports", icon: "📈" },
  { href: "/upgrade", label: "Go Pro", icon: "⭐" },
  { href: "/contact", label: "Contact Us", icon: "💬" },
];

export function Sidebar({
  userName,
  userRole,
  isAdmin,
  planLabel,
}: {
  userName: string;
  userRole: string;
  isAdmin?: boolean;
  planLabel?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const items = isAdmin
    ? [...navItems, { href: "/admin", label: "Control Panel", icon: "🔑" }]
    : navItems;

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-stone-900 text-white p-4 flex justify-between items-center z-50">
        <span className="font-bold text-lg">🌅 Pocket Book</span>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-stone-900 text-white flex flex-col z-40
          transition-transform md:translate-x-0
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6 border-b border-stone-800">
          <h1 className="text-lg font-bold leading-snug">
            🌅 The Farmer&apos;s
            <span className="block text-orange-400">Pocket Book</span>
          </h1>
        </div>

        <nav className="flex-1 py-4">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-orange-600 text-white font-medium"
                  : "text-stone-300 hover:bg-stone-800"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-800">
          <div className="text-sm mb-2">
            <p className="font-medium">{userName}</p>
            <p className="text-stone-400 text-xs capitalize">{userRole}</p>
            {planLabel && (
              <Link
                href="/upgrade"
                className={`inline-block mt-2 text-xs font-medium rounded-full px-3 py-1 ${
                  planLabel.startsWith("Pro")
                    ? "bg-orange-500/20 text-orange-300"
                    : "bg-stone-700 text-stone-300 hover:bg-stone-600"
                }`}
              >
                {planLabel}
              </Link>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-stone-400 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Mobile spacer */}
      <div className="h-14 md:hidden" />
    </>
  );
}
