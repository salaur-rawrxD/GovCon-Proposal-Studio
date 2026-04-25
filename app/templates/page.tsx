import Link from "next/link";
import { FileStack } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/shell/PageContainer";

export default function TemplatesPage() {
  return (
    <PageContainer className="max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Templates</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Reusable proposal shells and section layouts. This area is a placeholder in the mock—no backend yet.
      </p>
      <Card className="mt-8 border-dashed">
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <FileStack className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">No templates published</CardTitle>
          <CardDescription>
            When connected, you’ll manage technical, management, and pricing volumes from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/start" className={buttonVariants()}>
            Start New Response
          </Link>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
