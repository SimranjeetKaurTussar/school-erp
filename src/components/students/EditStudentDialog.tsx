"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ClassItem = { id: string; name: string; section: string };

export function EditStudentDialog({
  student,
  classes,
}: {
  student: any;
  classes: ClassItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const [fullName, setFullName] = useState(student.full_name);
  const [rollNo, setRollNo] = useState(student.roll_no ?? "");
  const [phone, setPhone] = useState(student.phone ?? "");
  const [classId, setClassId] = useState(student.class?.id ?? (classes[0]?.id ?? ""));

  async function save() {
    const res = await fetch("/api/students", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        studentId: student.id,
        fullName,
        rollNo,
        phone,
        classId,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Failed");
      return;
    }

    setOpen(false);
    startTransition(() => router.refresh());
  }

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="border rounded-lg px-3 py-1.5 text-sm"
      >
        Edit
      </button>
    );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-3">
        <h2 className="font-medium">Edit Student</h2>

        <input
          className="w-full border rounded-lg px-3 py-2"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          className="w-full border rounded-lg px-3 py-2"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          placeholder="Roll No"
        />

        <input
          className="w-full border rounded-lg px-3 py-2"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone"
        />

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

        <div className="flex justify-end gap-2">
          <button onClick={() => setOpen(false)} className="border px-3 py-1.5 rounded-lg">
            Cancel
          </button>
          <button
            disabled={pending}
            onClick={save}
            className="border px-3 py-1.5 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
