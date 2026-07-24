import Link from "next/link";
import { getSession } from "@/lib/auth";
import { proPriceUsd } from "@/lib/paynow";
import { redirect } from "next/navigation";
import { LandingPreview } from "@/components/LandingPreview";

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

        {/* Live preview */}
        <section className="max-w-6xl mx-auto px-6 pb-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold">See what you get</h3>
            <p className="text-stone-600 mt-1">A real monthly report, the way it looks on your phone.</p>
          </div>
          <LandingPreview />
        </section>

        {/* Real farmer */}
        <section className="bg-orange-50 py-16">
          <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 rounded-2xl overflow-hidden bg-orange-100 aspect-[4/3] shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/murimi-mukuru.jpg"
                  alt="Murimi Mukuru in her dairy parlour"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden bg-orange-100 aspect-square shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/murimi-team.jpg"
                  alt="Murimi Mukuru with her farm team"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-2xl bg-white border border-orange-100 shadow-sm flex flex-col justify-center p-4">
                <p className="text-3xl font-bold text-orange-700">20+</p>
                <p className="text-sm text-stone-600 leading-snug">years keeping farm records, now in her pocket.</p>
              </div>
            </div>
            <div>
              <p className="inline-block bg-white text-orange-800 px-3 py-1 rounded-full text-xs font-medium mb-4 border border-orange-200">
                A real farmer, a real farm
              </p>
              <h3 className="text-3xl font-bold leading-tight mb-4">
                Meet Murimi Mukuru
              </h3>
              <p className="text-lg text-stone-700 leading-relaxed mb-4">
                Murimi Mukuru has run her dairy and horticulture farm for over twenty years, with
                the numbers kept in notebooks. Now every count, every litre of milk and every
                dollar lives in one place she can open on her phone.
              </p>
              <p className="text-stone-600 leading-relaxed mb-6">
                Her managers upload the month&apos;s records, the app works out the totals, and she
                sees exactly what happened on the farm at a glance. No more lost books.
              </p>
              <Link
                href="/signup"
                className="inline-block bg-orange-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
              >
                Keep your farm like Murimi Mukuru
              </Link>
            </div>
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
                <li className="flex gap-3"><span className="text-orange-600">✓</span> One farm, two animal types</li>
                <li className="flex gap-3"><span className="text-orange-600">✓</span> Monthly census with crops</li>
                <li className="flex gap-3"><span className="text-orange-600">✓</span> Your last 3 monthly reports</li>
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
                <li className="flex gap-3"><span>✓</span> All 5 animal types + crops</li>
                <li className="flex gap-3"><span>✓</span> Money tracking (feed, wages, fuel)</li>
                <li className="flex gap-3"><span>✓</span> Full history, every report forever</li>
                <li className="flex gap-3"><span>✓</span> Up to 3 farms · EcoCash &amp; card</li>
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
