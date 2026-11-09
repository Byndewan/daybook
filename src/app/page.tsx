import Link from "next/link";
import { redirect } from "next/navigation";
import { DemoButton } from "@/components/demo-button";
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconFolder,
  IconLeaf,
  IconList,
  IconSparkles,
  IconSun,
  IconTarget,
} from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_EMAIL, DEMO_PASSWORD, ensureDemoSeed } from "@/lib/seed";

export const dynamic = "force-dynamic";

const PREVIEW_TASKS = [
  { title: "Plan the weekend hike with Sam", meta: "Today · 2/4 steps", priority: "bg-amber-500", done: false },
  { title: "Review the Q3 roadmap draft", meta: "Today · Work", priority: "bg-[#c75f3f]", done: false },
  { title: "Call Mom back", meta: "Today · Personal", priority: "bg-moss-500", done: false },
  { title: "30 minutes of stretching", meta: "Done · Health", priority: "bg-slate-400", done: true },
  { title: "Meal prep for the week", meta: "Tomorrow · Home", priority: "bg-moss-500", done: false },
];

const FEATURES = [
  {
    icon: IconSun,
    title: "A day that fits your head",
    body: "Today, Upcoming and All tasks give you one honest view — no digging through folders to find what matters now.",
  },
  {
    icon: IconFolder,
    title: "Projects with soft edges",
    body: "Group work, home and health into colour-coded projects. Every task can move between them without friction.",
  },
  {
    icon: IconTarget,
    title: "Details that stay small",
    body: "Notes, checklists, priorities and due dates live inside a calm task sheet. Enough structure, never a form.",
  },
];

