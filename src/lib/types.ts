export const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const PROJECT_COLORS = ["moss", "ocean", "amber", "rose", "violet"] as const;
export type ProjectColor = (typeof PROJECT_COLORS)[number];

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type Task = {
  id: string;
  projectId: string | null;
  title: string;
  notes: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  tags: string[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
};

export type Project = {
  id: string;
  name: string;
  description: string;
  color: ProjectColor;
  emoji: string;
  createdAt: string;
};

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export type TaskInput = {
  title: string;
  notes?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string | null;
  dueDate?: string | null;
  tags?: string[];
  subtasks?: { id?: string; title: string; done?: boolean }[];
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PROJECT_COLOR_STYLES: Record<
  ProjectColor,
  { dot: string; soft: string; text: string; bar: string }
> = {
  moss: { dot: "bg-moss-600", soft: "bg-moss-50", text: "text-moss-700", bar: "bg-moss-500" },
  ocean: { dot: "bg-ocean-600", soft: "bg-ocean-50", text: "text-ocean-700", bar: "bg-ocean-500" },
  amber: { dot: "bg-amber-500", soft: "bg-amber-50", text: "text-amber-700", bar: "bg-amber-500" },
  rose: { dot: "bg-rose-500", soft: "bg-rose-50", text: "text-rose-700", bar: "bg-rose-500" },
  violet: { dot: "bg-violet-500", soft: "bg-violet-50", text: "text-violet-700", bar: "bg-violet-500" },
};
