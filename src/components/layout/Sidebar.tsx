import Link from "next/link";

const nav = [
  { href: "/app/dashboard", label: "Dashboard" },
  { href: "/app/students", label: "Students" },
  { href: "/app/classes", label: "Classes" },
  { href: "/app/fees", label: "Fees" },
  { href: "/app/attendance", label: "Attendance" },
];

export function Sidebar() {
  return (
    <aside className="h-screen w-64 border-r bg-background sticky top-0">
      <div className="p-4 border-b">
        <div className="font-semibold">School ERP</div>
        <div className="text-xs opacity-70">Owner Panel</div>
      </div>

      <nav className="p-3 space-y-1">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 hover:bg-muted"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
