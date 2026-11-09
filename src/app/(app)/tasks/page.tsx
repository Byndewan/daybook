"use client";

import { useMemo, useState } from "react";
import { IconPlus, IconSearch, IconX } from "@/components/icons";
import { QuickAdd } from "@/components/quick-add";
import { TaskList } from "@/components/task-list";
import { EmptyState, PageHeader } from "@/components/ui";
import { useWorkspace } from "@/components/workspace-provider";
import { sortTasks } from "@/lib/dates";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";

type StatusFilter = TaskStatus | "all";
type PriorityFilter = TaskPriority | "all";
type SortKey = "smart" | "due" | "priority" | "newest";

const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 } as const;

export default function TasksPage() {
  const { tasks, projects, openTaskDialog } = useWorkspace();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [projectId, setProjectId] = useState<string>("all");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [sort, setSort] = useState<SortKey>("smart");

  const counts = useMemo(
    () => ({
      all: tasks.length,
      todo: tasks.filter((task) => task.status === "todo").length,
      in_progress: tasks.filter((task) => task.status === "in_progress").length,
      done: tasks.filter((task) => task.status === "done").length,
    }),
    [tasks],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let result = tasks.filter((task) => {
      if (status !== "all" && task.status !== status) return false;
      if (projectId === "none" && task.projectId !== null) return false;
      if (projectId !== "all" && projectId !== "none" && task.projectId !== projectId) return false;
      if (priority !== "all" && task.priority !== priority) return false;
      if (!needle) return true;
      const haystack = [task.title, task.notes, ...task.tags, ...task.subtasks.map((s) => s.title)]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });

    if (sort === "newest") {
      result = [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sort === "due") {
      result = [...result].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    } else if (sort === "priority") {
      result = [...result].sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]);
    } else {
      result = sortTasks(result);
    }
    return result;
  }, [tasks, query, status, projectId, priority, sort]);

  const filtersActive =
    query.trim().length > 0 || status !== "all" || projectId !== "all" || priority !== "all";

  const clearFilters = () => {
    setQuery("");
    setStatus("all");
    setProjectId("all");
    setPriority("all");
    setSort("smart");
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    ...TASK_STATUSES.map((value) => ({ key: value as StatusFilter, label: STATUS_LABELS[value] })),
  ];

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Workspace"
        title="All tasks"
        subtitle={`${counts.all} tasks · ${counts.todo + counts.in_progress} still open`}
        actions={
          <button type="button" onClick={() => openTaskDialog()} className="btn btn-primary">
            <IconPlus className="h-4 w-4" />
            New task
          </button>
        }
      />

      <section className="card overflow-hidden">
        <div className="border-b border-line px-4 py-4 sm:px-5">
          <QuickAdd placeholder="Quick add — type a task and press enter" />

          <div className="mt-3.5 flex flex-col gap-3">
            <div className="relative">
              <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search titles, notes, tags or checklist steps…"
                aria-label="Search tasks"
                className="field pl-9"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-muted transition hover:text-ink"
                >
                  <IconX className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <div className="no-scrollbar -mx-1 flex items-center gap-1 overflow-x-auto px-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setStatus(tab.key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    status === tab.key
                      ? "bg-moss-700 text-white"
                      : "text-muted hover:bg-canvas hover:text-ink"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded px-1 py-0.5 text-[10px] ${
                      status === tab.key ? "bg-white/15" : "bg-[#efeade] text-muted"
                    }`}
                  >
                    {counts[tab.key]}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                aria-label="Filter by project"
                className="field w-auto min-w-[136px] py-1.5 text-xs"
              >
                <option value="all">All projects</option>
                <option value="none">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.emoji} {project.name}
                  </option>
                ))}
              </select>

              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as PriorityFilter)}
                aria-label="Filter by priority"
                className="field w-auto min-w-[124px] py-1.5 text-xs"
              >
                <option value="all">Any priority</option>
                {TASK_PRIORITIES.map((value) => (
                  <option key={value} value={value}>
                    {PRIORITY_LABELS[value]}
                  </option>
                ))}
              </select>

              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as SortKey)}
                aria-label="Sort tasks"
                className="field w-auto min-w-[124px] py-1.5 text-xs"
              >
                <option value="smart">Smart order</option>
                <option value="due">Due date</option>
                <option value="priority">Priority</option>
                <option value="newest">Newest</option>
              </select>

              {filtersActive ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="btn btn-ghost px-2 py-1.5 text-xs text-moss-700 hover:bg-moss-50"
                >
                  Clear filters
                </button>
              ) : null}

              <span className="ml-auto text-[11.5px] text-muted">
                {filtered.length} shown
              </span>
            </div>
          </div>
        </div>

        <div className="p-2 sm:p-3">
          <TaskList
            tasks={filtered}
            projects={projects}
            empty={
              tasks.length === 0 ? (
                <EmptyState
                  icon={<IconPlus className="h-5 w-5" />}
                  title="No tasks yet"
                  description="Start with something small. You can always add notes, a due date and a checklist later."
                  action={
                    <button
                      type="button"
                      onClick={() => openTaskDialog()}
                      className="btn btn-primary"
                    >
                      <IconPlus className="h-4 w-4" />
                      Create your first task
                    </button>
                  }
                />
              ) : (
                <EmptyState
                  compact
                  icon={<IconSearch className="h-5 w-5" />}
                  title="No tasks match those filters"
                  description="Try a different status, project or search, or clear everything and start again."
                  action={
                    <button type="button" onClick={clearFilters} className="btn btn-secondary">
                      Clear filters
                    </button>
                  }
                />
              )
            }
          />
        </div>
      </section>
    </div>
  );
}
