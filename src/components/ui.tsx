"use client";

import type { ReactNode } from "react";
import { IconCheck, IconX } from "@/components/icons";
import { useWorkspace } from "@/components/workspace-provider";
import { PRIORITY_LABELS, type TaskPriority } from "@/lib/types";

export const priorityStyles: Record<TaskPriority, { chip: string; dot: string }> = {
  urgent: { chip: "bg-[#fbeae4] text-[#a8472c]", dot: "bg-[#c75f3f]" },
  high: { chip: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  medium: { chip: "bg-moss-50 text-moss-700", dot: "bg-moss-500" },
  low: { chip: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
};

export function PriorityChip({ priority }: { priority: TaskPriority }) {
  const style = priorityStyles[priority];
  return (
    <span className={`chip ${style.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-moss-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-2xl font-semibold text-ink sm:text-[28px]">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  compact = false,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-[#fbf9f4] text-center ${
        compact ? "px-5 py-8" : "px-6 py-14"
      }`}
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-moss-50 text-moss-600">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ProgressBar({
  value,
  className = "bg-moss-500",
}: {
  value: number;
  className?: string;
}) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#ece7da]">
      <div
        className={`h-full rounded-full transition-all duration-500 ${className}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const dimension = size === "sm" ? "h-7 w-7 text-[11px]" : size === "lg" ? "h-12 w-12 text-base" : "h-9 w-9 text-xs";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-moss-500 to-moss-700 font-semibold text-white ${dimension}`}
    >
      {initials || "D"}
    </span>
  );
}

export function ToastStack() {
  const { toasts, dismissToast } = useWorkspace();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-pop pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-forest-soft bg-forest px-3.5 py-2.5 text-sm text-white shadow-lg shadow-black/20"
        >
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              toast.tone === "error"
                ? "bg-[#c75f3f]"
                : toast.tone === "info"
                  ? "bg-white/15"
                  : "bg-moss-500"
            }`}
          >
            {toast.tone === "error" ? (
              <IconX className="h-3.5 w-3.5" />
            ) : (
              <IconCheck className="h-3.5 w-3.5" />
            )}
          </span>
          <p className="flex-1 leading-snug">{toast.message}</p>
          {toast.action ? (
            <button
              type="button"
              onClick={() => {
                toast.action?.onClick();
                dismissToast(toast.id);
              }}
              className="rounded-md px-2 py-1 text-xs font-semibold text-moss-200 transition hover:bg-white/10 hover:text-white"
            >
              {toast.action.label}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss notification"
            className="rounded-md p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <IconX className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function ProjectPill({
  name,
  emoji,
  colorClass = "bg-moss-50 text-moss-700",
}: {
  name: string;
  emoji?: string;
  colorClass?: string;
}) {
  return (
    <span className={`chip ${colorClass}`}>
      {emoji ? <span aria-hidden>{emoji}</span> : null}
      {name}
    </span>
  );
}


