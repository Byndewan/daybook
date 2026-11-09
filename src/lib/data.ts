import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { projects, subtasks, tasks } from "@/db/schema";
import type { Project, ProjectColor, Subtask, Task, TaskPriority, TaskStatus } from "@/lib/types";
import { PROJECT_COLORS } from "@/lib/types";

function asStatus(value: string): TaskStatus {
  return value === "in_progress" || value === "done" ? value : "todo";
}

function asPriority(value: string): TaskPriority {
  return value === "low" || value === "high" || value === "urgent" ? value : "medium";
}

function asColor(value: string): ProjectColor {
  return (PROJECT_COLORS as readonly string[]).includes(value) ? (value as ProjectColor) : "moss";
}

export async function getProjects(userId: string): Promise<Project[]> {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(asc(projects.createdAt));

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    color: asColor(row.color),
    emoji: row.emoji,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getTasks(userId: string): Promise<Task[]> {
  const taskRows = await db
    .select()
    .from(tasks)
    .where(eq(tasks.userId, userId))
    .orderBy(desc(tasks.createdAt));

  if (taskRows.length === 0) return [];

  const childRows = await db
    .select()
    .from(subtasks)
    .where(
      inArray(
        subtasks.taskId,
        taskRows.map((row) => row.id),
      ),
    )
    .orderBy(asc(subtasks.createdAt));

  const byTask = new Map<string, Subtask[]>();
  for (const child of childRows) {
    const list = byTask.get(child.taskId) ?? [];
    list.push({ id: child.id, title: child.title, done: child.done });
    byTask.set(child.taskId, list);
  }

  return taskRows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    notes: row.notes,
    status: asStatus(row.status),
    priority: asPriority(row.priority),
    dueDate: row.dueDate,
    tags: row.tags ?? [],
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    subtasks: byTask.get(row.id) ?? [],
  }));
}

export async function getTaskById(userId: string, taskId: string): Promise<Task | null> {
  const all = await getTasks(userId);
  return all.find((task) => task.id === taskId) ?? null;
}
