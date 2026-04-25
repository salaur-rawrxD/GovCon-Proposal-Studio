import { getMemoryStore } from "@/lib/repository/memoryStore";
import type { GovRepository } from "@/lib/repository/govRepository";
import { chunkText } from "@/lib/documents/chunkText";
import { extractTextFromFile } from "@/lib/documents/extractText";
import type { Opportunity, CompatibilityReport } from "@/lib/types";

export function createMemoryRepository(): GovRepository {
  return {
    async getDefaultCompanyId() {
      return getMemoryStore().defaultCompanyId;
    },
    async getOpportunity(id: string) {
      return getMemoryStore().getOpportunity(id);
    },
    async listOpportunities() {
      const cid = getMemoryStore().defaultCompanyId;
      return getMemoryStore().listOpportunities(cid);
    },
    async createOpportunity(title, description) {
      const companyId = getMemoryStore().defaultCompanyId;
      return getMemoryStore().createOpportunity(title, description, companyId);
    },
    async updateOpportunityStatus(id, status) {
      getMemoryStore().updateOpportunityStatus(id, status);
    },
    async getCapabilityProfile(companyId) {
      return getMemoryStore().getCapability(companyId);
    },
    async getCapabilityProfileForOpportunity(opp) {
      return getMemoryStore().getCapability(opp.company_id);
    },
    async upsertCapabilityProfile(companyId, data) {
      return getMemoryStore().upsertCapability(companyId, data);
    },
    async addRfpDocument(opp, file) {
      getMemoryStore().addDocument(opp.id, opp.company_id, file.fileName, file.contentType, file.buffer);
    },
    async listRfpDocuments(oppId) {
      return getMemoryStore()
        .listDocuments(oppId)
        .map((d) => ({
          id: d.id,
          file_name: d.file_name,
          content_type: d.content_type,
          file_size: d.file_size,
          created_at: d.created_at,
        }));
    },
    async extractAndStoreAllChunks(opp) {
      const store = getMemoryStore();
      store.clearChunksForOpportunity(opp.id);
      for (const doc of store.listDocuments(opp.id)) {
        const buf = store.getDocumentFile(doc.id);
        if (!buf) continue;
        const text = await extractTextFromFile(buf, doc.content_type, doc.file_name);
        const parts = chunkText(text);
        store.addChunks(doc.id, opp.id, opp.company_id, parts);
      }
    },
    async getAggregateRfpText(oppId) {
      return getMemoryStore().getAggregateText(oppId);
    },
    async createAgentJob(opp, type) {
      const j = getMemoryStore().createJob(opp.company_id, opp.id, type);
      return { id: j.id };
    },
    async getAgentJob(id) {
      return getMemoryStore().getJob(id);
    },
    async setJobProgress(jobId, phaseIndex, status, publicMessage) {
      getMemoryStore().setJobPhase(jobId, phaseIndex, status, publicMessage);
    },
    async failJob(jobId, error) {
      getMemoryStore().setJobError(jobId, error);
    },
    async persistAnalysisResults(opp, payload) {
      const store = getMemoryStore();
      const c = payload.compatibility;
      store.setCompatibility(opp, {
        opportunity_id: opp.id,
        company_id: opp.company_id,
        compatibility_score: c.compatibilityScore,
        bid_recommendation: c.bid_recommendation,
        recommendation_rationale: c.recommendation_rationale,
        key_risks: c.keyRisks,
        fit_summary: c.fitSummary,
        opportunity_summary: c.opportunitySummary,
      } satisfies Omit<CompatibilityReport, "id" | "created_at">);
      store.setCompliance(
        opp.company_id,
        opp.id,
        payload.compliance.map((r) => ({
          company_id: opp.company_id,
          opportunity_id: opp.id,
          category: r.category,
          requirement: r.requirement,
          source_hint: r.sourceHint,
          status: r.status,
        }))
      );
      store.updateOpportunityStatus(opp.id, "analyzed");
    },
    async getAnalysisState(oppId) {
      return {
        compatibility: getMemoryStore().getCompatibility(oppId),
        compliance: getMemoryStore().getCompliance(oppId),
      };
    },
    async saveProposalSection(opp, key, title, content) {
      getMemoryStore().setProposalSection(opp, key, title, content);
      getMemoryStore().updateOpportunityStatus(opp.id, "proposal_draft");
    },
    async getProposalSection(opp, key) {
      return getMemoryStore().getSection(opp.id, key);
    },
    async completeJob(jobId, result) {
      getMemoryStore().completeJob(jobId, result);
    },
  };
}
