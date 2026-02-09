"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ClassItem = { id: string; name: string; section: string };

export function AddStudentForm({
  classes,
}: {
  classes: ClassItem[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [fullName, setFullName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [phone, setPhone] = useState("");
  const [classId, setClassId] = useState(classes[0]?.id ?? "");
  const [msg, setMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => fullName.trim().length > 0, [fullName]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!canSubmit) {
      setMsg("Student name required");
      return;
    }
    if (!classId) {
      setMsg("Please create a class first");
      return;
    }

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        fullName,
        rollNo,
        phone,
        classId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setMsg(data?.error || "Failed to add student");
      return;
    }

    // Clear form
    setFullName("");
    setRollNo("");
    setPhone("");

    // Refresh list
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="border rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Add Student</h2>
        {pending && <span className="text-xs opacity-70">Updating...</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-sm">Full Name</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. Simranjeet Kaur"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Class</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.section}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm">Roll No (optional)</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. 12"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm">Phone (optional)</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="e.g. 98765xxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || pending}
        className="border rounded-lg px-4 py-2"
      >
        Add Student
      </button>

      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
