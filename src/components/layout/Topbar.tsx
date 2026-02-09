"use client";

import { useRouter } from "next/navigation";

export function Topbar() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="h-14 border-b bg-background sticky top-0 flex items-center justify-between px-4">
      <div className="text-sm opacity-70">Welcome 👋</div>
      <button onClick={logout} className="border rounded-lg px-3 py-1.5 text-sm">
        Logout
      </button>
    </header>
  );
}
