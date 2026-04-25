"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/settings", label: "Overview" },
  { href: "/settings/company", label: "Company" },
] as const;

export function SettingsSubnav() {
  const pathname = usePathname();
  return (
    <nav
      className="flex flex-wrap gap-1 border-b border-border/60 pb-3"
      aria-label="Settings sections"
    >
      {links.map((l) => {
        const active = pathname === l.href;
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-primary/10 font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
