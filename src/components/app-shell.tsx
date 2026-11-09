"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  IconCalendar,
  IconFolder,
  IconGrid,
  IconLeaf,
  IconList,
  IconLogout,
  IconMenu,
  IconPlus,
  IconSettings,
  IconSun,
  IconX,
} from "@/components/icons";
import { TaskDialog } from "@/components/task-dialog";
import { Avatar, ToastStack } from "@/components/ui";
import { useWorkspace } from "@/components/workspace-provider";
import { daysUntil } from "@/lib/dates";
import { PROJECT_COLOR_STYLES } from "@/lib/types";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: IconGrid },
  { href: "/tasks", label: "All tasks", icon: IconList },
  { href: "/today", label: "Today", icon: IconSun },
  { href: "/upcoming", label: "Upcoming", icon: IconCalendar },
  { href: "/projects", label: "Projects", icon: IconFolder },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, tasks, projects, openTaskDialog } = useWorkspace();
  const pathname = usePathname();
  const [signingOut, setSigningOut] = useState(false);

  const openTasks = tasks.filter((task) => task.status !== "done");
  const counts: Record<string, number> = {
    "/tasks": openTasks.length,
    "/today": openTasks.filter((task) => task.dueDate && daysUntil(task.dueDate) <= 0).length,
    "/upcoming": openTasks.filter((task) => task.dueDate && daysUntil(task.dueDate) > 0).length,
    "/projects": projects.length,
  };

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    // Hard navigation clears the client router cache so the next user never
    // sees a previous session's cached workspace.
    window.location.assign("/login");
  };

  return (
    <div className="flex h-full flex-col text-white">
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <Link
          href="/dashboard"
          prefetch
          onClick={onNavigate}
          className="flex items-center gap-2.5"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss-500/25 text-moss-200 ring-1 ring-white/10">
            <IconLeaf className="h-4.5 w-4.5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-[19px] font-semibold tracking-tight text-white">
              Daybook
            </span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-moss-200/60">
              Personal tasks
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={onNavigate}
          aria-label="Close menu"
          className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white lg:hidden"
        >
          <IconX className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            openTaskDialog();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-moss-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm shadow-black/20 transition hover:bg-moss-400"
        >
          <IconPlus className="h-4 w-4" />
          New task
        </button>
      </div>

      <nav className="mt-5 flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
          Workspace
        </p>
        <ul className="space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  prefetch
                  data-active={active}
                  onClick={onNavigate}
                  className="nav-item"
                >
                  <item.icon className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="flex-1">{item.label}</span>
                  {counts[item.href] ? (
                    <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10.5px] font-medium text-white/70">
                      {counts[item.href]}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex items-center justify-between px-2 pb-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
            Projects
          </p>
          <Link
            href="/projects"
            prefetch
            onClick={onNavigate}
            aria-label="Manage projects"
            className="rounded p-0.5 text-white/40 transition hover:text-white"
          >
            <IconPlus className="h-3.5 w-3.5" />
          </Link>
        </div>
        <ul className="space-y-0.5">
          {projects.map((project) => {
            const active = pathname === `/projects/${project.id}`;
            const count = openTasks.filter((task) => task.projectId === project.id).length;
            return (
              <li key={project.id}>
                <Link
                  href={`/projects/${project.id}`}
                  prefetch
                  data-active={active}
                  onClick={onNavigate}
                  className="nav-item"
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${PROJECT_COLOR_STYLES[project.color].dot}`}
                  />
                  <span className="flex-1 truncate">{project.name}</span>
                  {count > 0 ? (
                    <span className="text-[10.5px] font-medium text-white/45">{count}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
          {projects.length === 0 ? (
            <li className="px-2 py-2 text-xs text-white/40">
              No projects yet — create your first one.
            </li>
          ) : null}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <p className="mb-2 hidden px-1.5 text-[10.5px] text-white/35 lg:block">
          Tip: press{" "}
          <kbd className="rounded border border-white/15 bg-white/10 px-1 py-0.5 font-sans text-[10px] text-white/70">
            N
          </kbd>{" "}
          for a new task
        </p>
        <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5">
          <Avatar name={user.name} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium text-white">{user.name}</p>
            <p className="truncate text-[11px] text-white/45">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            disabled={signingOut}
            aria-label="Sign out"
            className="rounded-lg p-1.5 text-white/55 transition hover:bg-white/10 hover:text-white"
          >
            <IconLogout className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { openTaskDialog, isSyncing, dialog } = useWorkspace();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || dialog.open) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }
      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        openTaskDialog();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [dialog.open, openTaskDialog]);

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside className="sticky top-0 hidden h-dvh w-[260px] shrink-0 bg-forest lg:block">
        <SidebarContent />
      </aside>

      {/* Kept mounted (and inert while closed) so its links prefetch at first
          paint. Mobile menu switches then hit the warm router cache instantly. */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-100 lg:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!mobileOpen}
        inert={!mobileOpen}
      >
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="absolute inset-0 bg-forest/50 backdrop-blur-[2px]"
        />
        <div
          className={`absolute inset-y-0 left-0 w-[272px] max-w-[85vw] bg-forest shadow-2xl transition-transform duration-150 ease-out ${
            mobileOpen ? "translate-y-0" : "-translate-y-2"
          }`}
        >
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            className="rounded-lg border border-line bg-surface p-2 text-ink"
          >
            <IconMenu className="h-4 w-4" />
          </button>
          <Link href="/dashboard" prefetch className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-moss-700 text-white">
              <IconLeaf className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight">Daybook</span>
          </Link>
          <button
            type="button"
            onClick={() => openTaskDialog()}
            aria-label="New task"
            className="rounded-lg bg-moss-700 p-2 text-white"
          >
            <IconPlus className="h-4 w-4" />
          </button>
        </header>

        {isSyncing ? (
          <div className="fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-moss-100">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-moss-500" />
          </div>
        ) : null}

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-9">
          {children}
        </main>
      </div>

      <TaskDialog />
      <ToastStack />
    </div>
  );
}
