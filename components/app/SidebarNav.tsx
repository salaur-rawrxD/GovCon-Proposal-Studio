import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type NavItem = { id: string; label: string; icon: LucideIcon };

type Props = {
  items: NavItem[];
  value: string;
  onValueChange: (v: string) => void;
  className?: string;
};

export function SidebarNav({ items, value, onValueChange, className }: Props) {
  return (
    <nav className={cn("flex flex-col gap-0.5 p-2", className)} aria-label="Project sections">
      {items.map((t) => {
        const I = t.icon;
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onValueChange(t.id)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
              active
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <I className="h-4 w-4 shrink-0" aria-hidden />
            <span className="truncate">{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
