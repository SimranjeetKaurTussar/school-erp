import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/org/getCurrentOrg";
import { AddFeeForm } from "@/components/fees/AddFeeForm";
import { MarkPaidButton } from "@/components/fees/MarkPaidButton";
import { FeesList } from "@/components/fees/FeesList";

export default async function FeesPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/setup");

  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("organization_id", org.organizationId);

  const { data: fees } = await supabase
    .from("fees")
    .select(
      "id, fee_type, month, amount, status, receipt_no, paid_at, student:students(full_name)",
    )
    .eq("organization_id", org.organizationId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Fees</h1>

      <AddFeeForm students={students ?? []} />

      <div className="border rounded-xl p-4 space-y-2">
        <FeesList fees={fees ?? []} />
      </div>
    </div>
  );
}
