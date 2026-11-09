"use client";

import Link from "next/link";
import { IconAlert, IconCheck, IconPlus, IconSun } from "@/components/icons";
import { QuickAdd } from "@/components/quick-add";
import { TaskList } from "@/components/task-list";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { useWorkspace } from "@/components/workspace-provider";
import { daysUntil, formatLongDate, sortTasks, todayISO } from "@/lib/dates";

export default function TodayPage() {
  const { tasks, projects, openTaskDialog } = useWorkspace();

  const open = tasks.filter((task) => task.status !== "done");
  const overdue = sortTasks(open.filter((task) => task.dueDate && daysUntil(task.dueDate) < 0));
  const todayTasks = sortTasks(
    tasks.filter(
      (task) => task.status !== "done" && task.dueDate && daysUntil(task.dueDate) === 0,
    ),
  );
  const completedToday = tasks.filter(
    (task) =>
      task.status === "done" &&
      task.completedAt !== null &&
      new Date(task.completedAt).toDateString() === new Date().toDateString(),
  );
  const unscheduled = sortTasks(open.filter((task) => !task.dueDate)).slice(0, 6);

  const totalToday = todayTasks.length + overdue.length;
  const progress = totalToday + completedToday.length > 0
    ? Math.round((completedToday.length / (totalToday + completedToday.length)) * 100)
    : 0;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={<span suppressHydrationWarning>{formatLongDate(new Date())}</span>}
        title="Today"
        subtitle={
          totalToday === 0
            ? "Nothing scheduled. Add something or enjoy the quiet."
            : `${totalToday} open ${totalToday === 1 ? "task" : "tasks"} for today${
                overdue.length ? ` · ${overdue.length} overdue` : ""
              }`
        }
        actions={
          <button
            type="button"
            onClick={() => openTaskDialog(null, { dueDate: todayISO() })}
            className="btn btn-primary"
          >
            <IconPlus className="h-4 w-4" />
            Add today&apos;s task
          </button>
        }
      />

      {totalToday + completedToday.length > 0 ? (
        <div className="card mb-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss-50 text-moss-700">
              <IconSun className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-medium text-ink">
                {completedToday.length} of {completedToday.length + totalToday} done today
              </p>
              <p className="text-[11.5px] text-muted">
                {progress === 100
                  ? "Every task closed out — beautifully done."
                  : "Small steps count. Keep going."}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-56">
            <div className="mb-1 flex justify-between text-[11px] text-muted">
              <span>Daily progress</span>
              <span className="font-medium text-ink">{progress}%</span>
            </div>
            <ProgressBar value={progress} />
          </div>
        </div>
      ) : null}

      {overdue.length > 0 ? (
        <section className="card mb-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              <IconAlert className="h-4 w-4 text-[#a8472c]" />
              Overdue
            </h2>
            <span className="chip bg-[#fbeae4] text-[#a8472c]">{overdue.length}</span>
          </div>
          <div className="p-2 sm:p-3">
            <TaskList tasks={overdue} projects={projects} />
          </div>
        </section>
      ) : null}

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
          <h2 className="text-base font-semibold text-ink">Due today</h2>
          <span className="chip bg-moss-50 text-moss-700">{todayTasks.length}</span>
        </div>
        <div className="px-3 pt-3 sm:px-4">
          <QuickAdd defaults={{ dueDate: todayISO() }} placeholder="Add a task for today…" />
        </div>
        <div className="p-2 sm:p-3">
          <TaskList
            tasks={todayTasks}
            projects={projects}
            empty={
              <EmptyState
                compact
                icon={<IconCheck className="h-5 w-5" />}
                title="Today is clear"
                description="No tasks are due today. Add one above, or take the win and step away from the desk."
                action={
                  <Link href="/upcoming" className="btn btn-secondary">
                    Plan ahead
                  </Link>
                }
              />
            }
          />
        </div>
      </section>

      {completedToday.length > 0 ? (
        <section className="card mt-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              <IconCheck className="h-4 w-4 text-moss-600" />
              Completed today
            </h2>
            <span className="chip bg-moss-50 text-moss-700">{completedToday.length}</span>
          </div>
          <div className="p-2 sm:p-3">
            <TaskList tasks={completedToday} projects={projects} />
          </div>
        </section>
      ) : null}

      {unscheduled.length > 0 ? (
        <section className="card mt-5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
            <div>
              <h2 className="text-base font-semibold text-ink">Anytime</h2>
              <p className="text-[11.5px] text-muted">Open tasks without a date</p>
            </div>
            <Link href="/tasks" className="text-xs font-medium text-moss-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="p-2 sm:p-3">
            <TaskList tasks={unscheduled} projects={projects} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
