import type { Project } from "@/lib/mock/types";
import { seedSubmitted } from "@/lib/mock/seed";

function daysUntil(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (86400 * 1000));
}

export function isActiveRfp(p: Project) {
  return p.status !== "archived" && p.status !== "submitted";
}

/** Active pursuits: open in pipeline (not yet submitted, not archived) */
export function getOpenRfpCount(projects: Project[]) {
  return projects.filter(isActiveRfp).length;
}

/**
 * Action items across active projects: one per next action + one per first open risk
 * (aligns with Home “Open tasks” list).
 */
export function getOpenTaskCount(projects: Project[]) {
  const active = projects.filter(isActiveRfp);
  let n = 0;
  for (const p of active) {
    if (p.nextAction?.trim()) n += 1;
    if (p.openRisks[0]) n += 1;
  }
  return n;
}

/** Logged submitted responses in the session preview (seed) */
export function getSubmittedResponseCount() {
  return seedSubmitted.length;
}

export { daysUntil };
