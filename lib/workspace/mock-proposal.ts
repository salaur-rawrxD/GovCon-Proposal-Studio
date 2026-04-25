export const capabilityOptions = [
  { id: "cloud", label: "Cloud & infrastructure" },
  { id: "cyber", label: "Cybersecurity & zero trust" },
  { id: "agile", label: "Agile / DevSecOps" },
  { id: "data", label: "Data & analytics" },
  { id: "hc", label: "Health IT" },
  { id: "civil", label: "Civilian agency programs" },
] as const;

export const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "technical", label: "Technical" },
  { value: "persuasive", label: "Persuasive" },
] as const;

export const complianceOptions = [
  { value: "basic", label: "Basic" },
  { value: "strict", label: "Strict Gov" },
  { value: "enterprise", label: "Enterprise" },
] as const;

export type ProposalSection = {
  id: string;
  title: string;
  body: string;
};

export const mockProposal: ProposalSection[] = [
  {
    id: "executive",
    title: "Executive summary",
    body: `Our team delivers a low-risk, outcomes-driven path to meet the government’s digital modernization goals. We align to your evaluation priorities through measurable milestones, independent verification, and transparent communication at every release train.

The approach emphasizes secure-by-design delivery, modern DevSecOps, and a partnership model that extends beyond go-live through sustainment and knowledge transfer. We are committed to the mission, the schedule, and the quality bar implied by your RFP and Section M weighting.`,
  },
  {
    id: "technical",
    title: "Technical approach",
    body: `We propose a reference architecture that maps directly to the performance work statement: cloud-native services with defense-in-depth controls, infrastructure-as-code, and automated security gates in CI/CD. Scalability, observability, and failure isolation are first-class.

Deliverables are tied to working software each sprint, with traceability from user stories to test evidence. Defects are triaged and resolved under a joint governance cadence, with monthly engineering reviews to address risks early.`,
  },
  {
    id: "ux",
    title: "UX approach",
    body: `Adoption and usability are de-risked through research-informed workflows, role-based access that mirrors operational reality, and training paths for administrators and end users. We pair continuous feedback with release notes and office hours, ensuring a smooth cutover and sustained use.`,
  },
  {
    id: "plan",
    title: "Project plan & governance",
    body: `The plan uses a timeboxed roadmap with a named PM, technical lead, and release train engineer. We staff to surge during integration windows and keep a clear RACI. Reporting includes burn-up/burn-down, risk register, and decision logs suitable for your oversight and COR engagement.`,
  },
];
