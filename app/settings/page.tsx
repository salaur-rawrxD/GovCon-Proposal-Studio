import Link from "next/link";
import { Building2, ChevronRight, PlugZap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <>
      <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
      <p className="mt-1 text-sm text-muted-foreground">Choose a section to configure.</p>

      <div className="mt-6 space-y-4">
        <Link
          href="/settings/company"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-auto w-full justify-between gap-3 border-border/50 py-4 text-left font-normal"
          )}
        >
          <span className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-foreground">Company</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                EIN, UEI, addresses, W-9, insurance COIs, notary templates, and export branding
              </span>
            </span>
          </span>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </Link>
      </div>

      <Separator className="my-8" />

      <Card className="border-border/50 ring-1 ring-border/5">
        <CardHeader>
          <CardTitle className="text-base">Integrations</CardTitle>
          <CardDescription>Connect Supabase, document export, and AI models in a future release.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
            <PlugZap className="h-4 w-4" aria-hidden />
          </span>
          <Button type="button" disabled variant="secondary" size="sm">
            Configure (coming soon)
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
