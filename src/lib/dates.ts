import type { Task, TaskStatus } from "@/lib/types";

const MS_DAY = 24 * 60 * 60 * 1000;

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDaysISO(base: Date, days: number): string {
  return toISODate(new Date(base.getTime() + days * MS_DAY));
}

export function parseISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

export function daysUntil(value: string): number {
  const target = parseISODate(value).getTime();
  const today = parseISODate(todayISO()).getTime();
  return Math.round((target - today) / MS_DAY);
}

export function formatDueLabel(value: string | null): string {
  if (!value) return "No date";
  const diff = daysUntil(value);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff < -1) return `${Math.abs(diff)} days ago`;
  if (diff > 1 && diff < 7) {
    return parseISODate(value).toLocaleDateString("en-US", { weekday: "short" });
  }
  return parseISODate(value).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatLongDate(value: Date | string): string {
  const date = typeof value === "string" ? parseISODate(value) : value;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function isOverdue(task: Pick<Task, "dueDate" | "status">): boolean {
  if (!task.dueDate || task.status === "done") return false;
  return daysUntil(task.dueDate) < 0;
}

export function isDueToday(task: Pick<Task, "dueDate" | "status">): boolean {
  if (!task.dueDate || task.status === "done") return false;
  return daysUntil(task.dueDate) === 0;
}

export function sortTasks(tasks: Task[]): Task[] {
  const priorityRank = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
  return [...tasks].sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (b.status === "done" && a.status !== "done") return -1;
    if (a.dueDate && b.dueDate && a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;
    if (a.priority !== b.priority) return priorityRank[a.priority] - priorityRank[b.priority];
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function statusOf(task: Task): TaskStatus {
  return task.status;
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
