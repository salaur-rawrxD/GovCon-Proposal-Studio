import { cn } from "@/lib/utils";

export function PageContainer({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8", className)}
    >
      {children}
    </div>
  );
}
