import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageContainer } from "@/components/shell/PageContainer";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <PageContainer className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Organization profile, integrations, and environment configuration. UI only—no data is saved.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Company</CardTitle>
          <CardDescription>Displayed on proposals and in your knowledge base (mock form).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cname">Legal name</Label>
            <Input id="cname" placeholder="Example Federal Services LLC" disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="uei">UEI / SAM</Label>
            <Input id="uei" placeholder="—" disabled />
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Integrations</CardTitle>
          <CardDescription>Connect Supabase, document export, and AI models in a future release.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" disabled variant="secondary">
            Configure (coming soon)
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
