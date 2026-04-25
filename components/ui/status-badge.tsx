import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex h-5 max-w-full items-center gap-1 rounded border px-1.5 text-[10px] font-semibold uppercase tracking-wider",
  {
    variants: {
      variant: {
        success: "border-success/40 bg-success/10 text-success",
        warning: "border-warning/40 bg-warning/10 text-warning",
        error: "border-destructive/50 bg-destructive/10 text-destructive",
        neutral: "border-border bg-muted/80 text-muted-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

type Props = React.ComponentProps<"span"> & VariantProps<typeof statusBadgeVariants>;

export function StatusBadge({ className, variant, children, ...props }: Props) {
  return (
    <span
      className={cn(statusBadgeVariants({ variant }), "tabular-nums", className)}
      data-slot="status-badge"
      {...props}
    >
      {children}
    </span>
  );
}