export default async function LandingPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  await ensureDemoSeed();

  return (
    <div className="min-h-dvh overflow-hidden bg-canvas">
      <div aria-hidden className="pointer-events-none relative">
        <div className="absolute -top-32 right-[-10%] h-[420px] w-[420px] rounded-full bg-moss-200/40 blur-3xl" />
        <div className="absolute top-24 left-[-10%] h-[320px] w-[320px] rounded-full bg-amber-100/60 blur-3xl" />
      </div>

      <header className="relative mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss-700 text-white">
            <IconLeaf className="h-4.5 w-4.5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold tracking-tight">Daybook</span>
            <span className="mt-0.5 text-[9.5px] uppercase tracking-[0.18em] text-muted">
              Personal tasks
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost">
            Sign in
          </Link>
          <Link href="/signup" className="btn btn-primary px-4">
            Get started
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto w-full max-w-6xl px-5 pb-16 sm:px-6">
        <section className="grid items-center gap-10 py-10 lg:grid-cols-[1.02fr_1fr] lg:gap-12 lg:py-16">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-moss-200 bg-moss-50 px-2.5 py-1 text-[11px] font-medium text-moss-700">
              <IconSparkles className="h-3 w-3" />
              A daybook, not a backlog
            </span>
            <h1 className="mt-4 font-serif text-[38px] leading-[1.08] font-semibold tracking-tight text-ink sm:text-[52px]">
              A calmer place to get things done.
            </h1>
            <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-muted">
              Daybook is a personal task manager for the things that actually matter — today&apos;s
              handful of priorities, the projects in motion, and the small errands in between. Clear,
              quick and quietly encouraging.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <DemoButton />
              <Link href="/signup" className="btn btn-secondary px-4 py-2.5">
                Create your daybook
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11.5px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <IconCheck className="h-3.5 w-3.5 text-moss-600" />
                Demo workspace ready
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconCheck className="h-3.5 w-3.5 text-moss-600" />
                No credit card
              </span>
              <span className="inline-flex items-center gap-1.5">
                <IconCheck className="h-3.5 w-3.5 text-moss-600" />
                Your data stays yours
              </span>
            </div>

            <p className="mt-4 text-[11.5px] text-muted">
              Prefer to sign in? Use{" "}
              <span className="rounded bg-white px-1.5 py-0.5 font-medium text-ink ring-1 ring-line">
                {DEMO_EMAIL}
              </span>{" "}
              /{" "}
              <span className="rounded bg-white px-1.5 py-0.5 font-medium text-ink ring-1 ring-line">
                {DEMO_PASSWORD}
              </span>
            </p>
          </div>

          <div className="relative animate-rise">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-[28px] bg-linear-to-br from-moss-200/50 via-transparent to-amber-100/50 blur-xl"
            />
            <div className="relative overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_20px_60px_-30px_rgba(23,35,30,0.4)]">
              <div className="flex items-center gap-2 border-b border-line bg-[#fbf9f4] px-3.5 py-2.5">
                <span className="h-2 w-2 rounded-full bg-[#e0b3a4]" />
                <span className="h-2 w-2 rounded-full bg-[#e6d5a4]" />
                <span className="h-2 w-2 rounded-full bg-[#b7d3bd]" />
                <span className="ml-2 text-[10.5px] font-medium text-muted">
                  daybook · today
                </span>
              </div>

              <div className="flex">
                <div className="hidden w-[112px] shrink-0 flex-col gap-1.5 border-r border-line bg-forest p-2.5 sm:flex">
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-moss-500/30 text-moss-100">
                      <IconLeaf className="h-3 w-3" />
                    </span>
                    <span className="font-serif text-[11px] font-semibold text-white">Daybook</span>
                  </div>
                  {[
                    { icon: IconGridLike, label: "Overview", active: false },
                    { icon: IconList, label: "All tasks", active: false },
                    { icon: IconSun, label: "Today", active: true },
                    { icon: IconCalendar, label: "Upcoming", active: false },
                    { icon: IconFolder, label: "Projects", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[9.5px] ${
                        item.active ? "bg-white/12 text-white" : "text-white/55"
                      }`}
                    >
                      <item.icon className="h-2.5 w-2.5" />
                      {item.label}
                    </div>
                  ))}
                </div>

                <div className="min-w-0 flex-1 p-3.5 sm:p-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-moss-600">
                        Tuesday, September 2
                      </p>
                      <p className="font-serif text-[15px] font-semibold text-ink">Today</p>
                    </div>
                    <span className="rounded-md bg-moss-700 px-1.5 py-1 text-[9px] font-medium text-white">
                      + New task
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {[
                      { label: "Due today", value: "3" },
                      { label: "In progress", value: "2" },
                      { label: "Done / week", value: "12" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-lg border border-line bg-[#fbf9f4] px-2 py-1.5">
                        <p className="font-serif text-[13px] font-semibold leading-none text-ink">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-[8px] text-muted">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 rounded-lg border border-line">
                    <div className="flex items-center justify-between border-b border-line px-2.5 py-1.5">
                      <span className="text-[10px] font-semibold text-ink">Today&apos;s focus</span>
                      <span className="flex items-center gap-0.5 text-[8.5px] text-muted">
                        <IconClock className="h-2.5 w-2.5" /> 3 open
                      </span>
                    </div>
                    <ul className="divide-y divide-[#f0ece1]">
                      {PREVIEW_TASKS.map((task) => (
                        <li key={task.title} className="flex items-start gap-2 px-2.5 py-2">
                          <span
                            className={`mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-full border ${
                              task.done
                                ? "border-moss-600 bg-moss-600 text-white"
                                : "border-line-strong bg-white text-transparent"
                            }`}
                          >
                            <IconCheck className="h-2 w-2" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-[10.5px] ${
                                task.done ? "text-muted line-through" : "font-medium text-ink"
                              }`}
                            >
                              {task.title}
                            </span>
                            <span className="mt-0.5 flex items-center gap-1 text-[8.5px] text-muted">
                              <span className={`h-1 w-1 rounded-full ${task.priority}`} />
                              {task.meta}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 hidden rounded-xl border border-line bg-surface px-3 py-2 shadow-lg sm:block">
              <p className="flex items-center gap-1.5 text-[10px] font-medium text-ink">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-moss-50 text-moss-700">
                  <IconCheck className="h-3 w-3" />
                </span>
                4 tasks done today
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="card p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss-50 text-moss-700">
                <feature.icon className="h-4 w-4" />
              </span>
              <h2 className="mt-3.5 text-[15px] font-semibold text-ink">{feature.title}</h2>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{feature.body}</p>
            </div>
          ))}
        </section>

        <section className="card mt-6 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-serif text-xl font-semibold text-ink">
              Start with the demo, stay for the calm.
            </h2>
            <p className="mt-1 text-[12.5px] text-muted">
              Everything is already set up — four projects, realistic tasks and a week of progress.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DemoButton className="btn btn-primary px-4 py-2.5" />
            <Link href="/signup" className="btn btn-secondary px-4 py-2.5">
              Create an account
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-line bg-[#efede5]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-[11.5px] text-muted sm:flex-row sm:px-6">
          <span className="flex items-center gap-1.5">
            <IconLeaf className="h-3.5 w-3.5 text-moss-600" />
            Daybook — a personal task manager
          </span>
          <span>Built with Next.js, Drizzle and PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}

function IconGridLike({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="3" y="14" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
    </svg>
  );
}
