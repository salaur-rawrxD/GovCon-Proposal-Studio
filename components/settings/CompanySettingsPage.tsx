"use client";

import { useCallback } from "react";
import { Copy, FileText, ImageIcon, RefreshCw, Trash2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { FileUploadDropzone } from "@/components/app/FileUploadDropzone";
import { useCompanyProfile } from "@/contexts/CompanyProfileContext";
import type { AddressBlock, CompanyProfile, ContactPerson, NotarizedTemplate, StagedFile } from "@/lib/company/types";
import { acceptImageUpload, inferFileKind } from "@/lib/mock/file-utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FileTypeIcon } from "@/components/files/FileTypeIcon";

const ENTITY_TYPES = [
  "Corporation (C-corp or unspecified)",
  "S corporation",
  "Limited liability company (LLC)",
  "Partnership",
  "Sole proprietorship",
  "Nonprofit /501(c)(3) or other)",
  "Other (describe in business description)",
] as const;

const insuranceKind: Record<string, StagedFile["kind"]> = {
  ins_gl: "insurance_gl",
  ins_eo: "insurance_eo",
  ins_wc: "insurance_wc",
};

function FieldGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 sm:grid-cols-2", className)}>{children}</div>;
}

function AddressForm({
  value,
  onChange,
  disabled,
}: {
  value: AddressBlock;
  onChange: (a: AddressBlock) => void;
  disabled?: boolean;
}) {
  const set = (k: keyof AddressBlock, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-3">
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Street line 1</Label>
        <Input
          value={value.line1}
          onChange={(e) => set("line1", e.target.value)}
          disabled={disabled}
          autoComplete="street-address"
        />
      </div>
      <div className="space-y-1.5 sm:col-span-2">
        <Label>Street line 2</Label>
        <Input value={value.line2} onChange={(e) => set("line2", e.target.value)} disabled={disabled} />
      </div>
      <div className="space-y-1.5">
        <Label>City</Label>
        <Input value={value.city} onChange={(e) => set("city", e.target.value)} disabled={disabled} />
      </div>
      <div className="space-y-1.5">
        <Label>State / province</Label>
        <Input value={value.state} onChange={(e) => set("state", e.target.value)} disabled={disabled} />
      </div>
      <div className="space-y-1.5">
        <Label>ZIP / postal</Label>
        <Input value={value.zip} onChange={(e) => set("zip", e.target.value)} disabled={disabled} />
      </div>
      <div className="space-y-1.5">
        <Label>Country</Label>
        <Input value={value.country} onChange={(e) => set("country", e.target.value)} disabled={disabled} />
      </div>
    </div>
  );
}

