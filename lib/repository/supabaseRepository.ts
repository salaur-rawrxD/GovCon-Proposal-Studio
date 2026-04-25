import { getServiceSupabase } from "@/lib/supabase/server";
import { chunkText } from "@/lib/documents/chunkText";
import { extractTextFromFile } from "@/lib/documents/extractText";
import type { GovRepository, PersistedCompatibility } from "@/lib/repository/govRepository";
import type { ComplianceRowInput } from "@/lib/agents/complianceAgent";
import type { RfpSynthesis } from "@/lib/agents/rfpParserAgent";
import type {
  AgentJob,
  AgentJobStatus,
  CapabilityProfile,
  CompatibilityReport,
  ComplianceRequirement,
  Opportunity,
  ProposalSection,
} from "@/lib/types";
import { randomUUID } from "crypto";

const BUCKET = "rfp-documents";

async function ensureCompany(supabase: NonNullable<ReturnType<typeof getServiceSupabase>>): Promise<string> {
  const { data: first } = await supabase.from("companies").select("id").limit(1).maybeSingle();
  if (first?.id) return first.id;
  const { data, error } = await supabase
    .from("companies")
    .insert({ name: "Default company" })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureDefaultCapability(
  supabase: NonNullable<ReturnType<typeof getServiceSupabase>>,
  companyId: string
) {
  const { data: existing } = await supabase
    .from("capability_profiles")
    .select("id")
    .eq("company_id", companyId)
    .limit(1)
    .maybeSingle();
  if (existing) return;
  await supabase.from("capability_profiles").insert({
    company_id: companyId,
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
  });
}

function mapOpp(r: {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}): Opportunity {
  return { ...r };
}

function mapCap(r: {
  id: string;
  company_id: string;
  title: string;
  narrative: string;
  differentiators: string[] | null;
  past_performance_summary: string;
  key_personnel_summary: string;
  certifications: string[] | null;
  created_at: string;
  updated_at: string;
}): CapabilityProfile {
  return {
    ...r,
    differentiators: r.differentiators ?? [],
    certifications: r.certifications ?? [],
  };
}

function mapJob(r: {
  id: string;
  opportunity_id: string;
  company_id: string;
  job_type: string;
  status: string;
  phase_index: number;
  public_message: string | null;
  error_message: string | null;
  result_payload: unknown;
  created_at: string;
  updated_at: string;
}): AgentJob {
  return {
    id: r.id,
    opportunity_id: r.opportunity_id,
    company_id: r.company_id,
    job_type: r.job_type as AgentJob["job_type"],
    status: r.status as AgentJobStatus,
    phase_index: r.phase_index,
    public_message: r.public_message,
    error_message: r.error_message,
    result_payload: r.result_payload,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

export function createSupabaseRepository(): GovRepository {
  const supabase = getServiceSupabase();
  if (!supabase) throw new Error("Supabase service client is not configured.");
  return {
    async getDefaultCompanyId() {
      return ensureCompany(supabase);
    },
    async getOpportunity(id: string) {
      const { data, error } = await supabase.from("opportunities").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? mapOpp(data) : null;
    },
    async listOpportunities() {
      const companyId = await ensureCompany(supabase);
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(mapOpp);
    },
    async createOpportunity(title, description) {
      const companyId = await ensureCompany(supabase);
      await ensureDefaultCapability(supabase, companyId);
      const { data, error } = await supabase
        .from("opportunities")
        .insert({ company_id: companyId, title, description, status: "draft" })
        .select("*")
        .single();
      if (error) throw error;
      return mapOpp(data);
    },
    async updateOpportunityStatus(id, status) {
      const { error } = await supabase.from("opportunities").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    async getCapabilityProfile(companyId) {
      const { data, error } = await supabase
        .from("capability_profiles")
        .select("*")
        .eq("company_id", companyId)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data ? mapCap(data) : null;
    },
    async getCapabilityProfileForOpportunity(opp) {
      return this.getCapabilityProfile(opp.company_id);
    },
    async upsertCapabilityProfile(companyId, data) {
      const existing = await this.getCapabilityProfile(companyId);
      if (!existing) {
        const { data: created, error } = await supabase
          .from("capability_profiles")
          .insert({ company_id: companyId, title: data.title ?? "Profile", ...data })
          .select("*")
          .single();
        if (error) throw error;
        return mapCap(created);
      }
      const { data: next, error } = await supabase
        .from("capability_profiles")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error) throw error;
      return mapCap(next);
    },
    async addRfpDocument(opp, file) {
      const path = `${opp.company_id}/${opp.id}/${randomUUID()}_${file.fileName}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file.buffer, {
        contentType: file.contentType,
        upsert: false,
      });
      if (upErr) throw upErr;
      const { error } = await supabase.from("rfp_documents").insert({
        company_id: opp.company_id,
        opportunity_id: opp.id,
        storage_path: path,
        file_name: file.fileName,
        content_type: file.contentType,
        file_size: file.buffer.length,
      });
      if (error) throw error;
    },
    async listRfpDocuments(oppId) {
      const { data, error } = await supabase
        .from("rfp_documents")
        .select("id, file_name, content_type, file_size, created_at")
        .eq("opportunity_id", oppId);
      if (error) throw error;
      return data ?? [];
    },
    async extractAndStoreAllChunks(opp) {
      const { data: docs, error } = await supabase
        .from("rfp_documents")
        .select("id, storage_path, file_name, content_type")
        .eq("opportunity_id", opp.id);
      if (error) throw error;
      await supabase.from("extracted_document_chunks").delete().eq("opportunity_id", opp.id);
      for (const d of docs ?? []) {
        const { data: file, error: dl } = await supabase.storage.from(BUCKET).download(d.storage_path);
        if (dl) throw dl;
        const buf = Buffer.from(await file.arrayBuffer());
        const text = await extractTextFromFile(buf, d.content_type, d.file_name);
        const parts = chunkText(text);
        const rows = parts.map((text, chunk_index) => ({
          rfp_document_id: d.id,
          opportunity_id: opp.id,
          company_id: opp.company_id,
          chunk_index,
          text,
        }));
        if (rows.length) {
          const { error: ins } = await supabase.from("extracted_document_chunks").insert(rows);
          if (ins) throw ins;
        }
      }
    },
    async getAggregateRfpText(oppId) {
      const { data, error } = await supabase
        .from("extracted_document_chunks")
        .select("text, rfp_document_id, chunk_index")
        .eq("opportunity_id", oppId)
        .order("rfp_document_id", { ascending: true })
        .order("chunk_index", { ascending: true });
      if (error) throw error;
      return (data ?? []).map((c) => c.text).join("\n\n");
    },
    async createAgentJob(opp, type) {
      const { data, error } = await supabase
        .from("agent_jobs")
        .insert({
          company_id: opp.company_id,
          opportunity_id: opp.id,
          job_type: type,
          status: "pending",
          phase_index: 0,
          public_message: "Analyzing RFP documents",
        })
        .select("id")
        .single();
      if (error) throw error;
      return { id: data.id };
    },
    async getAgentJob(id) {
      const { data, error } = await supabase.from("agent_jobs").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data ? mapJob(data) : null;
    },
    async setJobProgress(jobId, phaseIndex, status, publicMessage) {
      const { error } = await supabase
        .from("agent_jobs")
        .update({
          phase_index: phaseIndex,
          status,
          public_message: publicMessage,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
      if (error) throw error;
    },
    async failJob(jobId, err) {
      const { error } = await supabase
        .from("agent_jobs")
        .update({
          status: "failed",
          error_message: err,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
      if (error) throw error;
    },
    async persistAnalysisResults(opp, payload) {
      const c: PersistedCompatibility = payload.compatibility;
      await supabase.from("compatibility_reports").upsert(
        {
          company_id: opp.company_id,
          opportunity_id: opp.id,
          compatibility_score: c.compatibilityScore,
          bid_recommendation: c.bid_recommendation,
          recommendation_rationale: c.recommendation_rationale,
          key_risks: c.keyRisks,
          fit_summary: c.fitSummary,
          opportunity_summary: c.opportunitySummary,
        },
        { onConflict: "opportunity_id" }
      );
      await supabase.from("compliance_requirements").delete().eq("opportunity_id", opp.id);
      if (payload.compliance.length) {
        const { error } = await supabase.from("compliance_requirements").insert(
          payload.compliance.map((r) => ({
            company_id: opp.company_id,
            opportunity_id: opp.id,
            category: r.category,
            requirement: r.requirement,
            source_hint: r.sourceHint,
            status: r.status,
          }))
        );
        if (error) throw error;
      }
      await this.updateOpportunityStatus(opp.id, "analyzed");
    },
    async getAnalysisState(oppId) {
      const { data: c } = await supabase.from("compatibility_reports").select("*").eq("opportunity_id", oppId).maybeSingle();
      const { data: compRows } = await supabase
        .from("compliance_requirements")
        .select("*")
        .eq("opportunity_id", oppId);
      const compatibility = c
        ? ({
            id: c.id,
            company_id: c.company_id,
            opportunity_id: c.opportunity_id,
            compatibility_score: c.compatibility_score,
            bid_recommendation: c.bid_recommendation,
            recommendation_rationale: c.recommendation_rationale,
            key_risks: c.key_risks,
            fit_summary: c.fit_summary,
            opportunity_summary: c.opportunity_summary,
            created_at: c.created_at,
          } satisfies CompatibilityReport)
        : null;
      const compliance: ComplianceRequirement[] = (compRows ?? []).map((r) => ({
        id: r.id,
        company_id: r.company_id,
        opportunity_id: r.opportunity_id,
        category: r.category,
        requirement: r.requirement,
        source_hint: r.source_hint,
        status: r.status,
        created_at: r.created_at,
      }));
      return { compatibility, compliance };
    },
    async saveProposalSection(opp, key, title, content) {
      const { data: ex } = await supabase
        .from("proposal_sections")
        .select("id,version")
        .eq("opportunity_id", opp.id)
        .eq("section_key", key)
        .maybeSingle();
      if (ex) {
        const { error } = await supabase
          .from("proposal_sections")
          .update({
            title,
            content,
            version: ex.version + 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ex.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("proposal_sections").insert({
          company_id: opp.company_id,
          opportunity_id: opp.id,
          section_key: key,
          title,
          content,
          version: 1,
        });
        if (error) throw error;
      }
      await this.updateOpportunityStatus(opp.id, "proposal_draft");
    },
    async getProposalSection(opp, key) {
      const { data, error } = await supabase
        .from("proposal_sections")
        .select("*")
        .eq("opportunity_id", opp.id)
        .eq("section_key", key)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return data as ProposalSection;
    },
    async completeJob(jobId, result) {
      const { error } = await supabase
        .from("agent_jobs")
        .update({
          status: "complete",
          phase_index: 4,
          public_message: "Ready for review",
          result_payload: result,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);
      if (error) throw error;
    },
  };
}
