import { buildAnalysisSnapshotMilestones } from "@/lib/schedule/milestones";
import {
  type ComplianceMatrixRow,
  type ProposalSectionModel,
  type ProposalChatMessage,
  type RfpFullAnalysis,
  type Project,
} from "./types";

/** One canonical, government-style analysis used as template; agency/title from project. */
function baseAnalysis(p: Project): RfpFullAnalysis {
  return {
    snapshot: {
      agency: p.agency,
      projectName: p.rfpTitle,
      keyDeadlines: buildAnalysisSnapshotMilestones({ keyDeadlines: p.keyDeadlines, dueDate: p.dueDate }),
      solicitationUrl: p.agencyPortalUrl,
      agencyContact: p.agencyPoc,
      submissionMethod: "Grants.gov / SAM.gov / Agency portal as stated in Section L. Electronic submission; page limits per Section 4.0.",
      contractType: "Firm fixed price with optional CLINs; potential hybrid with time-and-materials for surge sustainment, per PWS 2.1.",
      evaluationSummary:
        "Per Section M, technical approach (including transition and security) is the dominant factor, followed by past performance, then cost/price. Unbalanced proposals may be rejected at agency discretion. Small business credit applies per FAR 19 and solicitation provisions.",
    },
    fit: {
      score: p.fitScore,
      recommendation: p.recommendation,
      topReasons: [
        "Multiple recent DevSecOps and FedRAMP-aligned references align with the PWS call for continuous ATO and pipeline automation on cloud-native baselines.",
        "Team holds active agency-facing credentials (CAGE, DUNS) and a documented 800-171 control inheritance path; matches Section 3.4 security and privacy sub-factors.",
        "Past performance on comparable scope (multi-tenant services, CISO governance touchpoints) supports a credible transition plan within the 90-day target.",
        "Rate structure and small business / subcontractor approach fit typical HHS/OCIO evaluation patterns for T&M or hybrid CLINs without pricing anomalies in recent bids.",
        "Gaps are manageable: strengthen CMMC packaging and add a second civil-sector reference with measurable outcome metrics to reduce perceived implementation risk.",
      ],
      cotsLikelihood: p.recommendation === "go" ? "medium" : "low",
      evidenceQuotes: [
        "\"Offeror shall implement secure SDLC, automated security testing, and evidence suitable for a continuous Authority to Operate (cATO) package [Section 3.4.2].\"",
        "\"Evaluation will assess offeror’s ability to operate, sustain, and modernize a shared cloud platform in alignment with the agency’s Zero Trust architecture and logging requirements.\"",
      ],
    },
    opportunity: {
      problem:
        "The agency requires a long-term, security-first cloud engineering partner to harden, operate, and continuously improve a shared service platform for mission applications—reducing toil, improving deployment velocity, and meeting federal cyber hygiene mandates.",
      whyItMatters:
        "A delay in ATO, observability, or shared infrastructure reliability directly weakens public-facing services and complicates GAO/FISMA reporting. A credible transition that avoids rework is a political and operational win.",
      whatProposalMustProve:
        "That your team can execute a disciplined transition, sustain production operations with clear SLAs, and demonstrate measurable control effectiveness—not generic cloud claims. Strong Section M past performance, explicit Section L mapping, and defensible cost realism under CLINs will carry the day.",
    },
    alignment: {
      whereWeFit:
        "Your core strengths—automation, SSP packaging, and federal-style governance (ITIL + Agile) — map to the PWS’s emphasis on pipeline integration, change control, and continuous monitoring. Your knowledge base’s FedRAMP and NIST 800-53 call-outs are directly reusable.",
      whereWeMayNot:
        "The agency will scrutinize 24/7 service desk surge for peak releases and HVA assessments; if your model leans on overseas follow-the-sun without explicit consent, you need a defensible onshore/CONUS model or a waiver plan.",
      knowledgeMatches: [
        "FedRAMP / NIST 800-53 family mappings (knowledge: boilerplate and compliance).",
        "Civil health interoperability case study and CPARS-style outcomes (knowledge: case study / past performance).",
        "Core PM and staffing plan templates (knowledge: team and boilerplate).",
      ],
      missingProof: [
        "Signed teaming letter for the proposed DevSecOps sub if not yet executed.",
        "One additional relevant federal contract within 36 months in the $5–15M TCV band if Section M is interpreted narrowly.",
        "System diagram showing log routing to agency SIEM with retention consistent with the draft PWS 3.5.",
      ],
    },
    gaps: [
      {
        gap: "CMMC Level 2 artifacts not fully packaged in knowledge base (SSP supplement + POA&M narrative).",
        impact: "Medium—may be read as program risk in technical factor depending on the COR’s cyber posture read.",
        mitigation: "Fast-track 800-171 gap closure with assessor of record; include interim compensating control narrative with dates.",
        owner: "Security / ISSO",
      },
      {
        gap: "Second civil-sector past performance with outcome metrics (availability, lead time) not yet in Section M table.",
        impact: "Medium in past performance if incumbent has stronger references.",
        mitigation: "Pull CPARS narrative from VA/CMS reference; add Program metrics PDF as attachment pointer.",
        owner: "Capture / PMO",
      },
    ],
    questions: [
      {
        question: "Can the government confirm the intended ATO package baseline (HHS or tenant-specific) for year one?",
        whyItMatters: "Affects resourcing, SSP boundary, and schedule risk; drives staffing on security vs. app teams.",
      },
      {
        question: "Is there a preferred SIEM/UEBA stack the agency expects for log and alert correlation?",
        whyItMatters: "Avoids costly rework on connectors and supports realistic IL6-to-cloud paths if required.",
      },
    ],
    winStrategy: {
      positioning: "Emphasize low-risk transition to cATO, measurable pipeline acceleration, and operator-grade observability in language evaluators can score—tied to explicit PWS subsections and Section M factors.",
      differentiators: [
        "Credible cATO and POA&M velocity with a named ISSO and continuous compliance dashboard.",
        "Proven on-call + release window staffing model with U.S. CONUS handoffs.",
        "Reusable playbooks (DR, IR, PIR) with agency-specific data classification handling.",
      ],
      hotButtons: [
        "Zero Trust alignment (ICAM, device compliance, network segmentation in diagrams).",
        "Accessibility (Section 508) with tested artifact references.",
        "Subcontractor governance and order-of-precedence in disputes.",
      ],
    },
    recommendedNextStep:
      p.recommendation === "no_go" ? "no_bid" : p.recommendation === "go_with_conditions" ? "pursue_conditions" : "proceed_draft",
  };
}

