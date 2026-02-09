import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AppHome() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">School ERP</h1>
      <p className="mt-2">You are logged in ✅</p>
      <p className="mt-2 text-sm opacity-70">User ID: {data.user.id}</p>
    </div>
  );
}
