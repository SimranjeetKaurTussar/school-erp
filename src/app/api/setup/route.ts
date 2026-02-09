import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  // 1) user verify using normal server client (cookie based)
  const supabase = await createClient();
  const { data: userRes } = await supabase.auth.getUser();

  if (!userRes.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = userRes.user;

  const body = await req.json();
  const name = String(body?.name ?? "").trim();
  const primaryColor = String(body?.primaryColor ?? "#16a34a").trim();
  const slug = slugify(String(body?.slug ?? name));

  if (!name) return NextResponse.json({ error: "School name is required" }, { status: 400 });
  if (!slug) return NextResponse.json({ error: "Slug is required" }, { status: 400 });

  // 2) admin client (bypasses RLS)
  const admin = createAdminClient();

  // upsert profile
  const fullName = (user.user_metadata?.full_name as string) || null;
  const { error: profErr } = await admin
    .from("profiles")
    .upsert({ id: user.id, full_name: fullName }, { onConflict: "id" });

  if (profErr) return NextResponse.json({ error: profErr.message }, { status: 400 });

  // create org
  const { data: org, error: orgErr } = await admin
    .from("organizations")
    .insert({ name, slug, primary_color: primaryColor })
    .select("id, name, slug")
    .single();

  if (orgErr) return NextResponse.json({ error: orgErr.message }, { status: 400 });

  // create membership OWNER
  const { error: memErr } = await admin
    .from("memberships")
    .insert({ organization_id: org.id, user_id: user.id, role: "OWNER" });

  if (memErr) return NextResponse.json({ error: memErr.message }, { status: 400 });

  return NextResponse.json({ ok: true, organization: org });
}
