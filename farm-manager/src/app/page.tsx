import Link from "next/link";
import { getSession } from "@/lib/auth";
import { proPriceUsd } from "@/lib/paynow";
import { redirect } from "next/navigation";

const FEATURES = [
  {
    icon: "🐄",
    title: "Livestock Census",
    text: "Beef, dairy, goats and poultry. Monthly counts with births, deaths, sales and movements. Closing stock is worked out for you.",
  },
  {
    icon: "📈",
    title: "Charts & Trends",
    text: "Herd size, laying percentage, milk yield and more on clear charts. See what changed at a glance.",
  },
  {
    icon: "🖨️",
    title: "Printable Reports",
    text: "Professional monthly reports you can print and file. Every change is logged, so numbers stay honest.",
  },
  {
    icon: "📋",
    title: "Spreadsheet Import",
    text: "Managers can fill an Excel template or paste their numbers. No slow typing into small boxes.",
  },
];

export default async function HomePage() {
  const user = await getSession();
  if (user) redirect("/dashboard");
  const price = proPriceUsd();

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-stone-900">
      <nav className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌅</span>
          <h1 className="text-xl font-bold tracking-tight">
            The Farmer&apos;s <span className="text-orange-700">Pocket Book</span>
          </h1>
        </div>
        <div className="space-x-3">
          <Link href="/login" className="text-stone-700 font-medium hover:text-orange-700 transition-colors">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="inline-block bg-amber-100 text-amber-900 px-4 py-1 rounded-full text-sm font-medium mb-6">
              For farmers everywhere, on any phone
            </p>
            <h2 className="text-5xl font-bold leading-tight mb-6">
              Your whole farm,
              <span className="block text-orange-700">in your pocket.</span>
            </h2>
            <p className="text-xl text-stone-600 mb-10 leading-relaxed">
              Track livestock, crops and production. Get monthly reports with
              charts your whole family can understand. No more lost notebooks, and
              simple enough for anyone to use.
            </p>
            <Link
              href="/signup"
              className="inline-block bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-200"
            >
              Start Your Pocket Book for Free
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gradient-to-b from-[#FFF8F0] to-orange-50 py-16">
          <div className="max-w-6xl mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 max-w-4xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-center mb-3">Simple, honest pricing</h3>
          <p className="text-stone-600 text-center mb-12">Start free. Upgrade when your farm grows.</p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200">
              <p className="text-sm font-medium text-stone-500 uppercase tracking-wide">Free</p>
              <p className="text-4xl font-bold mt-2 mb-6">$0</p>
              <ul className="space-y-3 text-stone-700 mb-8">
                <li className="flex gap-3"><span className="text-orange-600">✓</span> One farm</li>
                <li className="flex gap-3"><span className="text-orange-600">✓</span> Monthly livestock census</li>
                <li className="flex gap-3"><span className="text-orange-600">✓</span> Charts and printable reports</li>
                <li className="flex gap-3"><span className="text-orange-600">✓</span> Manager &amp; viewer access</li>
              </ul>
              <Link
                href="/signup"
                className="block text-center border border-orange-600 text-orange-700 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors"
              >
                Start Free
              </Link>
            </div>

            <div className="bg-gradient-to-br from-orange-600 to-amber-500 rounded-2xl p-8 shadow-lg text-white relative">
              <p className="text-sm font-medium text-orange-100 uppercase tracking-wide">Pro</p>
              <p className="text-4xl font-bold mt-2 mb-6">
                ${price}<span className="text-lg font-normal text-orange-100">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex gap-3"><span>✓</span> Everything in Free</li>
                <li className="flex gap-3"><span>✓</span> More than one farm</li>
                <li className="flex gap-3"><span>✓</span> Spreadsheet import</li>
                <li className="flex gap-3"><span>✓</span> Pay easily with EcoCash</li>
              </ul>
              <Link
                href="/signup"
                className="block text-center bg-white text-orange-700 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors"
              >
                Go Pro
              </Link>
            </div>
          </div>
        </section>

        <footer className="border-t border-orange-100 py-8 text-center text-stone-400 text-sm">
          The Farmer&apos;s Pocket Book. Farm records made simple.
        </footer>
      </main>
    </div>
  );
}
