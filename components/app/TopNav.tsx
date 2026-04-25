import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Crumb = { href: string; label: string };

export function TopNav({
  className,
  items,
  trail,
  children,
}: {
  className?: string;
  items?: Crumb[];
  /** Single project title (optional) */
  trail?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-card/30 px-4 py-2.5 text-sm",
        className
      )}
    >
      <nav className="flex min-w-0 flex-wrap items-center gap-1 text-muted-foreground" aria-label="Breadcrumb">
        {items?.map((c) => (
          <span key={c.href} className="inline-flex min-w-0 items-center gap-1">
            <Link href={c.href} className="truncate hover:text-foreground">
              {c.label}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
          </span>
        ))}
        {trail ? <span className="min-w-0 truncate font-medium text-foreground">{trail}</span> : null}
      </nav>
      {children}
    </div>
  );
}
