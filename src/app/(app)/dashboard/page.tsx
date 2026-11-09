"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconAlert,
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconClock,
  IconLeaf,
  IconPlus,
  IconSparkles,
  IconSun,
  IconTarget,
} from "@/components/icons";
import { QuickAdd } from "@/components/quick-add";
import { TaskList } from "@/components/task-list";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui";
import { useWorkspace } from "@/components/workspace-provider";
import { daysUntil, formatDueLabel, formatLongDate, sortTasks, todayISO } from "@/lib/dates";
import { PROJECT_COLOR_STYLES } from "@/lib/types";

function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "text-moss-700",
  soft = "bg-moss-50",
}: {
  label: string;
  value: number;
  hint: string;
  icon: React.ReactNode;
  accent?: string;
  soft?: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${soft} ${accent}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 font-serif text-[28px] leading-none font-semibold text-ink">{value}</p>
      <p className="mt-1.5 text-[11.5px] text-muted">{hint}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, tasks, projects, openTaskDialog, resetDemoData } = useWorkspace();
  const router = useRouter();

  const open = tasks.filter((task) => task.status !== "done");
  const focus = sortTasks(open.filter((task) => task.dueDate && daysUntil(task.dueDate) <= 0));
  const overdue = open.filter((task) => task.dueDate && daysUntil(task.dueDate) < 0);
  const dueToday = open.filter((task) => task.dueDate && daysUntil(task.dueDate) === 0);
  const inProgress = open.filter((task) => task.status === "in_progress");
  const done = tasks.filter((task) => task.status === "done");

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const completedThisWeek = done.filter(
    (task) => task.completedAt && new Date(task.completedAt).getTime() >= weekAgo,
  ).length;

  const completion = tasks.length > 0 ? Math.round((done.length / tasks.length) * 100) : 0;
  const upNext = sortTasks(
    open.filter((task) => task.dueDate && daysUntil(task.dueDate) > 0),
  ).slice(0, 5);

  const projectStats = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const projectDone = projectTasks.filter((task) => task.status === "done").length;
    return {
      project,
      total: projectTasks.length,
      done: projectDone,
      percent: projectTasks.length ? Math.round((projectDone / projectTasks.length) * 100) : 0,
    };
  });

  const firstName = user.name.split(" ")[0];

  return (
    <div className="animate-rise">
      <PageHeader
        eyebrow={<span suppressHydrationWarning>{formatLongDate(new Date())}</span>}
        title={`Welcome back, ${firstName}`}
        subtitle={
          tasks.length === 0
            ? "A fresh start. Add your first task to get the day moving."
            : `${dueToday.length + overdue.length} tasks need attention today — you have ${open.length} open in total.`
        }
        actions={
          <>
            <button
              type="button"
              onClick={() => router.push("/tasks")}
              className="btn btn-secondary"
            >
              <IconCalendar className="h-4 w-4" />
              Browse all
            </button>
            <button type="button" onClick={() => openTaskDialog()} className="btn btn-primary">
              <IconPlus className="h-4 w-4" />
              New task
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Due today"
          value={dueToday.length}
          hint={dueToday.length ? "Close them out today" : "Nothing left for today"}
          icon={<IconSun className="h-4 w-4" />}
        />
        <StatCard
          label="In progress"
          value={inProgress.length}
          hint="Currently on your plate"
          icon={<IconClock className="h-4 w-4" />}
          soft="bg-ocean-50"
          accent="text-ocean-600"
        />
        <StatCard
          label="Overdue"
          value={overdue.length}
          hint={overdue.length ? "Worth a quick reshuffle" : "All caught up"}
          icon={<IconAlert className="h-4 w-4" />}
          soft="bg-[#fbeae4]"
          accent="text-[#a8472c]"
        />
        <StatCard
          label="Done this week"
          value={completedThisWeek}
          hint="Keep the streak going"
          icon={<IconCheck className="h-4 w-4" />}
          soft="bg-amber-50"
          accent="text-amber-700"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
              <div>
                <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                  <IconTarget className="h-4 w-4 text-moss-600" />
                  Today&apos;s focus
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  {focus.length > 0
                    ? `${focus.length} tasks due today or earlier`
                    : "Your plate is clear for today"}
                </p>
              </div>
              <Link
                href="/today"
                className="btn btn-ghost px-2 py-1 text-xs text-moss-700 hover:bg-moss-50"
              >
                Open today
                <IconArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="px-3 pt-3 sm:px-4">
              <QuickAdd
                defaults={{ dueDate: todayISO() }}
                placeholder="What needs doing today?"
              />
            </div>

            <div className="p-2 sm:p-3">
              {tasks.length === 0 ? (
                <EmptyState
                  icon={<IconLeaf className="h-5 w-5" />}
                  title="Your daybook is empty"
                  description="Add a task or load the sample workspace to see how Daybook feels with real data."
                  action={
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => openTaskDialog(null, { dueDate: todayISO() })}
                        className="btn btn-primary"
                      >
                        <IconPlus className="h-4 w-4" />
                        First task
                      </button>
                      <button
                        type="button"
                        onClick={() => void resetDemoData()}
                        className="btn btn-secondary"
                      >
                        <IconSparkles className="h-4 w-4" />
                        Load sample data
                      </button>
                    </div>
                  }
                />
              ) : (
                <TaskList
                  tasks={focus}
                  projects={projects}
                  empty={
                    <EmptyState
                      compact
                      icon={<IconCheck className="h-5 w-5" />}
                      title="Nothing due today"
                      description="Everything scheduled for today is done. Enjoy the breathing room, or get a head start on what's next."
                      action={
                        <Link href="/upcoming" className="btn btn-secondary">
                          See what&apos;s next
                        </Link>
                      }
                    />
                  }
                />
              )}
            </div>
          </section>

          {inProgress.length > 0 ? (
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
                <h2 className="flex items-center gap-2 text-base font-semibold text-ink">
                  <IconClock className="h-4 w-4 text-ocean-600" />
                  In progress
                </h2>
                <span className="chip bg-ocean-50 text-ocean-700">{inProgress.length}</span>
              </div>
              <div className="p-2 sm:p-3">
                <TaskList tasks={inProgress} projects={projects} />
              </div>
            </section>
          ) : null}
        </div>

        <div className="space-y-5">
          <section className="card p-5">
            <h2 className="text-base font-semibold text-ink">Momentum</h2>
            <p className="mt-0.5 text-xs text-muted">Your completion across all tasks</p>
            <div className="mt-5 flex items-center gap-5">
              <div
                className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(var(--color-moss-500) ${
                    completion * 3.6
                  }deg, #ece7da 0deg)`,
                }}
              >
                <div className="flex h-[84px] w-[84px] flex-col items-center justify-center rounded-full bg-surface">
                  <span className="font-serif text-xl font-semibold leading-none text-ink">
                    {completion}%
                  </span>
                  <span className="mt-1 text-[10px] uppercase tracking-wide text-muted">done</span>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-serif text-xl leading-none font-semibold text-ink">
                    {done.length}
                  </p>
                  <p className="text-[11.5px] text-muted">tasks completed</p>
                </div>
                <div>
                  <p className="font-serif text-xl leading-none font-semibold text-ink">
                    {completedThisWeek}
                  </p>
                  <p className="text-[11.5px] text-muted">in the last 7 days</p>
                </div>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Projects</h2>
              <Link
                href="/projects"
                className="text-xs font-medium text-moss-700 hover:underline"
              >
                Manage
              </Link>
            </div>
            {projectStats.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                No projects yet.{" "}
                <Link href="/projects" className="font-medium text-moss-700 hover:underline">
                  Create one
                </Link>
              </p>
            ) : (
              <ul className="mt-4 space-y-3.5">
                {projectStats.slice(0, 4).map(({ project, done: projectDone, total, percent }) => (
                  <li key={project.id}>
                    <Link
                      href={`/projects/${project.id}`}
                      className="group flex items-center justify-between gap-2 text-sm"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span aria-hidden className="text-[13px]">
                          {project.emoji}
                        </span>
                        <span className="truncate font-medium text-ink group-hover:text-moss-700">
                          {project.name}
                        </span>
                      </span>
                      <span className="shrink-0 text-[11px] text-muted">
                        {projectDone}/{total}
                      </span>
                    </Link>
                    <div className="mt-1.5">
                      <ProgressBar
                        value={percent}
                        className={PROJECT_COLOR_STYLES[project.color].bar}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Up next</h2>
              <Link href="/upcoming" className="text-xs font-medium text-moss-700 hover:underline">
                Calendar
              </Link>
            </div>
            {upNext.length === 0 ? (
              <p className="mt-3 text-sm text-muted">
                Nothing scheduled ahead yet. A calm week, or time to plan?
              </p>
            ) : (
              <ul className="mt-3 space-y-1">
                {upNext.map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      onClick={() => openTaskDialog(task)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-1 py-1.5 text-left transition hover:bg-[#faf8f2]"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-moss-400" />
                      <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                        {task.title}
                      </span>
                      <span className="shrink-0 text-[11px] text-muted">
                        {formatDueLabel(task.dueDate)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
