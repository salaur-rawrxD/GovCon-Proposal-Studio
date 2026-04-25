import type {
  AgentJob,
  AgentJobStatus,
  CapabilityProfile,
  CompatibilityReport,
  ComplianceRequirement,
  Company,
  ExtractedDocumentChunk,
  Opportunity,
  ProposalSection,
  PublicProgressLabel,
  RfpDocument,
} from "@/lib/types";
import { PROGRESS_PHASES } from "@/lib/types";

function now(): string {
  return new Date().toISOString();
}

const DEFAULT_COMPANY_ID = "00000000-0000-4000-8000-000000000001";
const DEFAULT_PROFILE_ID = "00000000-0000-4000-8000-000000000002";

export class MemoryStore {
  companies = new Map<string, Company>();
  capabilities = new Map<string, CapabilityProfile>();
  opportunities = new Map<string, Opportunity>();
  rfpDocuments = new Map<string, RfpDocument>();
  /** document id -> file bytes */
  private fileData = new Map<string, Buffer>();
  chunks: ExtractedDocumentChunk[] = [];
  compatibility = new Map<string, CompatibilityReport>();
  compliance = new Map<string, ComplianceRequirement[]>();
  sections = new Map<string, ProposalSection>();
  jobs = new Map<string, AgentJob>();
  private chunkId = 1;
  private docId = 1;
  private oppId = 1;
  private jobId = 1;
  private compatId = 1;
  private complianceId = 1;
  private sectionId = 1;

  constructor() {
    this.seed();
  }

  private seed() {
    this.companies.set(DEFAULT_COMPANY_ID, {
      id: DEFAULT_COMPANY_ID,
      name: "Demo Federal Services, LLC",
      created_at: now(),
    });
    this.capabilities.set(DEFAULT_PROFILE_ID, {
      id: DEFAULT_PROFILE_ID,
      company_id: DEFAULT_COMPANY_ID,
      title: "Default capability profile",
      narrative:
        "We deliver secure cloud engineering, zero-trust architecture, and agile software delivery for civilian agencies.",
      differentiators: [
        "FedRAMP consulting experience",
        "CMMI-Dev Level 3 processes",
        "Cleared agile delivery teams",
      ],
      past_performance_summary:
        "Recent awards include HHS IaaS modernization and DHS data platform support.",
      key_personnel_summary:
        "PMO lead holds PMP; technical lead is CISSP; cloud lead is AWS & Azure architect certified.",
      certifications: ["ISO 9001", "CMMI-Dev 3", "FedRAMP 3PAO partner network"],
      created_at: now(),
      updated_at: now(),
    });
  }

  get defaultCompanyId() {
    return DEFAULT_COMPANY_ID;
  }

  getCompany(id: string): Company | null {
    return this.companies.get(id) ?? null;
  }

  getCapability(companyId: string): CapabilityProfile | null {
    for (const c of this.capabilities.values()) {
      if (c.company_id === companyId) return c;
    }
    return null;
  }

  upsertCapability(
    companyId: string,
    data: Partial<Omit<CapabilityProfile, "id" | "company_id" | "created_at" | "updated_at">>
  ): CapabilityProfile {
    let row = this.getCapability(companyId);
    if (!row) {
      row = {
        id: crypto.randomUUID(),
        company_id: companyId,
        title: data.title ?? "Capability profile",
        narrative: data.narrative ?? "",
        differentiators: data.differentiators ?? [],
        past_performance_summary: data.past_performance_summary ?? "",
        key_personnel_summary: data.key_personnel_summary ?? "",
        certifications: data.certifications ?? [],
        created_at: now(),
        updated_at: now(),
      };
      this.capabilities.set(row.id, row);
      return row;
    }
    const next: CapabilityProfile = {
      ...row,
      ...data,
      updated_at: now(),
    };
    this.capabilities.set(row.id, next);
    return next;
  }

  createOpportunity(title: string, description: string | null, companyId: string): Opportunity {
    const id = `opp-mem-${this.oppId++}`;
    const row: Opportunity = {
      id,
      company_id: companyId,
      title,
      description,
      status: "draft",
      created_at: now(),
      updated_at: now(),
    };
    this.opportunities.set(id, row);
    return row;
  }

  getOpportunity(id: string): Opportunity | null {
    return this.opportunities.get(id) ?? null;
  }