export const HHS_DEMO_COMPLIANCE: ComplianceMatrixRow[] = [
  {
    id: "cm1",
    requirement: "Implement secure SDLC and automated SAST/DAST in CI/CD; evidence in SSP.",
    source: "PWS 3.4.2 / p. 12",
    responseSection: "Technical Approach §3.1",
    status: "approved",
    confidence: "high",
    notes: "Map to toolchains and gating; cite pipeline diagram.",
    owner: "Tech lead",
  },
  {
    id: "cm2",
    requirement: "Past performance: three (3) relevant within three (3) years, federal preferred.",
    source: "Section M.2.1 / p. 45",
    responseSection: "Past Performance",
    status: "needs_review",
    confidence: "high",
    notes: "Add second civil reference with CPARS link.",
    owner: "Capture",
  },
  {
    id: "cm3",
    requirement: "Small business subcontracting plan (FAR 52.219-9) if over threshold.",
    source: "Section L, Attachment 7",
    responseSection: "Management / compliance",
    status: "drafted",
    confidence: "medium",
    notes: "Confirm dollar threshold vs. option years.",
    owner: "Contracts",
  },
  {
    id: "cm4",
    requirement: "CMMC Level 2 alignment path; POA&M for any inherited controls not met day one.",
    source: "PWS 3.5 / p. 18",
    responseSection: "Security & risk",
    status: "missing_info",
    confidence: "medium",
    notes: "Pending ISSO attestation on inherited controls from agency tenant.",
    owner: "Security",
  },
  {
    id: "cm5",
    requirement: "Agile reporting: bi-weekly sprint review artifacts and release notes.",
    source: "SOW 3.2.4 / p. 7",
    responseSection: "Project Management",
    status: "approved",
    confidence: "high",
    notes: "Align with burn-down in §4.2.",
    owner: "PMO",
  },
  {
    id: "cm6",
    requirement: "508/WCAG 2.1 AA for all deliverable UIs; test results on file.",
    source: "Section C / L.3",
    responseSection: "UX & accessibility",
    status: "drafted",
    confidence: "high",
    notes: "Add VPAT and remediation backlog.",
    owner: "UX lead",
  },
  {
    id: "cm7",
    requirement: "Data rights / IP: unlimited rights for custom code unless otherwise negotiated.",
    source: "FAR 52.227-14 alt",
    responseSection: "Attachments / cost",
    status: "not_started",
    confidence: "low",
    notes: "Confirm prime vs. sub data rights flow-down.",
    owner: "Legal",
  },
  {
    id: "cm8",
    requirement: "Key personnel: PM and ISSO in named roles for Option Year 1.",
    source: "PWS 4.0 / p. 22",
    responseSection: "Staffing / resumes",
    status: "needs_review",
    confidence: "high",
    notes: "Resumes in Appendix B need format compliance.",
    owner: "PMO",
  },
];

