"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

type ClassItem = { id: string; name: string; section: string };
type StudentItem = { id: string; full_name: string; class_id: string | null };
type StatusMap = Record<string, "PRESENT" | "ABSENT">;

export function AttendanceClient({
  classes,
  students,
}: {
  classes: ClassItem[];
  students: StudentItem[];
}) {
  const [pending, startTransition] = useTransition();

  // stable today value (doesn't change each render)
  const [today] = useState(() => new Date().toISOString().slice(0, 10));

  const [classId, setClassId] = useState(() => classes[0]?.id ?? "");
  const [date, setDate] = useState(() => today);
  const [status, setStatus] = useState<StatusMap>({});
  const [loading, setLoading] = useState(false);

  // if classes load later, set initial classId once
  useEffect(() => {
    if (!classId && classes.length > 0) setClassId(classes[0].id);
  }, [classes, classId]);

  const classStudents = useMemo(() => {
    return students.filter((s) => s.class_id === classId);
  }, [students, classId]);

  // Load saved attendance when class/date changes
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!classId || !date) return;
      setLoading(true);

      const res = await fetch("/api/attendance/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ classId, date }),
      });

      const data = await res.json();

      if (cancelled) return;
      setLoading(false);

      if (!res.ok) {
        console.log(data?.error || "Failed to load attendance");
        return;
      }

      const map: StatusMap = {};
      (data.entries ?? []).forEach((e: any) => {
        map[e.student_id] = e.status === "ABSENT" ? "ABSENT" : "PRESENT";
      });

      setStatus(map);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [classId, date]); // IMPORTANT: only these deps

  function toggle(studentId: string) {
    setStatus((prev) => {
      const cur = prev[studentId] ?? "PRESENT";
      return { ...prev, [studentId]: cur === "PRESENT" ? "ABSENT" : "PRESENT" };
    });
  }

  async function save() {
    if (!classId || !date) return;

    const payload = {
      classId,
      date,
      entries: classStudents.map((s) => ({
        studentId: s.id,
        status: status[s.id] ?? "PRESENT",
      })),
    };

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Failed to save attendance");
      return;
    }

    alert("Attendance saved ✅");
  }

  return (
    <div className="border rounded-xl p-4 space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="border rounded-lg px-3 py-2"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}-{c.section}
            </option>
          ))}
        </select>

        <input
          className="border rounded-lg px-3 py-2"
          type="date"
          value={date}
          max={today}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          className="border rounded-lg px-4 py-2"
          onClick={() => startTransition(save)}
          disabled={pending || !classId || !date}
        >
          Save Attendance
        </button>

        {loading && <span className="text-sm opacity-70">Loading...</span>}
      </div>

      <div className="space-y-2">
        {classStudents.map((s) => {
          const st = status[s.id] ?? "PRESENT";
          return (
            <div
              key={s.id}
              className="border rounded-lg px-3 py-2 flex justify-between items-center"
            >
              <div className="font-medium">{s.full_name}</div>
              <button
                type="button"
                onClick={() => toggle(s.id)}
                className="border rounded-lg px-3 py-1.5 text-sm"
              >
                {st}
              </button>
            </div>
          );
        })}

        {classStudents.length === 0 && (
          <p className="text-sm opacity-70">No students in this class yet.</p>
        )}
      </div>
    </div>
  );
}