  listOpportunities(companyId: string): Opportunity[] {
    return [...this.opportunities.values()]
      .filter((o) => o.company_id === companyId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  addDocument(
    opportunityId: string,
    companyId: string,
    fileName: string,
    contentType: string,
    data: Buffer
  ): RfpDocument {
    const id = `doc-mem-${this.docId++}`;
    const path = `memory/${opportunityId}/${id}`;
    const row: RfpDocument = {
      id,
      opportunity_id: opportunityId,
      company_id: companyId,
      storage_path: path,
      file_name: fileName,
      content_type: contentType,
      file_size: data.length,
      created_at: now(),
    };
    this.rfpDocuments.set(id, row);
    this.fileData.set(id, data);
    return row;
  }

  getDocumentFile(id: string): Buffer | null {
    return this.fileData.get(id) ?? null;
  }

  listDocuments(opportunityId: string): RfpDocument[] {
    return [...this.rfpDocuments.values()].filter((d) => d.opportunity_id === opportunityId);
  }

  getDocumentById(id: string): RfpDocument | null {
    return this.rfpDocuments.get(id) ?? null;
  }

  clearChunksForOpportunity(opportunityId: string) {
    this.chunks = this.chunks.filter((c) => c.opportunity_id !== opportunityId);
  }

  addChunks(
    rfpDocumentId: string,
    opportunityId: string,
    companyId: string,
    texts: string[]
  ) {
    let idx = 0;
    for (const text of texts) {
      this.chunks.push({
        id: `chunk-mem-${this.chunkId++}`,
        rfp_document_id: rfpDocumentId,
        opportunity_id: opportunityId,
        company_id: companyId,
        chunk_index: idx++,
        text,
        created_at: now(),
      });
    }
  }

  getAggregateText(opportunityId: string): string {
    return this.chunks
      .filter((c) => c.opportunity_id === opportunityId)
      .sort(
        (a, b) =>
          a.rfp_document_id.localeCompare(b.rfp_document_id) || a.chunk_index - b.chunk_index
      )
      .map((c) => c.text)
      .join("\n\n");
  }

  setCompatibility(opp: Opportunity, row: Omit<CompatibilityReport, "id" | "created_at">): CompatibilityReport {
    const id = `compat-mem-${this.compatId++}`;
    const out: CompatibilityReport = {
      id,
      created_at: now(),
      ...row,
    };
    this.compatibility.set(opp.id, out);
    return out;
  }

  getCompatibility(opportunityId: string): CompatibilityReport | null {
    return this.compatibility.get(opportunityId) ?? null;
  }

  setCompliance(companyId: string, opportunityId: string, rows: Omit<ComplianceRequirement, "id" | "created_at">[]) {
    const list: ComplianceRequirement[] = rows.map((r) => ({
      ...r,
      id: `comp-req-mem-${this.complianceId++}`,
      company_id: companyId,
      opportunity_id: opportunityId,
      created_at: now(),
    }));
    this.compliance.set(opportunityId, list);
  }

  getCompliance(opportunityId: string): ComplianceRequirement[] {
    return this.compliance.get(opportunityId) ?? [];
  }

  setProposalSection(opp: Opportunity, key: string, title: string, content: string): ProposalSection {
    const k = `${opp.id}:${key}`;
    const existing = [...this.sections.values()].find(
      (s) => s.opportunity_id === opp.id && s.section_key === key
    );
    if (existing) {
      const next: ProposalSection = {
        ...existing,
        title,
        content,
        version: existing.version + 1,
        updated_at: now(),
      };
      this.sections.set(existing.id, next);
      return next;
    }
    const id = `sec-mem-${this.sectionId++}`;
    const row: ProposalSection = {
      id,
      opportunity_id: opp.id,
      company_id: opp.company_id,
      section_key: key,
      title,
      content,
      version: 1,
      created_at: now(),
      updated_at: now(),
    };
    this.sections.set(id, row);
    return row;
  }

  getSection(opportunityId: string, key: string): ProposalSection | null {
    return (
      [...this.sections.values()].find(
        (s) => s.opportunity_id === opportunityId && s.section_key === key
      ) ?? null
    );
  }

  createJob(companyId: string, opportunityId: string, type: AgentJob["job_type"]): AgentJob {
    const id = `job-mem-${this.jobId++}`;
    const job: AgentJob = {
      id,
      company_id: companyId,
      opportunity_id: opportunityId,
      job_type: type,
      status: "pending",
      phase_index: 0,
      public_message: PROGRESS_PHASES[0]?.label ?? "Analyzing RFP documents",
      error_message: null,
      result_payload: null,
      created_at: now(),
      updated_at: now(),
    };
    this.jobs.set(id, job);
    return job;
  }

  private patchJob(id: string, patch: Partial<AgentJob>) {
    const j = this.jobs.get(id);
    if (!j) return;
    this.jobs.set(id, { ...j, ...patch, updated_at: now() });
  }

  setJobPhase(
    jobId: string,
    phaseIndex: number,
    status: AgentJobStatus,
    publicLabel: PublicProgressLabel | string
  ) {
    this.patchJob(jobId, { phase_index: phaseIndex, status, public_message: publicLabel });
  }

  setJobError(jobId: string, err: string) {
    this.patchJob(jobId, { status: "failed", error_message: err });
  }

  completeJob(jobId: string, result: unknown) {
    this.patchJob(jobId, {
      status: "complete",
      phase_index: PROGRESS_PHASES.length - 1,
      public_message: "Ready for review",
      result_payload: result,
    });
  }

  getJob(id: string): AgentJob | null {
    return this.jobs.get(id) ?? null;
  }

  updateOpportunityStatus(oppId: string, status: string) {
    const o = this.opportunities.get(oppId);
    if (o) this.opportunities.set(oppId, { ...o, status, updated_at: now() });
  }
}

const globalKey = Symbol.for("govcon.memoryStore");

type GlobalWithStore = typeof globalThis & { [globalKey]?: MemoryStore };

export function getMemoryStore(): MemoryStore {
  const g = globalThis as GlobalWithStore;
  if (!g[globalKey]) g[globalKey] = new MemoryStore();
  return g[globalKey]!;
}
