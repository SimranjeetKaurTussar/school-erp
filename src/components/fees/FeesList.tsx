"use client";

import { useMemo, useState } from "react";
import { MarkPaidButton } from "@/components/fees/MarkPaidButton";

export function FeesList({ fees }: { fees: any[] }) {
  const [tab, setTab] = useState<"ALL" | "DUE" | "PAID">("ALL");
  const [q, setQ] = useState("");
  const [month, setMonth] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();

    return fees.filter((f) => {
      if (tab !== "ALL" && f.status !== tab) return false;
      if (month && (f.month ?? "") !== month) return false;

      if (!s) return true;

      const hay = [
        f.student?.full_name ?? "",
        f.fee_type ?? "",
        f.month ?? "",
        String(f.amount ?? ""),
        f.receipt_no ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(s);
    });
  }, [fees, tab, q, month]);

  const months = useMemo(() => {
    const set = new Set<string>();
    fees.forEach((f) => {
      if (f.month) set.add(f.month);
    });
    return Array.from(set).sort().reverse();
  }, [fees]);

  return (
    <div className="border rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <TabButton active={tab === "ALL"} onClick={() => setTab("ALL")}>
            All
          </TabButton>
          <TabButton active={tab === "DUE"} onClick={() => setTab("DUE")}>
            Due
          </TabButton>
          <TabButton active={tab === "PAID"} onClick={() => setTab("PAID")}>
            Paid
          </TabButton>
        </div>

        <div className="flex gap-2 items-center">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          >
            <option value="">All months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <input
            className="border rounded-lg px-3 py-2 text-sm w-60"
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        {filtered.map((f) => (
          <div
            key={f.id}
            className="border rounded-lg px-3 py-2 flex justify-between items-center"
          >
            <div>
              <div className="font-medium">{f.student?.full_name}</div>
              <div className="text-sm opacity-70">
                {f.fee_type} {f.month ? `(${f.month})` : ""} • ₹{f.amount} •{" "}
                {f.status}
              </div>

              {f.status === "PAID" && (
                <div className="flex gap-2">
                  <div className="text-xs opacity-70">
                    Receipt: {f.receipt_no ?? "-"} • Paid:{" "}
                    {f.paid_at
                      ? String(f.paid_at).replace("T", " ").slice(0, 16)
                      : "-"}
                  </div>
                  <a
                    className="text-xs underline opacity-80"
                    href={`/app/fees/receipt/${f.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open Receipt
                  </a>
                </div>
              )}
            </div>

            {f.status === "DUE" ? <MarkPaidButton feeId={f.id} /> : null}
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm opacity-70">No records found.</p>
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`border rounded-lg px-3 py-2 text-sm ${
        active ? "bg-muted" : ""
      }`}
    >
      {children}
    </button>
  );
}
