"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FileDropzone } from "@/components/FileDropzone";
import { ProgressTimeline } from "@/components/ProgressTimeline";
import { CompatibilityScoreCard } from "@/components/CompatibilityScoreCard";
import { RiskSummary } from "@/components/RiskSummary";
import { ComplianceMatrix } from "@/components/ComplianceMatrix";
import { ProposalWorkspace } from "@/components/ProposalWorkspace";
import { ChatEditor } from "@/components/ChatEditor";
import type { CompatibilityReport, ComplianceRequirement, Opportunity, ProposalSection } from "@/lib/types";

type State = {
  opportunity: Opportunity | null;
  documents: { id: string; file_name: string; content_type: string; file_size: number; created_at: string }[];
  analysis: { compatibility: CompatibilityReport | null; compliance: ComplianceRequirement[] };
  executiveSummary: ProposalSection | null;
};

type Job = {
  id: string;
  status: string;
  phase_index: number;
  public_message: string | null;
  error_message: string | null;
};

function JobPanel({ jobId, onDone }: { jobId: string; onDone: () => void }) {
  const [job, setJob] = useState<Job | null>(null);

  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    const poll = async () => {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) return;
      const j = (await res.json()) as { job: Job };
      if (cancelled) return;
      setJob(j.job);
      if (j.job.status === "complete" || j.job.status === "failed") {
        onDone();
        return;
      }
      setTimeout(poll, 1000);
    };
    void poll();
    return () => {
      cancelled = true;
    };
  }, [jobId, onDone]);

  if (!job) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">Starting background work…</div>
    );
  }

  return (
    <ProgressTimeline
      activeIndex={job.phase_index}
      isComplete={job.status === "complete"}
      isFailed={job.status === "failed"}
      publicMessage={
        job.error_message && job.status === "failed" ? job.error_message : job.public_message
      }
    />
  );
}

export function OpportunityView() {
  const { id: opportunityId } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<State | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [trackJob, setTrackJob] = useState<string | null>(null);
  const [executiveText, setExecutiveText] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/opportunities/${opportunityId}`);
    if (res.status === 404) {
      router.push("/dashboard");
      return;
    }
    const json = (await res.json()) as State & { error?: string };
    if (json.error) {
      setErr(json.error);
      return;
    }
    setData({
      opportunity: json.opportunity,
      documents: json.documents,
      analysis: json.analysis,
      executiveSummary: json.executiveSummary,
    });
    setExecutiveText(json.executiveSummary?.content ?? "");
  }, [opportunityId, router]);

  const onJobComplete = useCallback(() => {
    setTrackJob(null);
    void load();
  }, [load]);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void load();
    });
    return () => cancelAnimationFrame(id);
  }, [load]);

  if (!data?.opportunity) {
    return <div className="text-sm text-zinc-600">{err ? err : "Loading…"}</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <button type="button" onClick={() => router.push("/dashboard")} className="text-sm text-cyan-800 hover:underline">
          ← Back
        </button>
        <h1 className="mt-2 text-2xl font-semibold text-zinc-900">{data.opportunity.title}</h1>
        {data.opportunity.description && <p className="mt-1 text-sm text-zinc-600">{data.opportunity.description}</p>}
      </div>

      {trackJob && <JobPanel jobId={trackJob} onDone={onJobComplete} />}

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-900">RFP documents</h2>
        <FileDropzone
          disabled={busy}
          onFiles={async (files) => {
            setBusy(true);
            setErr(null);
            const fd = new FormData();
            fd.append("opportunityId", opportunityId);
            for (const f of Array.from(files)) fd.append("files", f);
            const res = await fetch("/api/documents/upload", { method: "POST", body: fd });
            const j = await res.json();
            setBusy(false);
            if (!res.ok) {
              setErr(typeof j.error === "string" ? j.error : "Upload failed");
              return;
            }
            await load();
          }}
        />
        <ul className="text-sm text-zinc-700">
          {data.documents.map((d) => (
            <li key={d.id}>
              {d.file_name} <span className="text-zinc-500">({Math.round(d.file_size / 1024)} KB)</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || data.documents.length === 0}
            className="rounded-lg bg-cyan-800 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-900 disabled:opacity-50"
            onClick={async () => {
              setBusy(true);
              setErr(null);
              const res = await fetch("/api/analyze/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ opportunityId }),
              });
              const j = (await res.json()) as { jobId?: string; error?: string };
              setBusy(false);
              if (!res.ok) {
                setErr(j.error ?? "Could not start analysis");
                return;
              }
              if (j.jobId) setTrackJob(j.jobId);
            }}
          >
            Run analysis
          </button>
          <button
            type="button"
            disabled={busy || !data.analysis.compatibility}
            className="rounded-lg border border-cyan-800 px-4 py-2 text-sm font-medium text-cyan-900 hover:bg-cyan-50 disabled:opacity-50"
            onClick={async () => {
              setBusy(true);
              setErr(null);
              const res = await fetch("/api/proposal/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ opportunityId }),
              });
              const j = (await res.json()) as { jobId?: string; error?: string };
              setBusy(false);
              if (!res.ok) {
                setErr(j.error ?? "Could not start draft");
                return;
              }
              if (j.jobId) setTrackJob(j.jobId);
            }}
          >
            Generate executive summary
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-900">Compatibility</h2>
        <CompatibilityScoreCard report={data.analysis.compatibility} />
        <h3 className="text-sm font-medium text-zinc-800">Key risks</h3>
        <RiskSummary report={data.analysis.compatibility} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-900">Compliance matrix</h2>
        <ComplianceMatrix items={data.analysis.compliance} />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-lg font-medium text-zinc-900">Proposal — Executive summary</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded border border-zinc-200 px-3 py-1 text-sm text-zinc-800"
              onClick={async () => {
                setBusy(true);
                const res = await fetch("/api/proposal/section", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    opportunityId,
                    sectionKey: "executive_summary",
                    title: "Executive Summary",
                    content: executiveText,
                  }),
                });
                setBusy(false);
                if (!res.ok) {
                  const j = await res.json();
                  setErr(j.error ? JSON.stringify(j.error) : "Save failed");
                  return;
                }
                await load();
              }}
            >
              Save
            </button>
          </div>
          <ProposalWorkspace
            sectionTitle="Executive summary"
            value={executiveText}
            onChange={setExecutiveText}
          />
        </div>
        <div className="min-h-[320px] lg:col-span-1">
          <ChatEditor
            opportunityId={opportunityId}
            sectionKey="executive_summary"
            sectionContent={executiveText}
            onApplied={(next) => {
              setExecutiveText(next);
            }}
          />
        </div>
      </section>
      {err && <p className="text-sm text-red-600">{err}</p>}
    </div>
  );
}
