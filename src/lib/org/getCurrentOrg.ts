import { createClient } from "@/lib/supabase/server";

export async function getCurrentOrg() {
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) return null;

  const { data: memberships } = await supabase
    .from("memberships")
    .select("organization_id, role")
    .limit(1);

  if (!memberships || memberships.length === 0) return null;

  return { organizationId: memberships[0].organization_id, role: memberships[0].role };
}
