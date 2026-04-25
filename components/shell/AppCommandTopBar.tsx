"use client";

import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, Menu, Shield } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNavLayout } from "@/contexts/NavLayoutContext";
import { AppSidebar } from "./AppSidebar";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";

function titleForPath(pathname: string) {
  if (pathname === "/" || pathname === "/dashboard") return "Dashboard";
  if (pathname.startsWith("/start")) return "New response";
  if (pathname.startsWith("/knowledge-base")) return "Knowledge base";
  if (pathname.startsWith("/settings/company")) return "Company";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/opportunities/preview")) return "Opportunity detail";
  if (pathname.startsWith("/opportunities")) return "Opportunity";
  if (pathname.startsWith("/submitted-rfps")) return "Submissions";
  if (pathname.startsWith("/templates")) return "Templates";
  if (pathname === "/projects") return "Opportunities";
  if (pathname.startsWith("/projects/")) return "Workspace";
  return "Operations";
}

export function AppCommandTopBar() {
  const pathname = usePathname() ?? "/";
  const title = titleForPath(pathname);
  const { navCollapsed, toggleNav } = useNavLayout();
  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-border/80 bg-surface pl-1 pr-3 sm:pl-2">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="hidden shrink-0 text-primary md:inline-flex"
          onClick={toggleNav}
          aria-pressed={!navCollapsed}
          title={navCollapsed ? "Expand navigation" : "Collapse navigation"}
        >
          {navCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
        <Sheet>
          <SheetTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon-sm" }),
              "shrink-0 text-primary md:hidden"
            )}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 border-sidebar-border bg-sidebar text-sidebar-foreground">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <AppSidebar layout="sheet" />
          </SheetContent>
        </Sheet>
        <div className="min-w-0 pl-0.5">
          <h1 className="truncate text-sm font-semibold tracking-[-0.01em] text-foreground sm:text-base">{title}</h1>
          <p className="hidden text-xs text-text-secondary sm:block">Authorized command workspace</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <StatusBadge variant="success" className="h-6 px-2 text-[10px] font-bold">
          Session
        </StatusBadge>
        <div className="hidden h-4 w-px bg-border/80 sm:block" />
        <span
          className={cn(
            "inline-flex h-6 items-center gap-1.5 rounded-md border-2 border-primary bg-surface px-2 text-[10px] font-bold text-primary",
            "hidden sm:inline-flex"
          )}
          title="Compliance review queue (preview)"
        >
          <Shield className="h-3.5 w-3.5 text-primary" />
          Review
        </span>
      </div>
    </header>
  );
}
