import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashboardCard({
  description,
  title,
  className,
  children,
  headerRight,
}: {
  description?: string;
  title: string;
  className?: string;
  children?: ReactNode;
  headerRight?: ReactNode;
}) {
  return (
    <Card className={cn("border-border/60 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          {description ? <CardDescription>{description}</CardDescription> : null}
          <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">{title}</CardTitle>
        </div>
        {headerRight}
      </CardHeader>
      {children ? <CardContent className="pt-0">{children}</CardContent> : null}
    </Card>
  );
}
