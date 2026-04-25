"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/shell/PageContainer";
import { ProjectWorkspace } from "@/components/projects/ProjectWorkspace";
import { useProjectData } from "@/contexts/ProjectDataContext";
import { buttonVariants } from "@/components/ui/button";

function ProjectById() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { getProject } = useProjectData();
  const project = getProject(id);

  if (!project) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-semibold">Project unavailable</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          This record is not in the current session. Return to Home or create a new response to start a workspace.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/dashboard" className={buttonVariants()}>
            Home
          </Link>
          <Link href="/start" className={buttonVariants({ variant: "outline" })}>
            New response
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-[1600px] px-0">
      <ProjectWorkspace key={project.id} project={project} />
    </PageContainer>
  );
}

export default function ProjectByIdPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <p className="text-sm text-muted-foreground">Loading workspace…</p>
        </PageContainer>
      }
    >
      <ProjectById />
    </Suspense>
  );
}
