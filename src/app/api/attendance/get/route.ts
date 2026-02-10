import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentOrg } from "@/lib/org/getCurrentOrg";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();
  const classId = String(body?.classId ?? "").trim();
  const date = String(body?.date ?? "").trim();

  if (!classId || !date) {
    return NextResponse.json({ error: "Missing classId/date" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: session } = await admin
    .from("attendance_sessions")
    .select("id")
    .eq("organization_id", org.organizationId)
    .eq("class_id", classId)
    .eq("attendance_date", date)
    .maybeSingle();

  if (!session?.id) {
    return NextResponse.json({ ok: true, entries: [] });
  }

  const { data: entries, error } = await admin
    .from("attendance_entries")
    .select("student_id, status")
    .eq("organization_id", org.organizationId)
    .eq("session_id", session.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, entries: entries ?? [] });
}
