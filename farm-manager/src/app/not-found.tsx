import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-orange-100 p-8 text-center">
        <div className="text-5xl mb-4">🌅</div>
        <h1 className="text-xl font-bold text-stone-900 mb-2">
          The Farmer&apos;s Pocket Book
        </h1>
        <p className="text-stone-600 mb-6 leading-relaxed">
          That page was not found. The link may have been typed slightly wrong,
          or the page has moved. Nothing is lost, your records are safe.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
          >
            Go to the start page
          </Link>
          <Link
            href="/login"
            className="block border border-orange-600 text-orange-700 py-3 rounded-xl font-bold hover:bg-orange-50 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
