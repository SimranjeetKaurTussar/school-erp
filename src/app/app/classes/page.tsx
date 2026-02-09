import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrg } from "@/lib/org/getCurrentOrg";
import { revalidatePath } from "next/cache";


export default async function ClassesPage() {
  const org = await getCurrentOrg();
  if (!org) redirect("/app/setup");

  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name, section, created_at")
    .eq("organization_id", org.organizationId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Classes</h1>

      <form
  action={async (formData) => {
    "use server";
    const supabase = await createClient();
    const org = await getCurrentOrg();
    if (!org) return;

    const name = String(formData.get("name") ?? "").trim();
    const section = String(formData.get("section") ?? "").trim();
    if (!name || !section) return;

    await supabase.from("classes").insert({
      organization_id: org.organizationId,
      name,
      section,
    });

    revalidatePath("/app/classes");
  }}
  className="flex gap-2 items-end border rounded-xl p-4"
>

        <div className="flex-1">
          <label className="text-sm">Class</label>
          <input name="name" className="w-full border rounded-lg px-3 py-2" placeholder="10th" />
        </div>
        <div className="w-32">
          <label className="text-sm">Section</label>
          <input name="section" className="w-full border rounded-lg px-3 py-2" placeholder="A" />
        </div>
        <button className="border rounded-lg px-4 py-2" type="submit">
          Add
        </button>
      </form>

      <div className="border rounded-xl p-4">
        <h2 className="font-medium mb-2">Saved Classes</h2>
        <div className="space-y-2">
          {(classes ?? []).map((c) => (
            <div key={c.id} className="flex justify-between border rounded-lg px-3 py-2">
              <div>
                <div className="font-medium">
                  {c.name} - {c.section}
                </div>
              </div>
              <div className="text-sm opacity-60">{new Date(c.created_at).toLocaleDateString()}</div>
            </div>
          ))}
          {(!classes || classes.length === 0) && <p className="text-sm opacity-70">No classes yet.</p>}
        </div>
      </div>
    </div>
  );
}