const sectionTemplates = (p: Project): ProposalSectionModel[] => {
  const now = new Date().toISOString();
  return [
    {
      id: "executive",
      title: "Executive Summary",
      shortDescription: "Mission alignment, value proposition, and clear win theme for evaluators.",
      status: "needs_review",
      lastEdited: now,
      sectionGoal: "Score technical risk reduction and cATO path in the first 90 days.",
      body: `The Department of Health and Human Services (HHS) ${p.rfpTitle} requires a low-risk, Security-by-Design partner to harden, operate, and continuously improve a shared cloud platform. Our team delivers a proven DevSecOps operating model, FedRAMP-reusable control narratives, and federal acquisition discipline aligned to the evaluation criteria in Section M. Within the first 90 days, we will stand up a continuous Authority to Operate (cATO) program package, baseline CI/CD with automated SAST/DAST, and 24/7 U.S. CONUS operations for release windows—so mission teams ship faster without trading security outcomes.\n\nWe propose a fixed transition plan with defined exit criteria, transparent metrics (deployment frequency, change failure rate, mean time to restore), and joint governance with the agency CISO. Our approach is tailored to the PWS: pipeline automation, Zero Trust–aligned access patterns, and operator-grade logging that feeds agency SIEM requirements without bespoke engineering sprawl. Cost realism is supported by a CLIN-structured price volume consistent with the labor mix and past performance on comparable TCV.`,
      inlineNotes: "Tighten to two pages; add HHS program acronym once confirmed with capture.",
      sourceRefs: "PWS 3.4, Section M (technical), Section L.3 page limits",
    },
    {
      id: "need",
      title: "Understanding of Need",
      shortDescription: "Problem framing, stakeholders, and constraints the government cares about.",
      status: "drafting",
      lastEdited: now,
      sectionGoal: "Show we read the PWS, not a generic 'digital transformation' blurb.",
      body: `HHS requires an enterprise partner to sustain a multi-tenant cloud service while modernizing the delivery path for dependent applications. The PWS calls out: (1) cATO and continuous control monitoring, (2) release velocity and secure SDLC, (3) high-availability run operations with transparent SLAs, and (4) reporting suitable for FISMA and E-Government Act obligations. The government’s risk is not “more cloud” but rework: immature change control, weak logging, and unclear ATO scope across tenants.\n\nWe interpret key constraints as: maintain production stability for existing users; align with the agency’s Zero Trust architecture and identity posture; and avoid vendor lock-in by automating against standard APIs. Our understanding explicitly maps each sub-factor in Section 3.0 to a measurable outcome (e.g., time-to-ATO, deployment frequency, sev-1/2 MTTR) so the evaluation team can score traceability.`,
      inlineNotes: "",
      sourceRefs: "PWS 1.0, 2.0 background; evaluation Section M.1",
    },
    {
      id: "technical",
      title: "Technical Approach",
      shortDescription: "Architecture, security, engineering practices, and transition.",
      status: "drafting",
      lastEdited: now,
      sectionGoal: "Win the technical factor with diagrams + control language tied to 3.4.x.",
      body: `Our technical approach is built around a secure supply chain, immutable infrastructure, and a shared platform control plane. Baseline architecture uses infrastructure-as-code (IaC) with environment parity; secrets management via a centralized service; and policy-as-code in CI to enforce NIST 800-53 and agency overlays at commit time. SAST, DAST, and container image scanning are mandatory gates, with a documented waiver path when mission urgency requires a time-bound risk acceptance.\n\nFor operations, we implement blue/green or canary releases in production with automated rollback, backed by 24/7 L2/L3 support in CONUS. Observability: structured logs, distributed traces, and security event forwarding to the agency’s SIEM with retention consistent with the PWS. The transition plan reduces blast radius: discover–baseline–migrate workloads in tranches, with a named ISSO, weekly risk register, and cATO deliverables tied to the agency’s eMASS process.\n\n[Diagram placeholder: control inheritance / shared responsibility for agency tenant and contractor-managed components]`,
      inlineNotes: "Insert architecture diagram; confirm SIEM product name in Q&A.",
      sourceRefs: "PWS 3.3–3.5; Section M technical subfactors",
    },
    {
      id: "ux",
      title: "UX / User-Centered Approach",
      shortDescription: "Research, accessibility, and adoption for mission success.",
      status: "not_started",
      lastEdited: now,
      sectionGoal: "508 + mission-user outcomes, not wireframe filler.",
      body: "We will stand up a lightweight research cadence: baseline usability metrics, accessibility testing on representative workflows, and adoption instrumentation (time-on-task, error rates) reported to the Product Owner. WCAG 2.1 AA is our minimum; a VPAT and remediation log accompany each major release per Section L. Change management and training are tied to the release calendar so operators and mission users are not surprise-upgraded in peak periods.",
      inlineNotes: "",
      sourceRefs: "L.3 508, PWS 3.1 user support",
    },
    {
      id: "pm",
      title: "Project Management Approach",
      shortDescription: "Governance, schedule, quality, and reporting to the government.",
      status: "revised",
      lastEdited: now,
      sectionGoal: "Credible PMBOK+Agile hybrid with government-facing R/G/Y reporting.",
      body: "Program governance: weekly integrated program review, monthly program risk review, and a single authoritative roadmap with dependency tracking across platforms and applications. We staff a lead PM, deputy, and product owner on the government side, with a Release Train Engineer to coordinate sprints, capacity, and service desk surge during release windows. Reporting includes burn-down, release readiness checklists, and a transparent defect backlog with sev-1/2 time-to-restore. Quality management ties exit criteria in test environments to production promotion policies.",
      inlineNotes: "Align R/G/Y to COR expectations—done by Friday.",
      sourceRefs: "PWS 3.2, CDRL list",
    },
    {
      id: "implementation",
      title: "Implementation Plan",
      shortDescription: "Phased cutover, milestones, and exit criteria for transition.",
      status: "not_started",
      lastEdited: now,
      sectionGoal: "30/60/90 with explicit handoffs and cATO deliverables.",
      body: "Phase 0 (Weeks 1-2): discovery, CMDB alignment, and risk register. Phase 1 (Weeks 3-6): stand up non-prod, pipeline integration, and baseline ATO package draft. Phase 2 (Weeks 7-12): production cutover in tranche A, expand observability, and validate DR rehearsal. Each phase has exit criteria, rollback triggers, and joint sign-off. Option-year planning accounts for HVA assessments and new tenant onboarding without gold-plating custom builds.",
      inlineNotes: "",
      sourceRefs: "PWS 2.0 schedule; Section L formatting",
    },
    {
      id: "staffing",
      title: "Staffing Plan",
      shortDescription: "Key personnel, surge model, and clearance posture.",
      status: "needs_review",
      lastEdited: now,
      sectionGoal: "Named KPs with backfills and 24/7 coverage.",
      body: "Key personnel per Section F: Program Manager, ISSO, Lead DevSecOps Engineer, and Service Delivery Manager, each with resume compliance and letters of commitment. L2/L3 on-call is CONUS; surge model adds release-window pods without unauthorized overseas access to production. Cross-training and shadowing are mandatory before holiday coverage windows. If key personnel must change, we follow the 30-day notification and overlap rule with government approval unless waived as non-material.",
      inlineNotes: "Add backup ISSO for Option Year 1",
      sourceRefs: "PWS 4.0, Section M staffing",
    },
    {
      id: "past_performance",
      title: "Past Performance",
      shortDescription: "Relevant federal contracts and CPARS themes.",
      status: "drafting",
      lastEdited: now,
      sectionGoal: "3 references with outcome metrics, aligned to M.2.1",
      body: "Reference 1: CMS interoperability modernization; CPARS: Exceptional/Very Good on quality; reduced integration defects by 38% in first year. Reference 2: DHS cloud hardening; strong cyber scorecard; cATO in 4 months. Reference 3: GSA program support; on-time, on-budget; earned value discipline. We include relevance narratives mapping scope, TCV, and period of performance to this solicitation, with COR contact validation per Section L.",
      inlineNotes: "Add civil-only reference if M interpreted narrowly",
      sourceRefs: "Section M.2, SF 330/DD254 as applicable",
    },
    {
      id: "risk",
      title: "Risk Management",
      shortDescription: "Top risks, mitigations, and government partnership.",
      status: "not_started",
      lastEdited: now,
      sectionGoal: "Risks the evaluators can score: ATO, SIEM, workload surge.",
      body: "Top risks: (1) cATO package rework if tenant scope shifts—mitigate with weekly boundary review with ISSO; (2) SIEM connector performance—pilot in non-prod with agreed SLIs; (3) surge staffing during release crunches—pre-negotiate surge CLIN. Each risk is tracked in a public register (R/G/Y) with owner, target date, and trigger criteria for escalation to the CO/COR. We will not 'surprise' the government with new risks at oral presentations—early disclosure is a standing agenda item in IPR.",
      inlineNotes: "",
      sourceRefs: "PWS risk CDRL, FAR 37.2",
    },
    {
      id: "accessibility",
      title: "Accessibility / Compliance",
      shortDescription: "Section 508, privacy, and cross-cutting policy alignment.",
      status: "not_started",
      lastEdited: now,
      sectionGoal: "Concrete testing and remediation process.",
      body: "We test against WCAG 2.1 AA and agency-specific 508 test processes where provided. A VPAT is updated per major release, with a prioritized defect backlog. Privacy reviews align to NIST 800-53 privacy controls; data at rest and in transit use agency-approved solutions. PII/PHI handling is documented with minimum necessary, retention, and DLP integration consistent with the PWS.",
      inlineNotes: "",
      sourceRefs: "L.3, HHS 508 if referenced",
    },
    {
      id: "pricing",
      title: "Pricing Assumptions",
      shortDescription: "BOE, CLINs, and realism narrative.",
      status: "not_started",
      lastEdited: now,
      sectionGoal: "Defensible FTE/level mix, no T&M dumping.",
      body: "The price model aligns CLINs to the labor mix in Section B: base sustainment, optional surge, and non-recurring transition. We document basis of estimate (industry parametrics + historical velocity), G&A, and fee consistent with the contract type. Assumptions include government turnaround on ATO and network approvals within stated windows. Exclusions: third-party software licenses that are not yet agency-owned are called out; travel is at actuals per JTR unless otherwise required by PWS.",
      inlineNotes: "",
      sourceRefs: "Price schedule, PWS 5.0",
    },
    {
      id: "appendices",
      title: "Appendices",
      shortDescription: "Resumes, org chart, and supporting artifacts index.",
      status: "not_started",
      lastEdited: now,
      sectionGoal: "Cross-reference to volume page limits; no orphan attachments.",
      body: "Appendix A: Resumes. Appendix B: Organogram and facility list. Appendix C: Past performance evidence index. Each appendix is cross-referenced from the main volume with consistent numbering for evaluators. Page counts respect Section L unless agency waives format for the oral phase.",
      inlineNotes: "",
      sourceRefs: "Section L, attachments index",
    },
  ];
};

