"use client";

import type { ReactNode } from "react";
import { AppCommandTopBar } from "./AppCommandTopBar";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

export function CommandAppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-dvh w-full", className)}>
      <aside
        className="hidden w-56 shrink-0 border-r border-sidebar-border bg-primary text-primary-foreground md:block lg:w-60"
        aria-label="Application"
      >
        <AppSidebar />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppCommandTopBar />
        <main className="min-h-0 flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
}
