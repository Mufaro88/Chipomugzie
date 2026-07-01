import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const user = await getSession();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-950 text-white">
      <nav className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">Chipomugzie</h1>
        <div className="space-x-4">
          <Link href="/login" className="text-white hover:text-green-200 transition-colors">
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-white text-green-800 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Smart Farm Management
            <span className="block text-green-300">for African Farmers</span>
          </h2>
          <p className="text-xl text-green-100 mb-10 leading-relaxed">
            Track your livestock, crops, and farm operations. Get monthly reports
            with charts and trends — no more handwritten lists. Simple enough for
            anyone to use.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-green-800 px-8 py-4 rounded-xl text-lg font-bold hover:bg-green-50 transition-colors shadow-lg"
          >
            Start Managing Your Farm
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="text-3xl mb-4">&#x1F404;</div>
            <h3 className="text-xl font-bold mb-2">Livestock Census</h3>
            <p className="text-green-100">
              Track beef, dairy, goats, and poultry. Monthly stock counts with
              births, deaths, sales, and movements — closing stock calculated
              automatically.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="text-3xl mb-4">&#x1F4CA;</div>
            <h3 className="text-xl font-bold mb-2">Charts &amp; Trends</h3>
            <p className="text-green-100">
              See your herd size, laying percentage, milk yield, and more — all
              on beautiful charts. Spot changes instantly without reading long
              reports.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-6">
            <div className="text-3xl mb-4">&#x1F4C4;</div>
            <h3 className="text-xl font-bold mb-2">Printable Reports</h3>
            <p className="text-green-100">
              Generate professional monthly reports you can print and file. Every
              change is logged so numbers are always accountable.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