export function getRfpAnalysis(p: Project): RfpFullAnalysis {
  return baseAnalysis(p);
}

export function getComplianceMatrix(p: Project): ComplianceMatrixRow[] {
  if (p.id === "proj_seed_doe" && p.recommendation === "no_go") {
    return HHS_DEMO_COMPLIANCE.map((r) => ({ ...r, status: "not_started" as const, notes: "No-bid project — rows retained for reference only." }));
  }
  return HHS_DEMO_COMPLIANCE;
}

const TECH_CHAT: ProposalChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "Make this more executive-level. Lead with why HHS would choose us, not the pipeline feature list.",
    sectionId: "technical",
  },
  {
    id: "m2",
    role: "assistant",
    content:
      "Here is a more executive version of the opening that ties mission outcome to the evaluation factor before introducing engineering details.",
    sectionId: "technical",
    suggestedRevision: `HHS is investing in a shared cloud platform to reduce toil, strengthen cyber posture, and keep mission services reliable for the public. Our technical approach is designed to be scored as low-risk in Section M: we pair an inherited security baseline (FedRAMP-style evidence) with measurable engineering outcomes—cATO timeliness, change failure rate, and incident response performance—so evaluators can separate commodity cloud claims from operator-grade delivery.\n\nBeneath that executive through-line, the solution implements secure SDLC automation, CONUS 24/7 support for high-stakes release windows, and a Zero Trust–aligned access model that the agency can audit without bespoke plumbing. The remainder of this section details how we deliver those outcomes, not *whether* we use CI/CD; the government is buying an accountable operating outcome.`,
  },
];

