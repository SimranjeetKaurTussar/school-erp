import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();

  if (!userRes.user) redirect("/login");

  const { data: memberships } = await supabase
    .from("memberships")
    .select("role, organization_id")
    .limit(1);

  if (!memberships || memberships.length === 0) redirect("/app/setup");

  const orgId = memberships[0].organization_id;

  const { data: org } = await supabase
    .from("organizations")
    .select("name, slug, primary_color")
    .eq("id", orgId)
    .single();

  return (
    <div className="p-6 space-y-2">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p>✅ You are inside the School ERP</p>
      <p className="text-sm opacity-70">Role: {memberships[0].role}</p>

      {org && (
        <div className="mt-4 border rounded-xl p-4">
          <p className="font-medium">School: {org.name}</p>
          <p className="text-sm opacity-70">Slug: {org.slug}</p>
          <p className="text-sm opacity-70">Primary color: {org.primary_color}</p>
        </div>
      )}
    </div>
  );
}
