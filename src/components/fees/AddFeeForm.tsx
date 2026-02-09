"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function AddFeeForm({ students }: { students: any[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [feeType, setFeeType] = useState("Monthly");
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ studentId, feeType, month, amount }),
    });

    if (!res.ok) {
      const d = await res.json();
      alert(d?.error);
      return;
    }

    setAmount("");
    setMonth("");

    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={submit} className="border rounded-xl p-4 space-y-3">
      <h2 className="font-medium">Create Fee</h2>

      <select
        className="w-full border rounded-lg px-3 py-2"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
      >
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.full_name}
          </option>
        ))}
      </select>

      <input
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Fee Type (Monthly / Admission)"
        value={feeType}
        onChange={(e) => setFeeType(e.target.value)}
      />

      <input
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Month (e.g. 2026-02)"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
      />

      <input
        className="w-full border rounded-lg px-3 py-2"
        placeholder="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button className="border rounded-lg px-4 py-2" disabled={pending}>
        Add Fee
      </button>
    </form>
  );
}
