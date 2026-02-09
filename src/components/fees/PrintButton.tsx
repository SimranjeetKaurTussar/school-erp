"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="border rounded-lg px-4 py-2 text-sm"
      type="button"
    >
      Print / Save PDF
    </button>
  );
}
