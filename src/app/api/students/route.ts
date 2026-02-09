import { NextResponse } from "next/server";
import { getCurrentOrg } from "@/lib/org/getCurrentOrg";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  // verify logged in
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();
  const fullName = String(body?.fullName ?? "").trim();
  const rollNo = String(body?.rollNo ?? "").trim() || null;
  const phone = String(body?.phone ?? "").trim() || null;
  const classId = String(body?.classId ?? "").trim() || null;

  if (!fullName) return NextResponse.json({ error: "Full name required" }, { status: 400 });
  if (!classId) return NextResponse.json({ error: "Class required" }, { status: 400 });

  // use admin client to avoid cookie/RLS issues (same as setup)
  const admin = createAdminClient();

  const { error } = await admin.from("students").insert({
    organization_id: org.organizationId,
    class_id: classId,
    full_name: fullName,
    roll_no: rollNo,
    phone,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
export async function DELETE(req: Request) {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();
  const studentId = String(body?.studentId ?? "").trim();
  if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });

  const admin = createAdminClient();

  // extra safety: delete only inside current org
  const { error } = await admin
    .from("students")
    .delete()
    .eq("id", studentId)
    .eq("organization_id", org.organizationId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();
  const studentId = String(body?.studentId ?? "").trim();
  const fullName = String(body?.fullName ?? "").trim();
  const rollNo = String(body?.rollNo ?? "").trim() || null;
  const phone = String(body?.phone ?? "").trim() || null;
  const classId = String(body?.classId ?? "").trim() || null;

  if (!studentId || !fullName || !classId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("students")
    .update({
      full_name: fullName,
      roll_no: rollNo,
      phone,
      class_id: classId,
    })
    .eq("id", studentId)
    .eq("organization_id", org.organizationId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
