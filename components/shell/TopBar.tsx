"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Menu, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home" },
  { href: "/start", label: "New response" },
  { href: "/projects", label: "Projects" },
  { href: "/knowledge-base", label: "Knowledge base" },
  { href: "/submitted-rfps", label: "Submissions" },
  { href: "/templates", label: "Templates" },
  { href: "/settings", label: "Settings" },
] as const;

function NavLink({ href, label, onSelect }: { href: string; label: string; onSelect?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && href !== "/start" && pathname.startsWith(href + "/"));
  return (
    <Link
      href={href}
      onClick={onSelect}
      className={cn(
        "whitespace-nowrap rounded-md px-2.5 py-1.5 text-sm transition-colors",
        active
          ? "bg-primary/10 font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 shadow-sm shadow-black/5 backdrop-blur-md dark:shadow-none">
      <div className="mx-auto flex h-12 max-w-[1920px] items-center justify-between gap-2 px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2 lg:gap-3">
          <Link
            href="/dashboard"
            className="group flex min-w-0 shrink-0 items-center gap-2.5 text-foreground"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm ring-1 ring-border/20">
              <FileText className="h-4 w-4" aria-hidden />
            </span>
            <span className="hidden min-[480px]:flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-semibold tracking-tight">GovCon Proposal Studio</span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Response workspace</span>
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center gap-0.5 overflow-x-auto lg:flex xl:gap-1">
            {items.map((it) => (
              <NavLink key={it.href} href={it.href} label={it.label} />
            ))}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/start"
            className={cn(
              buttonVariants({ size: "sm" }),
              "hidden h-8 gap-1 sm:inline-flex"
            )}
          >
            <Plus className="h-3.5 w-3.5" />
            New response
          </Link>
          <Link
            href="/start"
            className={cn(
              buttonVariants({ size: "icon-sm" }),
              "sm:hidden"
            )}
            aria-label="Create new response"
          >
            <Plus className="h-4 w-4" />
          </Link>

          <Sheet>
            <SheetTrigger
              data-slot="sheet-trigger"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/80 text-muted-foreground hover:bg-muted lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="border-b p-4 text-left">
                <SheetTitle>Navigate</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-2">
                {items.map((it) => (
                  <div key={it.href} className="p-0.5">
                    <NavLink href={it.href} label={it.label} />
                  </div>
                ))}
                <div className="mt-2 border-t pt-2">
                  <Link href="/start" className={cn(buttonVariants(), "w-full")}>
                    New response
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <span className="inline-flex h-8 w-8">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">JD</AvatarFallback>
                </Avatar>
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem disabled>Profile</DropdownMenuItem>
              <DropdownMenuItem disabled>Preferences</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>Sign out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