export function getProposalSectionTemplates(p: Project): ProposalSectionModel[] {
  return sectionTemplates(p);
}

export function getSampleChatForSection(): ProposalChatMessage[] {
  return TECH_CHAT;
}

const ANALYSIS_CHAT: ProposalChatMessage[] = [
  {
    id: "a1",
    role: "user",
    content: "Summarize the strongest basis for our pursuit recommendation in three bullets an executive can repeat in gate review.",
    sectionId: "analysis",
  },
  {
    id: "a2",
    role: "assistant",
    content:
      "Here is a concise gate-review summary you can read verbatim or drop into your capture brief.",
    sectionId: "analysis",
    suggestedRevision: `• **Fit to requirements:** The solicitation aligns with our DevSecOps, cATO, and federal operations credentials; the PWS language maps cleanly to evidence we already maintain in the knowledge base.\n• **Disciplined risk:** Gaps (e.g., CMMC packaging, second civil reference) are identifiable and mitigable before submission with named owners—no unknown unknowns on the critical path.\n• **Evaluation focus:** Technical approach and past performance carry the score; our win story should lead with measurable outcomes and Section M traceability, not generic cloud claims.`,
  },
];

export function getSampleAnalysisChat(): ProposalChatMessage[] {
  return ANALYSIS_CHAT;
}

export function getReviewComments(p: Project) {
  return {
    comments: [
      { id: "r1", who: "Legal", when: "Apr 22", text: "Confirm data rights and IP flow-downs in Section C. Align with subcontractor SOW for IP deliverables." },
      { id: "r2", who: "Pricing", when: "Apr 21", text: "CLIN 3 hours may be light for integration window—consider narrative tie to option surge CLIN or adjust BOE with COR concurrence in post-submission (if Q&A reopens)." },
    ],
    issues: ["Attach signed teaming LOI for DevSecOps partner.", "Add CPARS one-pager for GSA Alliant task order reference (Reference 1)."],
    missing: [
      "Facility clearance evidence (if PWS 4.2 is interpreted to require it for hybrid teams)",
      "Price volume table of contents / page count check vs. L.3",
    ],
    flags: [
      "Evaluation shows past performance as a strong subfactor; strengthen Section M mapping to your three references—avoid thin relevance.",
    ],
  };
}

export function getFinalQualityScore(p: Project): number {
  return Math.min(99, 72 + Math.round(p.readinessScore / 4));
}
