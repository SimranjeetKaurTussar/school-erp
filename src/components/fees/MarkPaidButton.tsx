"use client";

import { useRouter } from "next/navigation";

export function MarkPaidButton({ feeId }: { feeId: string }) {
  const router = useRouter();

  async function pay() {
    await fetch("/api/fees", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ feeId }),
    });

    router.refresh();
  }

  return (
    <button onClick={pay} className="border rounded-lg px-3 py-1.5 text-sm">
      Mark Paid
    </button>
  );
}
