"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EditStudentDialog } from "./EditStudentDialog";

type StudentItem = {
  id: string;
  full_name: string;
  roll_no: string | null;
  phone: string | null;
  created_at: string;
  class?: { id: string; name: string; section: string } | null;
};

export function StudentList({
  students,
  classes,
}: {
  students: StudentItem[];
  classes: { id: string; name: string; section: string }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return students;

    return students.filter((x) => {
      const hay = [
        x.full_name,
        x.roll_no ?? "",
        x.phone ?? "",
        x.class ? `${x.class.name}-${x.class.section}` : "",
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(s);
    });
  }, [q, students]);

  async function remove(studentId: string) {
    const ok = confirm("Delete this student?");
    if (!ok) return;

    const res = await fetch("/api/students", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ studentId }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Failed to delete");
      return;
    }

    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <input
          className="w-full border rounded-lg px-3 py-2"
          placeholder="Search: name / roll / phone / class..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {pending && <span className="text-xs opacity-70">Updating...</span>}
      </div>

      <div className="space-y-2">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between border rounded-lg px-3 py-2"
          >
            <div>
              <div className="font-medium">{s.full_name}</div>
              <div className="text-sm opacity-70">
                Class: {s.class ? `${s.class.name}-${s.class.section}` : "-"} •
                Roll: {s.roll_no ?? "-"} • Phone: {s.phone ?? "-"}
              </div>
            </div>

            <div className="flex gap-2">
              <EditStudentDialog student={s} classes={classes} />
              <button
                disabled={pending}
                onClick={() => remove(s.id)}
                className="border rounded-lg px-3 py-1.5 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-sm opacity-70">No matching students.</p>
        )}
      </div>
    </div>
  );
}
