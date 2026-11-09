"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowRight, IconFolder, IconPencil, IconPlus } from "@/components/icons";
import { ProjectDialog } from "@/components/project-dialog";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { useWorkspace } from "@/components/workspace-provider";
import { PROJECT_COLOR_STYLES, type Project } from "@/lib/types";

export default function ProjectsPage() {
  const { projects, tasks } = useWorkspace();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setDialogOpen(true);
  };

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Workspace"
        title="Projects"
        subtitle={
          projects.length > 0
            ? `${projects.length} ${projects.length === 1 ? "project" : "projects"} keeping your tasks grouped`
            : "Group related tasks so nothing gets lost"
        }
        actions={
          <button type="button" onClick={openCreate} className="btn btn-primary">
            <IconPlus className="h-4 w-4" />
            New project
          </button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={<IconFolder className="h-5 w-5" />}
          title="No projects yet"
          description="Projects are a gentle way to keep work, home and health from blurring together. Create your first one."
          action={
            <button type="button" onClick={openCreate} className="btn btn-primary">
              <IconPlus className="h-4 w-4" />
              Create a project
            </button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id);
            const done = projectTasks.filter((task) => task.status === "done").length;
            const openCount = projectTasks.length - done;
            const percent = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
            const styles = PROJECT_COLOR_STYLES[project.color];

            return (
              <div
                key={project.id}
                className="card group flex flex-col p-4 transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(23,35,30,0.07)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/projects/${project.id}`} className="flex min-w-0 items-start gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${styles.soft}`}
                    >
                      {project.emoji}
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-[15px] font-semibold text-ink group-hover:text-moss-700">
                        {project.name}
                      </h2>
                      <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-muted">
                        {project.description || "No description yet"}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => openEdit(project)}
                    aria-label={`Edit ${project.name}`}
                    className="rounded-md p-1.5 text-muted opacity-0 transition hover:bg-canvas hover:text-ink group-hover:opacity-100 focus:opacity-100"
                  >
                    <IconPencil className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted">
                    <span>
                      {done} of {projectTasks.length} done
                    </span>
                    <span className="font-medium text-ink">{percent}%</span>
                  </div>
                  <ProgressBar value={percent} className={styles.bar} />
                </div>

                <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3">
                  <span className="chip bg-canvas text-muted">
                    {openCount} open {openCount === 1 ? "task" : "tasks"}
                  </span>
                  <Link
                    href={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 text-[11.5px] font-medium text-moss-700 hover:underline"
                  >
                    Open project
                    <IconArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={openCreate}
            className="flex min-h-[190px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong bg-[#fbf9f4] p-4 text-center transition hover:border-moss-400 hover:bg-moss-50/40"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-moss-600 ring-1 ring-line">
              <IconPlus className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium text-ink">New project</span>
            <span className="max-w-[180px] text-[11.5px] text-muted">
              A fresh home for a fresh set of tasks
            </span>
          </button>
        </div>
      )}

      <ProjectDialog open={dialogOpen} project={editing} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
