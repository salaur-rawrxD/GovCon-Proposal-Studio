import Link from "next/link";
import { FileStack } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/shell/PageContainer";

export default function TemplatesPage() {
  return (
    <PageContainer className="max-w-3xl">
      <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Templates</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Standard volume structures and boilerplate. Configure approved shells here once your administrator connects the
        library service.
      </p>
      <Card className="mt-8 border-dashed border-border/50 bg-muted/10">
        <CardHeader>
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted ring-1 ring-border/20">
            <FileStack className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg">No templates configured</CardTitle>
          <CardDescription>
            When enabled, your team can publish technical, management, and cost volume scaffolds for reuse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/start" className={buttonVariants()}>
            New response
          </Link>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
