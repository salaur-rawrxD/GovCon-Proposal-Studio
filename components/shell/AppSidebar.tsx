"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, BookOpen, FolderOpen, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/projects", label: "Opportunities", icon: FolderOpen },
  { href: "/knowledge-base", label: "Knowledge base", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

type Props = { onNavigate?: () => void; className?: string };

export function AppSidebar({ onNavigate, className }: Props) {
  const pathname = usePathname();
  return (
    <div className={cn("flex h-full w-full min-w-0 flex-col", className)}>
      <div className="px-3 py-4">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/50">Command</p>
        <p className="mt-0.5 px-2 text-sm font-semibold leading-tight text-primary-foreground">GovCon AI</p>
        <p className="px-2 text-xs text-primary-foreground/60">Proposal operations</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-2" aria-label="Main">
        {primaryNav.map((item) => {
          const active =
            pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
          const I = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-l-2 border-sidebar-primary bg-white/5 pl-[calc(0.625rem-2px)] text-primary-foreground"
                  : "border-l-2 border-transparent pl-2.5 text-primary-foreground/80 hover:bg-white/5 hover:text-primary-foreground"
              )}
            >
              <I className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2">
        <Link
          href="/start"
          onClick={onNavigate}
          className={cn(
            buttonVariants({ size: "default" }),
            "h-9 w-full justify-center gap-2 text-accent-foreground shadow-sm"
          )}
        >
          <Plus className="h-3.5 w-3.5" />
          New response
        </Link>
        <p className="mt-2 px-1.5 text-[10px] leading-snug text-primary-foreground/40">
          Structured pursuit workflow · Session-based preview
        </p>
      </div>
    </div>
  );
}
