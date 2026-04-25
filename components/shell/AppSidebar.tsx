"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, FolderOpen, LayoutGrid, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useNavLayout } from "@/contexts/NavLayoutContext";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/projects", label: "Opportunities", icon: FolderOpen },
  { href: "/knowledge-base", label: "Knowledge base", icon: BookOpen },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

type LayoutMode = "desktop" | "sheet";

type Props = { onNavigate?: () => void; className?: string; layout?: LayoutMode };

function NavLinkItem({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: (typeof primaryNav)[number];
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const I = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center rounded-md text-sm font-medium transition-colors",
        collapsed ? "justify-center px-0 py-2" : "gap-2.5 px-2.5 py-2",
        active
          ? "border-l-2 border-sidebar-primary bg-white/5 text-primary-foreground " +
              (collapsed ? "pl-0" : "pl-[calc(0.625rem-2px)]")
          : "border-l-2 border-transparent text-primary-foreground/80 hover:bg-white/5 hover:text-primary-foreground " +
              (collapsed ? "pl-0" : "pl-2.5")
      )}
      title={collapsed ? item.label : undefined}
    >
      <I className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
      {collapsed ? null : item.label}
    </Link>
  );
}

export function AppSidebar({ onNavigate, className, layout = "desktop" }: Props) {
  const pathname = usePathname();
  const { navCollapsed: ctxCollapsed } = useNavLayout();
  const collapsed = layout === "sheet" ? false : ctxCollapsed;

  return (
    <div className={cn("flex h-full w-full min-w-0 flex-col", className)}>
        <div className={cn("px-3 py-4", collapsed && "px-1.5")}>
          {!collapsed && (
            <>
              <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/50">
                Command
              </p>
              <p className="mt-0.5 px-2 text-sm font-semibold leading-tight text-primary-foreground">GovCon AI</p>
              <p className="px-2 text-xs text-primary-foreground/60">Proposal operations</p>
            </>
          )}
          {collapsed && (
            <p className="px-0.5 text-center text-[9px] font-bold uppercase leading-tight text-sidebar-primary" title="GovCon">
              GC
            </p>
          )}
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-2" aria-label="Main">
          {primaryNav.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <NavLinkItem
                key={item.href}
                item={item}
                active={active}
                collapsed={collapsed}
                onNavigate={onNavigate}
              />
            );
          })}
        </nav>
        <div className="p-2">
          {collapsed ? (
            <Link
              href="/start"
              onClick={onNavigate}
              title="New response"
              className={cn(
                buttonVariants({ size: "icon" }),
                "mx-auto flex h-10 w-10 text-accent-foreground shadow-sm"
              )}
              aria-label="New response"
            >
              <Plus className="h-4 w-4" />
            </Link>
          ) : (
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
          )}
          {!collapsed && (
            <p className="mt-2 px-1.5 text-[10px] leading-snug text-primary-foreground/40">
              Structured pursuit workflow · Session-based preview
            </p>
          )}
        </div>
    </div>
  );
}
