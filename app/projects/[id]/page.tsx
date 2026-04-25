"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PageContainer } from "@/components/shell/PageContainer";
import { ProjectWorkspace } from "@/components/projects/ProjectWorkspace";
import { useProjectData } from "@/contexts/ProjectDataContext";
import { buttonVariants } from "@/components/ui/button";

export default function ProjectByIdPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const { getProject } = useProjectData();
  const project = getProject(id);

  if (!project) {
    return (
      <PageContainer>
        <h1 className="text-2xl font-semibold">Project not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This project may not exist in your session. Start from the dashboard or create a new response.
        </p>
        <div className="mt-4 flex gap-2">
          <Link href="/dashboard" className={buttonVariants()}>
            Dashboard
          </Link>
          <Link href="/start" className={buttonVariants({ variant: "outline" })}>
            Start New Response
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="max-w-6xl">
      <ProjectWorkspace project={project} />
    </PageContainer>
  );
}
