import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentOrg } from "@/lib/org/getCurrentOrg";

// Create fee
export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org)
    return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();
  const studentId = String(body?.studentId ?? "").trim();
  const feeType = String(body?.feeType ?? "").trim();
  const month = String(body?.month ?? "").trim() || null;
  const amount = Number(body?.amount ?? 0);

  if (!studentId || !feeType || !amount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { error } = await admin.from("fees").insert({
    organization_id: org.organizationId,
    student_id: studentId,
    fee_type: feeType,
    month,
    amount,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}

// Mark paid
export async function PUT(req: Request) {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org)
    return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await req.json();
  const feeId = String(body?.feeId ?? "").trim();

  const admin = createAdminClient();
  const { data: receipt, error: recErr } = await admin.rpc(
    "get_next_receipt_no",
    {
      org_id: org.organizationId,
    },
  );

  if (recErr)
    return NextResponse.json({ error: recErr.message }, { status: 400 });

  const { error } = await admin
    .from("fees")
    .update({
      status: "PAID",
      paid_at: new Date().toISOString(),
      receipt_no: receipt,
    })
    .eq("id", feeId)
    .eq("organization_id", org.organizationId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
