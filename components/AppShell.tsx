import Link from "next/link";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/opportunities/new", label: "New opportunity" },
  { href: "/knowledge-base", label: "Capability profile" },
  { href: "/settings", label: "Settings" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex-1">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/dashboard" className="text-base font-semibold text-zinc-900">
            GovCon Proposal Studio
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm text-zinc-600">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-cyan-800">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
