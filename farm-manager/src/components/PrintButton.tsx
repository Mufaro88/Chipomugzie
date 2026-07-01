"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
    >
      Print Report
    </button>
  );
}
