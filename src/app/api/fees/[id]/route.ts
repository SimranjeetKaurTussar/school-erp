import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/org/getCurrentOrg";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const org = await getCurrentOrg();
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const admin = createAdminClient();
  const feeId = params.id;

  const { data, error } = await admin
    .from("fees")
    .select(
      "id, fee_type, month, amount, status, paid_at, receipt_no, created_at, student:students(full_name, roll_no, phone), org:organizations(name, slug, primary_color)"
    )
    .eq("id", feeId)
    .eq("organization_id", org.organizationId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, data });
}
