import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/org/getCurrentOrg";
import { AddStudentForm } from "@/components/students/AddStudentForm";
import { StudentList } from "@/components/students/StudentList";

export default async function StudentsPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/setup");

  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, section")
    .eq("organization_id", org.organizationId)
    .order("created_at", { ascending: false });

  const { data: rawStudents } = await supabase
    .from("students")
    .select(
      "id, full_name, roll_no, phone, created_at, class:classes(id, name, section)"
    )
    .eq("organization_id", org.organizationId)
    .order("created_at", { ascending: false });

  // Normalize class (array/object issue fix)
  const students =
    rawStudents?.map((s) => ({
      ...s,
      class: Array.isArray(s.class) ? s.class[0] : s.class,
    })) ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Students</h1>

      <AddStudentForm classes={classes ?? []} />

      <div className="border rounded-xl p-4">
        <h2 className="font-medium mb-2">Students List</h2>

        {students.length > 0 ? (
          <StudentList students={students} classes={classes ?? []} />
        ) : (
          <p className="text-sm opacity-70">No students yet.</p>
        )}
      </div>
    </div>
  );
}
