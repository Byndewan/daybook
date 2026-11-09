"use client";

import Link from "next/link";
import { IconCalendar, IconCheck, IconPlus } from "@/components/icons";
import { TaskList } from "@/components/task-list";
import { EmptyState, PageHeader } from "@/components/ui";
import { useWorkspace } from "@/components/workspace-provider";
import { daysUntil, formatLongDate, formatDueLabel, parseISODate, sortTasks } from "@/lib/dates";
import type { Task } from "@/lib/types";

export default function UpcomingPage() {
  const { tasks, projects, openTaskDialog } = useWorkspace();

  const open = tasks.filter((task) => task.status !== "done" && task.dueDate);
  const groups = new Map<string, Task[]>();
  for (const task of open) {
    if (!task.dueDate) continue;
    const diff = daysUntil(task.dueDate);
    if (diff <= 0 || diff > 30) continue;
    const list = groups.get(task.dueDate) ?? [];
    list.push(task);
    groups.set(task.dueDate, list);
  }
  const orderedDates = Array.from(groups.keys()).sort();
  const unscheduled = sortTasks(tasks.filter((task) => task.status !== "done" && !task.dueDate));
  const overdueCount = tasks.filter(
    (task) => task.status !== "done" && task.dueDate && daysUntil(task.dueDate) < 0,
  ).length;

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow="Next 30 days"
        title="Upcoming"
        subtitle={
          orderedDates.length > 0
            ? `${open.length} scheduled tasks across ${orderedDates.length} days`
            : "Nothing scheduled in the next month"
        }
        actions={
          <button type="button" onClick={() => openTaskDialog()} className="btn btn-primary">
            <IconPlus className="h-4 w-4" />
            Schedule a task
          </button>
        }
      />

      {overdueCount > 0 ? (
        <Link
          href="/today"
          className="mb-5 flex items-center justify-between rounded-xl border border-[#f0d4c8] bg-[#fbeae4] px-4 py-3 text-sm text-[#8f3a22] transition hover:bg-[#f8e0d7]"
        >
          <span>
            <strong className="font-semibold">{overdueCount}</strong> overdue{" "}
            {overdueCount === 1 ? "task needs" : "tasks need"} attention
          </span>
          <span className="text-xs font-medium">Review today →</span>
        </Link>
      ) : null}

      {orderedDates.length === 0 ? (
        <EmptyState
          icon={<IconCalendar className="h-5 w-5" />}
          title="A wide open month"
          description="Nothing is scheduled for the next 30 days. Put a few things on the calendar so future-you knows what's coming."
          action={
            <button type="button" onClick={() => openTaskDialog()} className="btn btn-primary">
              <IconPlus className="h-4 w-4" />
              Add a scheduled task
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {orderedDates.map((date) => {
            const dayTasks = sortTasks(groups.get(date) ?? []);
            const dateObject = parseISODate(date);
            return (
              <section key={date} className="card overflow-hidden">
                <div className="flex items-center justify-between border-b border-line bg-[#fbf9f4] px-4 py-2.5 sm:px-5">
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-sm font-semibold text-ink">{formatDueLabel(date)}</h2>
                    <span className="text-[11.5px] text-muted">
                      {formatLongDate(dateObject)}
                    </span>
                  </div>
                  <span className="chip bg-moss-50 text-moss-700">{dayTasks.length}</span>
                </div>
                <div className="p-2 sm:p-3">
                  <TaskList tasks={dayTasks} projects={projects} />
                </div>
              </section>
            );
          })}
        </div>
      )}

      <section className="card mt-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
              <IconCheck className="h-4 w-4 text-muted" />
              Someday
            </h2>
            <p className="text-[11.5px] text-muted">Open tasks waiting for a date</p>
          </div>
          <Link href="/tasks" className="text-xs font-medium text-moss-700 hover:underline">
            All tasks
          </Link>
        </div>
        <div className="p-2 sm:p-3">
          <TaskList
            tasks={unscheduled}
            projects={projects}
            empty={
              <EmptyState
                compact
                icon={<IconCheck className="h-5 w-5" />}
                title="Everything has a date"
                description="Every open task has a day attached. That's a well-planned workspace."
              />
            }
          />
        </div>
      </section>
    </div>
  );
}
