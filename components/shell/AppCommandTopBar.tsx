"use client";

import { usePathname } from "next/navigation";
import { Menu, Shield, Circle } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AppSidebar } from "./AppSidebar";
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
  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between border-b border-border/80 bg-surface pl-2 pr-3 sm:pl-4">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
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
            <AppSidebar />
          </SheetContent>
        </Sheet>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-[-0.01em] text-foreground sm:text-base">{title}</h1>
          <p className="hidden text-xs text-text-secondary sm:block">Authorized command workspace</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span
          className="inline-flex items-center gap-1 rounded border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
          title="Environment"
        >
          <Circle className="h-2 w-2 fill-success text-success" />
          Session
        </span>
        <div className="hidden h-4 w-px bg-border/80 sm:block" />
        <span
          className={cn(
            buttonVariants({ variant: "secondary", size: "xs" }),
            "hidden h-6 gap-1 sm:inline-flex"
          )}
          title="Compliance posture (preview)"
        >
          <Shield className="h-3 w-3 text-structure" />
          <span className="text-foreground/80">Review</span>
        </span>
      </div>
    </header>
  );
}
