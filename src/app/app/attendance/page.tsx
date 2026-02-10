import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/org/getCurrentOrg";
import { AttendanceClient } from "@/components/attendance/AttendanceClient";

export default async function AttendancePage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/setup");

  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, section")
    .eq("organization_id", org.organizationId)
    .order("created_at", { ascending: false });

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, class_id")
    .eq("organization_id", org.organizationId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Attendance</h1>
      <AttendanceClient classes={classes ?? []} students={students ?? []} />
    </div>
  );
}
