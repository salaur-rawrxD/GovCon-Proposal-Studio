import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function AppShell({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("min-h-0 w-full", className)}>{children}</div>;
}
