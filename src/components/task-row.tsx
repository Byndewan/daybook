"use client";

import { IconCalendar, IconCheck, IconList, IconTrash } from "@/components/icons";
import { priorityStyles } from "@/components/ui";
import { useWorkspace } from "@/components/workspace-provider";
import { daysUntil, formatDueLabel } from "@/lib/dates";
import { PROJECT_COLOR_STYLES, type Project, type Task } from "@/lib/types";

export function TaskRow({
  task,
  project,
  showProject = true,
}: {
  task: Task;
  project?: Project;
  showProject?: boolean;
}) {
  const { toggleTask, deleteTask, openTaskDialog } = useWorkspace();
  const done = task.status === "done";
  const completedChildren = task.subtasks.filter((child) => child.done).length;
  const dueDiff = task.dueDate ? daysUntil(task.dueDate) : null;
  const overdue = !done && dueDiff !== null && dueDiff < 0;
  const dueToday = !done && dueDiff === 0;
  const projectColors = project ? PROJECT_COLOR_STYLES[project.color] : null;

  return (
    <li className="group flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-[#faf8f2] sm:px-3">
      <button
        type="button"
        onClick={() => void toggleTask(task)}
        aria-label={done ? `Mark ${task.title} as to do` : `Complete ${task.title}`}
        className={`mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border transition ${
          done
            ? "border-moss-600 bg-moss-600 text-white"
            : "border-line-strong bg-white text-transparent hover:border-moss-500 hover:text-moss-300"
        }`}
      >
        <IconCheck className="h-3 w-3" />
      </button>

      <button
        type="button"
        onClick={() => openTaskDialog(task)}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={`text-[14px] leading-snug ${
              done ? "text-muted line-through decoration-muted/50" : "font-medium text-ink"
            }`}
          >
            {task.title}
          </span>
          {task.status === "in_progress" && !done ? (
            <span className="chip bg-ocean-50 text-ocean-700">In progress</span>
          ) : null}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-muted">
          {showProject && project ? (
            <span className={`chip ${projectColors?.soft} ${projectColors?.text}`}>
              <span aria-hidden>{project.emoji}</span>
              {project.name}
            </span>
          ) : null}

          {task.dueDate ? (
            <span
              className={`inline-flex items-center gap-1 ${
                overdue ? "font-medium text-[#a8472c]" : dueToday ? "font-medium text-moss-700" : ""
              }`}
            >
              <IconCalendar className="h-3 w-3" />
              {formatDueLabel(task.dueDate)}
            </span>
          ) : null}

          {task.subtasks.length > 0 ? (
            <span className="inline-flex items-center gap-1">
              <IconList className="h-3 w-3" />
              {completedChildren}/{task.subtasks.length}
            </span>
          ) : null}

          <span className="inline-flex items-center gap-1.5 capitalize">
            <span className={`h-1.5 w-1.5 rounded-full ${priorityStyles[task.priority].dot}`} />
            {task.priority}
          </span>

          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-muted/80">
              #{tag}
            </span>
          ))}
        </div>
      </button>

      <div className="flex items-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => openTaskDialog(task)}
          aria-label={`Edit ${task.title}`}
          className="rounded-md p-1.5 text-muted transition hover:bg-moss-50 hover:text-moss-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.7}
            strokeLinecap="round"
            className="h-3.5 w-3.5"
          >
            <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => void deleteTask(task.id)}
          aria-label={`Delete ${task.title}`}
          className="rounded-md p-1.5 text-muted transition hover:bg-[#fbeae4] hover:text-[#a8472c]"
        >
          <IconTrash className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}
