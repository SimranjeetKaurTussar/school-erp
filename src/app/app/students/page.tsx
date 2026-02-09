import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/org/getCurrentOrg";

export default async function StudentsPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/setup");

  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, roll_no, phone, created_at")
    .eq("organization_id", org.organizationId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Students</h1>

      <div className="border rounded-xl p-4">
        <h2 className="font-medium mb-2">Students List</h2>
        <div className="space-y-2">
          {(students ?? []).map((s) => (
            <div key={s.id} className="flex justify-between border rounded-lg px-3 py-2">
              <div>
                <div className="font-medium">{s.full_name}</div>
                <div className="text-sm opacity-70">
                  Roll: {s.roll_no ?? "-"} • Phone: {s.phone ?? "-"}
                </div>
              </div>
              <div className="text-sm opacity-60">{new Date(s.created_at).toLocaleDateString()}</div>
            </div>
          ))}
          {(!students || students.length === 0) && (
            <p className="text-sm opacity-70">No students yet. Next we will add “Add Student”.</p>
          )}
        </div>
      </div>
    </div>
  );
}
