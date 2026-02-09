import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PrintButton } from "@/components/fees/PrintButton";

export default async function ReceiptPage(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");

  // fetch receipt from DB
  const admin = createAdminClient();
  const feeId = decodeURIComponent(id).replace(/[^\w-]/g, "");

  const { data: fee, error: feeErr } = await admin
    .from("fees")
    .select(
      "id, organization_id, student_id, fee_type, month, amount, status, paid_at, receipt_no, created_at",
    )
    .eq("id", feeId)
    .single();

  if (feeErr || !fee) {
    return (
      <div className="p-6">
        <div className="text-sm opacity-70">Receipt not found</div>
        <div className="text-xs opacity-60 mt-2">
          Debug: {feeErr?.message ?? "no row"}
        </div>
        <div className="text-xs opacity-60 mt-2">feeId: {feeId}</div>
      </div>
    );
  }

  // 2) fetch org
  const { data: org, error: orgErr } = await admin
    .from("organizations")
    .select("name, slug, primary_color")
    .eq("id", fee.organization_id)
    .single();

  // 3) fetch student
  const { data: student, error: stuErr } = await admin
    .from("students")
    .select("full_name, roll_no, phone")
    .eq("id", fee.student_id)
    .single();
if (!fee.organization_id || !fee.student_id) {
  return (
    <div className="p-6">
      Missing links: org/student ids
    </div>
  );
}

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="border rounded-xl p-6 space-y-3">
        <div className="flex justify-between">
          <div>
            <h1 className="text-xl font-semibold">{org?.name ?? "School"}</h1>
            <p className="text-sm opacity-70">Fee Receipt</p>
          </div>
          <div className="text-right text-sm">
            <div>
              Receipt: <b>{fee.receipt_no ?? "-"}</b>
            </div>
            <div>
              Status: <b>{fee.status}</b>
            </div>
          </div>
        </div>

        <hr />

        <div className="text-sm space-y-1">
          <div>
            <b>Student:</b> {student?.full_name ?? "-"}
          </div>
          <div>
            <b>Roll No:</b> {student?.roll_no ?? "-"}
          </div>
          <div>
            <b>Phone:</b> {student?.phone ?? "-"}
          </div>
          {(stuErr || orgErr) && (
            <div className="text-xs opacity-60">
              Debug: {orgErr?.message ?? ""} {stuErr?.message ?? ""}
            </div>
          )}
        </div>

        <hr />

        <div className="text-sm space-y-1">
          <div>
            <b>Fee Type:</b> {fee.fee_type}
          </div>
          <div>
            <b>Month:</b> {fee.month ?? "-"}
          </div>
          <div>
            <b>Amount:</b> ₹{fee.amount}
          </div>
          <div>
            <b>Paid At:</b>{" "}
            {fee.paid_at ? new Date(fee.paid_at).toLocaleString() : "-"}
          </div>
        </div>

        <div className="pt-4 flex gap-2 print:hidden">
          <PrintButton />
          <a href="/app/fees" className="border rounded-lg px-4 py-2 text-sm">
            Back
          </a>
        </div>
      </div>
    </div>
  );
}