function ContactForm({ label, value, onChange }: { label: string; value: ContactPerson; onChange: (c: ContactPerson) => void }) {
  const set = (k: keyof ContactPerson, v: string) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <FieldGrid>
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input value={value.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={value.title} onChange={(e) => set("title", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input type="email" value={value.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
        </div>
        <div className="space-y-1.5">
          <Label>Phone</Label>
          <Input value={value.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
        </div>
      </FieldGrid>
    </div>
  );
}

function StagedFileRow({ file, onRemove }: { file: StagedFile; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm">
      <span className="flex min-w-0 items-center gap-2">
        <FileTypeIcon kind={inferFileKind(file.name)} className="h-4 w-4" />
        <span className="min-w-0 truncate font-medium">{file.name}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{file.sizeLabel}</span>
      </span>
      <Button type="button" size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={onRemove} aria-label="Remove file">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

function NotaryBlock({
  t,
  onChange,
}: {
  t: NotarizedTemplate;
  onChange: (next: NotarizedTemplate) => void;
}) {
  const onCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) void navigator.clipboard.writeText(t.body);
  };
  return (
    <Collapsible defaultOpen={false} className="rounded-lg border border-border/50">
      <CollapsibleTrigger
        className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium outline-none transition hover:bg-muted/40"
        type="button"
      >
        <span className="min-w-0 truncate">{t.title}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground [[data-state=open]_&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 border-t border-border/50 px-3 pb-4 pt-2">
          <p className="text-xs leading-relaxed text-muted-foreground">{t.description}</p>
          <div className="space-y-1.5">
            <Label>Title (your label)</Label>
            <Input
              value={t.title}
              onChange={(e) => onChange({ ...t, title: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Short description (internal)</Label>
            <Textarea
              className="min-h-[4rem] resize-y"
              value={t.description}
              onChange={(e) => onChange({ ...t, description: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label>Template body</Label>
              <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={onCopy}>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Use placeholders like [LEGAL NAME], [UEI], [CAGE], [ENTITY TYPE], [HQ ADDRESS]—match to your company
              fields above before notarization.
            </p>
            <Textarea
              className="min-h-[12rem] resize-y font-mono text-xs"
              value={t.body}
              onChange={(e) => onChange({ ...t, body: e.target.value })}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function CompanySettingsPage() {
  const { profile, updateProfile, addFiles, removeFile, reset } = useCompanyProfile();

  const fileById = useCallback(
    (id: string | null) => (id ? profile.files.find((f) => f.id === id) : undefined),
    [profile.files]
  );

  const setHq = (headquarters: AddressBlock) => {
    if (profile.hqSameAsRemit) updateProfile({ headquarters, remitTo: headquarters });
    else updateProfile({ headquarters });
  };

  const onNotary = (id: string, next: NotarizedTemplate) => {
    updateProfile({
      notaryTemplates: profile.notaryTemplates.map((x) => (x.id === id ? next : x)),
    });
  };

  const updateInsurance = (id: string, patch: Partial<CompanyProfile["insuranceLines"][0]>) => {
    updateProfile({
      insuranceLines: profile.insuranceLines.map((L) => (L.id === id ? { ...L, ...patch } : L)),
    });
  };

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Company</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Standard data for RFPs: identifiers, remit and performance, COIs, W-9, and export branding. Stored in this
            session only.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 gap-1.5"
          onClick={() => {
            if (typeof window !== "undefined" && window.confirm("Reset all company fields and uploaded file references?")) {
              reset();
            }
          }}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset profile
        </Button>
      </div>

      <div className="mt-8 space-y-8">
        <Card className="border-border/50 ring-1 ring-border/5">
          <CardHeader>
            <CardTitle className="text-base">Legal & identifiers</CardTitle>
            <CardDescription>Names, EIN, and government IDs commonly requested in Representations and Certifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGrid>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Legal name</Label>
                <Input
                  value={profile.legalName}
                  onChange={(e) => updateProfile({ legalName: e.target.value })}
                  placeholder="As registered with the IRS and SAM.gov"
                />
              </div>
              <div className="space-y-1.5">
                <Label>DBA / trade name</Label>
                <Input value={profile.dba} onChange={(e) => updateProfile({ dba: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Employer ID (EIN)</Label>
                <Input
                  value={profile.ein}
                  onChange={(e) => updateProfile({ ein: e.target.value })}
                  placeholder="XX-XXXXXXX"
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Unique Entity ID (UEI)</Label>
                <Input value={profile.uei} onChange={(e) => updateProfile({ uei: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>CAGE (if applicable)</Label>
                <Input value={profile.cage} onChange={(e) => updateProfile({ cage: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>DUNS / UEI legacy ref</Label>
                <Input value={profile.duns} onChange={(e) => updateProfile({ duns: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>State of incorporation / formation</Label>
                <Input value={profile.stateOfIncorporation} onChange={(e) => updateProfile({ stateOfIncorporation: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Entity type</Label>
                <Select
                  value={profile.entityType}
                  onValueChange={(v) => v && updateProfile({ entityType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {!ENTITY_TYPES.includes(profile.entityType as (typeof ENTITY_TYPES)[number]) && profile.entityType ? (
                      <SelectItem value={profile.entityType}>
                        {profile.entityType} (current)
                      </SelectItem>
                    ) : null}
                    {ENTITY_TYPES.map((et) => (
                      <SelectItem key={et} value={et}>
                        {et}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Year established</Label>
                <Input value={profile.yearEstablished} onChange={(e) => updateProfile({ yearEstablished: e.target.value })} />
              </div>
            </FieldGrid>
            <div className="flex items-center gap-2">
              <Checkbox
                id="sb"
                checked={profile.isSmallBusiness}
                onCheckedChange={(c) => updateProfile({ isSmallBusiness: c === true })}
              />
              <Label htmlFor="sb" className="text-sm font-normal">
                Self-identify as small business (for internal tracking; certifications follow solicitation rules)
              </Label>
            </div>
            <div className="space-y-1.5">
              <Label>Socio-economic categories (optional)</Label>
              <Input
                value={profile.socioEconomic}
                onChange={(e) => updateProfile({ socioEconomic: e.target.value })}
                placeholder="8(a), WOSB, VOSB, HUBZone, etc."
              />
            </div>
            <div className="space-y-1.5">
              <Label>Business description (short)</Label>
              <Textarea
                className="min-h-[5rem] resize-y"
                value={profile.businessDescription}
                onChange={(e) => updateProfile({ businessDescription: e.target.value })}
                placeholder="One paragraph for cover sheets and capability blurbs"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Addresses</CardTitle>
            <CardDescription>Headquarters, remit-to, and any performance / mailing notes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium">Headquarters</p>
              <div className="mt-2">
                <AddressForm value={profile.headquarters} onChange={setHq} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="hqR"
                checked={profile.hqSameAsRemit}
                onCheckedChange={(c) => {
                  if (c === true) updateProfile({ hqSameAsRemit: true, remitTo: profile.headquarters });
                  else updateProfile({ hqSameAsRemit: false });
                }}
              />
              <Label htmlFor="hqR" className="text-sm font-normal">
                Remit-to address same as headquarters
              </Label>
            </div>
            <div>
              <p className="text-sm font-medium">Remit-to (accounts payable / invoicing)</p>
              <div className="mt-2">
                <AddressForm
                  value={profile.remitTo}
                  onChange={(remitTo) => updateProfile({ remitTo })}
                  disabled={profile.hqSameAsRemit}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Performance / project mailing notes (optional)</Label>
              <Textarea
                className="min-h-[4rem] resize-y"
                value={profile.performanceAddressNote}
                onChange={(e) => updateProfile({ performanceAddressNote: e.target.value })}
                placeholder="CAGE service locations, job-site mail, or “as stated in the proposal”"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">General & points of contact</CardTitle>
            <CardDescription>Main switchboard plus proposal, contracts, and AP contacts for submission packages.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FieldGrid>
              <div className="space-y-1.5">
                <Label>Main phone</Label>
                <Input value={profile.mainPhone} onChange={(e) => updateProfile({ mainPhone: e.target.value })} autoComplete="tel" />
              </div>
              <div className="space-y-1.5">
                <Label>Main email / info</Label>
                <Input type="email" value={profile.mainEmail} onChange={(e) => updateProfile({ mainEmail: e.target.value })} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>Website</Label>
                <Input value={profile.website} onChange={(e) => updateProfile({ website: e.target.value })} placeholder="https://" />
              </div>
            </FieldGrid>
            <Separator />
            <ContactForm
              label="Proposal / capture point of contact"
              value={profile.proposalPoc}
              onChange={(proposalPoc) => updateProfile({ proposalPoc })}
            />
            <ContactForm
              label="Contracts / program management"
              value={profile.contractsPoc}
              onChange={(contractsPoc) => updateProfile({ contractsPoc })}
            />
            <ContactForm
              label="AP / remittance contact"
              value={profile.apRemitPoc}
              onChange={(apRemitPoc) => updateProfile({ apRemitPoc })}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">NAICS & product/service codes</CardTitle>
            <CardDescription>Primary NAICS and additional codes (comma or line-separated) plus PSC or FSC as used in your market.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Primary NAICS</Label>
              <Input value={profile.naicsPrimary} onChange={(e) => updateProfile({ naicsPrimary: e.target.value })} placeholder="e.g. 541512" />
            </div>
            <div className="space-y-1.5">
              <Label>Additional NAICS (comma-separated)</Label>
              <Textarea
                className="min-h-[4rem] resize-y font-mono text-sm"
                value={profile.naicsCodes}
                onChange={(e) => updateProfile({ naicsCodes: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>PSC / FSC (optional)</Label>
              <Textarea
                className="min-h-[4rem] resize-y font-mono text-sm"
                value={profile.pscCodes}
                onChange={(e) => updateProfile({ pscCodes: e.target.value })}
                placeholder="e.g. D302, for reference in pricing tables"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Form W-9</CardTitle>
            <CardDescription>Keep a current signed W-9 PDF ready for subcontracts and vendor setup (session-staged only).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FileUploadDropzone
              id="w9-up"
              title="Drop W-9 PDF or click to add"
              subtitle="PDF recommended"
              accept="application/pdf,.pdf"
              onPickFiles={(list) => {
                if (!list?.length) return;
                addFiles(Array.from(list), "w9");
              }}
            />
            {profile.w9FileId && fileById(profile.w9FileId) ? (
              <StagedFileRow
                file={fileById(profile.w9FileId)!}
                onRemove={() => removeFile(profile.w9FileId!)}
              />
            ) : null}
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-xs text-muted-foreground">
                {profile.w9AsOf ? `Staged as of ${profile.w9AsOf}.` : "No W-9 on file in this session."}
              </p>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="w9y"
                  checked={profile.w9CurrentYear}
                  onCheckedChange={(c) => updateProfile({ w9CurrentYear: c === true })}
                />
                <Label htmlFor="w9y" className="text-sm font-normal">
                  I intend to use this W-9 for the current tax year
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Insurance certificates (COI)</CardTitle>
            <CardDescription>GL, E&O, and workers’ comp lines—upload COIs and track policy numbers and expirations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.insuranceLines.map((L) => {
              const f = L.fileId ? fileById(L.fileId) : undefined;
              const k = insuranceKind[L.id] ?? "other";
              return (
                <div key={L.id} className="space-y-3 rounded-xl border border-border/50 p-4">
                  <div className="space-y-1.5 sm:max-w-md">
                    <Label>Line / coverage type</Label>
                    <Input value={L.typeLabel} onChange={(e) => updateInsurance(L.id, { typeLabel: e.target.value })} />
                  </div>
                  <FieldGrid>
                    <div className="space-y-1.5">
                      <Label>Carrier</Label>
                      <Input value={L.carrier} onChange={(e) => updateInsurance(L.id, { carrier: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Policy number</Label>
                      <Input
                        value={L.policyNumber}
                        onChange={(e) => updateInsurance(L.id, { policyNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Limits / coverage summary</Label>
                      <Input
                        value={L.coverageLimit}
                        onChange={(e) => updateInsurance(L.id, { coverageLimit: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Notes</Label>
                      <Input value={L.notes} onChange={(e) => updateInsurance(L.id, { notes: e.target.value })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Effective</Label>
                      <Input
                        type="date"
                        value={L.effectiveDate}
                        onChange={(e) => updateInsurance(L.id, { effectiveDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Expiration</Label>
                      <Input
                        type="date"
                        value={L.expirationDate}
                        onChange={(e) => updateInsurance(L.id, { expirationDate: e.target.value })}
                      />
                    </div>
                  </FieldGrid>
                  <FileUploadDropzone
                    id={`ins-${L.id}`}
                    title="Attach COI (PDF)"
                    subtitle="Replaces the prior file for this line"
                    accept="application/pdf,.pdf"
                    onPickFiles={(list) => {
                      if (!list?.length) return;
                      addFiles(Array.from(list), k, { insuranceId: L.id });
                    }}
                  />
                  {f ? <StagedFileRow file={f} onRemove={() => removeFile(f.id)} /> : null}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notary / authority letter templates</CardTitle>
            <CardDescription>
              Editable starting points for certificates of incumbency, limited authority, and good-standing attestations. Have
              a qualified professional review and have notarized as required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.notaryTemplates.map((t) => (
              <NotaryBlock key={t.id} t={t} onChange={(next) => onNotary(t.id, next)} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start gap-2">
              <ImageIcon className="mt-0.5 h-4 w-4 text-muted-foreground" aria-hidden />
              <div>
                <CardTitle className="text-base">Branding for exports</CardTitle>
                <CardDescription>
                  Logos, colors, and text for cover sheets and document footers. Files are session-staged only.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Primary color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="h-10 w-14 cursor-pointer p-1"
                    value={profile.brandPrimaryColor}
                    onChange={(e) => updateProfile({ brandPrimaryColor: e.target.value })}
                  />
                  <Input
                    className="font-mono text-sm"
                    value={profile.brandPrimaryColor}
                    onChange={(e) => updateProfile({ brandPrimaryColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Secondary / accent</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="h-10 w-14 cursor-pointer p-1"
                    value={profile.brandSecondaryColor}
                    onChange={(e) => updateProfile({ brandSecondaryColor: e.target.value })}
                  />
                  <Input
                    className="font-mono text-sm"
                    value={profile.brandSecondaryColor}
                    onChange={(e) => updateProfile({ brandSecondaryColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Cover tagline</Label>
              <Input
                value={profile.coverSheetTagline}
                onChange={(e) => updateProfile({ coverSheetTagline: e.target.value })}
                placeholder="e.g. Mission-ready digital services"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Cover subtext (optional)</Label>
              <Textarea
                className="min-h-[4rem] resize-y"
                value={profile.coverSheetSubtext}
                onChange={(e) => updateProfile({ coverSheetSubtext: e.target.value })}
                placeholder="UEI, CAGE, or team codenames for this bid"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Document footer (all pages / export)</Label>
              <Textarea
                className="min-h-[4rem] resize-y font-mono text-xs"
                value={profile.documentFooter}
                onChange={(e) => updateProfile({ documentFooter: e.target.value })}
                placeholder="e.g. Company confidential · © 2026 Example Federal Services LLC"
              />
            </div>
            <Separator />
            <div className="space-y-4">
              {(
                [
                  { key: "logo_primary" as const, label: "Primary logo", desc: "Full color, horizontal or stacked", fileId: profile.logoPrimaryFileId },
                  { key: "logo_wordmark" as const, label: "Wordmark", desc: "Text-only mark", fileId: profile.logoWordmarkFileId },
                  { key: "logo_secondary" as const, label: "Secondary / icon", desc: "Icon or one-color for headers", fileId: profile.logoSecondaryFileId },
                ] as const
              ).map((row) => {
                const f = fileById(row.fileId);
                return (
                  <div key={row.key} className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">{row.label}</p>
                      <p className="text-xs text-muted-foreground">{row.desc}</p>
                    </div>
                    <FileUploadDropzone
                      id={`brand-${row.key}`}
                      title="Drop image or click"
                      subtitle="PNG, JPEG, WebP, or SVG"
                      accept={acceptImageUpload}
                      multiple={false}
                      onPickFiles={(list) => {
                        if (!list?.length) return;
                        addFiles([list[0]!], row.key);
                      }}
                    />
                    {f ? <StagedFileRow file={f} onRemove={() => removeFile(f.id)} /> : null}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5 shrink-0" />
          <span>
            This preview does not send files to a server. Clear session storage or use Reset to return to defaults
            (same as a fresh profile from defaults).
          </span>
        </p>
      </div>
    </div>
  );
}
