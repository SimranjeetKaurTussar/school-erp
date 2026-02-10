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
  const date = String(body?.date ?? "").trim(); // YYYY-MM-DD
  const entries = Array.isArray(body?.entries) ? body.entries : [];

  if (!classId || !date || entries.length === 0) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const admin = createAdminClient();

  // create/get session
  const { data: session, error: sessErr } = await admin
    .from("attendance_sessions")
    .upsert(
      {
        organization_id: org.organizationId,
        class_id: classId,
        attendance_date: date,
      },
      { onConflict: "organization_id,class_id,attendance_date" }
    )
    .select("id")
    .single();

  if (sessErr || !session) {
    return NextResponse.json({ error: sessErr?.message || "Session failed" }, { status: 400 });
  }

  const rows = entries.map((e: any) => ({
    organization_id: org.organizationId,
    session_id: session.id,
    student_id: String(e.studentId),
    status: e.status === "ABSENT" ? "ABSENT" : "PRESENT",
  }));

  // upsert entries
  const { error: entErr } = await admin
    .from("attendance_entries")
    .upsert(rows, { onConflict: "session_id,student_id" });

  if (entErr) return NextResponse.json({ error: entErr.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
