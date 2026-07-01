"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "&#x1F3E0;" },
  { href: "/census/new", label: "New Census", icon: "&#x1F4DD;" },
  { href: "/farms", label: "My Farms", icon: "&#x1F33E;" },
  { href: "/reports", label: "Reports", icon: "&#x1F4CA;" },
];

export function Sidebar({ userName, userRole }: { userName: string; userRole: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-green-800 text-white p-4 flex justify-between items-center z-50">
        <span className="font-bold text-lg">Chipomugzie</span>
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-64 bg-green-800 text-white flex flex-col z-40
          transition-transform md:translate-x-0
          ${menuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="p-6 border-b border-green-700">
          <h1 className="text-xl font-bold">Chipomugzie</h1>
          <p className="text-green-200 text-sm mt-1">Farm Manager</p>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                pathname === item.href
                  ? "bg-green-700 text-white font-medium"
                  : "text-green-100 hover:bg-green-700/50"
              }`}
            >
              <span dangerouslySetInnerHTML={{ __html: item.icon }} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-green-700">
          <div className="text-sm mb-2">
            <p className="font-medium">{userName}</p>
            <p className="text-green-200 text-xs capitalize">{userRole}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-green-200 hover:text-white transition-colors"
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
