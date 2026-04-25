import { PageContainer } from "@/components/shell/PageContainer";
import { SettingsSubnav } from "@/components/settings/SettingsSubnav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageContainer className="max-w-3xl">
      <div className="mb-8 max-w-2xl">
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Workspace preferences and your company profile for reuse across proposals. Company data is stored in this
          browser session (sessionStorage) until a backend is connected.
        </p>
      </div>
      <SettingsSubnav />
      <div className="mt-8">{children}</div>
    </PageContainer>
  );
}
