"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { IconArrowLeft, IconFolder, IconPencil, IconPlus } from "@/components/icons";
import { ProjectDialog } from "@/components/project-dialog";
import { QuickAdd } from "@/components/quick-add";
import { TaskList } from "@/components/task-list";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { useWorkspace } from "@/components/workspace-provider";
import { sortTasks } from "@/lib/dates";
import { PROJECT_COLOR_STYLES, STATUS_LABELS, TASK_STATUSES, type TaskStatus } from "@/lib/types";

type Filter = TaskStatus | "all";

export function ProjectDetailView({ projectId }: { projectId: string }) {
  const { projects, tasks, openTaskDialog } = useWorkspace();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const project = projects.find((item) => item.id === projectId);
  const projectTasks = useMemo(
    () => sortTasks(tasks.filter((task) => task.projectId === projectId)),
    [tasks, projectId],
  );

  if (!project) {
    return (
      <div className="animate-rise">
        <EmptyState
          icon={<IconFolder className="h-5 w-5" />}
          title="Project not found"
          description="This project may have been deleted. Head back to your workspace to keep going."
          action={
            <Link href="/projects" className="btn btn-primary">
              <IconArrowLeft className="h-4 w-4" />
              Back to projects
            </Link>
          }
        />
      </div>
    );
  }

  const styles = PROJECT_COLOR_STYLES[project.color];
  const done = projectTasks.filter((task) => task.status === "done").length;
  const percent = projectTasks.length ? Math.round((done / projectTasks.length) * 100) : 0;
  const filtered = filter === "all" ? projectTasks : projectTasks.filter((task) => task.status === filter);

  return (
    <div className="animate-rise">
      <Link
        href="/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-ink"
      >
        <IconArrowLeft className="h-3.5 w-3.5" />
        All projects
      </Link>

      <PageHeader
        eyebrow="Project"
        title={`${project.emoji} ${project.name}`}
        subtitle={project.description || "No description yet — add one to give this project context."}
        actions={
          <>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              className="btn btn-secondary"
            >
              <IconPencil className="h-3.5 w-3.5" />
              Edit project
            </button>
            <button
              type="button"
              onClick={() => openTaskDialog(null, { projectId: project.id })}
              className="btn btn-primary"
            >
              <IconPlus className="h-4 w-4" />
              New task
            </button>
          </>
        }
      />

      <div className="card mb-5 grid grid-cols-3 divide-x divide-line">
        <div className="px-4 py-3.5">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Tasks</p>
          <p className="mt-1 font-serif text-xl font-semibold text-ink">{projectTasks.length}</p>
        </div>
        <div className="px-4 py-3.5">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Open</p>
          <p className="mt-1 font-serif text-xl font-semibold text-ink">
            {projectTasks.length - done}
          </p>
        </div>
        <div className="px-4 py-3.5">
          <p className="text-[11px] uppercase tracking-[0.12em] text-muted">Complete</p>
          <div className="mt-1 flex items-baseline gap-1.5">
            <p className="font-serif text-xl font-semibold text-ink">{percent}%</p>
            <span className="text-[11px] text-muted">
              ({done}/{projectTasks.length})
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <ProgressBar value={percent} className={styles.bar} />
      </div>

      <section className="card overflow-hidden">
        <div className="border-b border-line px-4 pt-3.5 sm:px-5">
          <div className="no-scrollbar flex items-center gap-1 overflow-x-auto pb-3">
            {(["all", ...TASK_STATUSES] as Filter[]).map((key) => {
              const count =
                key === "all"
                  ? projectTasks.length
                  : projectTasks.filter((task) => task.status === key).length;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    filter === key
                      ? "bg-moss-700 text-white"
                      : "text-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  {key === "all" ? "All" : STATUS_LABELS[key]}
                  <span
                    className={`rounded px-1 py-0.5 text-[10px] ${
                      filter === key ? "bg-white/15" : "bg-[#efeade] text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-3 pt-3 sm:px-4">
          <QuickAdd
            defaults={{ projectId: project.id }}
            placeholder={`Add a task to ${project.name}…`}
          />
        </div>

        <div className="p-2 sm:p-3">
          <TaskList
            tasks={filtered}
            projects={projects}
            showProject={false}
            empty={
              <EmptyState
                compact
                icon={<IconFolder className="h-5 w-5" />}
                title={projectTasks.length === 0 ? "This project is a blank page" : "Nothing here yet"}
                description={
                  projectTasks.length === 0
                    ? "Add the first task and this project starts taking shape."
                    : "No tasks match this status right now. Try another filter."
                }
                action={
                  <button
                    type="button"
                    onClick={() => openTaskDialog(null, { projectId: project.id })}
                    className="btn btn-primary"
                  >
                    <IconPlus className="h-4 w-4" />
                    Add a task
                  </button>
                }
              />
            }
          />
        </div>
      </section>

      <ProjectDialog
        open={dialogOpen}
        project={project}
        onClose={() => setDialogOpen(false)}
        onDeleted={() => router.push("/projects")}
      />
    </div>
  );
}
