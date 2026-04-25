"use client";

import type { ReactNode } from "react";
import { NavLayoutProvider, useNavLayout } from "@/contexts/NavLayoutContext";
import { AppCommandTopBar } from "./AppCommandTopBar";
import { AppSidebar } from "./AppSidebar";
import { cn } from "@/lib/utils";

function CommandShellBody({ children, className }: { children: ReactNode; className?: string }) {
  const { navCollapsed } = useNavLayout();
  return (
    <div className={cn("flex min-h-dvh w-full", className)}>
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border bg-primary text-primary-foreground transition-[width] duration-200 ease-out md:block",
          navCollapsed ? "w-[4.5rem] lg:w-16" : "w-56 lg:w-60"
        )}
        aria-label="Application"
      >
        <AppSidebar layout="desktop" />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <AppCommandTopBar />
        <main className="min-h-0 flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  );
}

export function CommandAppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <NavLayoutProvider>
      <CommandShellBody className={className}>{children}</CommandShellBody>
    </NavLayoutProvider>
  );
}
