import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, subtasks, tasks } from "@/db/schema";
import { getTaskById } from "@/lib/data";
import {
  PROJECT_COLORS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Project,
  type ProjectColor,
  type Task,
  type TaskInput,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";

export class InputError extends Error {}

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function optionalStatus(value: unknown): TaskStatus | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && (TASK_STATUSES as readonly string[]).includes(value)) {
    return value as TaskStatus;
  }
  throw new InputError("Unknown task status");
}

function optionalPriority(value: unknown): TaskPriority | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && (TASK_PRIORITIES as readonly string[]).includes(value)) {
    return value as TaskPriority;
  }
  throw new InputError("Unknown priority");
}

function cleanTags(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => cleanText(tag, 24).toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, 6);
}

function cleanDueDate(value: unknown): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  throw new InputError("Due date must look like YYYY-MM-DD");
}

function cleanSubtasks(
  value: unknown,
): { title: string; done: boolean }[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is { title?: unknown; done?: unknown } => typeof item === "object" && item !== null)
    .map((item) => ({
      title: cleanText(item.title, 160),
      done: Boolean(item.done),
    }))
    .filter((item) => item.title.length > 0)
    .slice(0, 20);
}

async function replaceSubtasks(taskId: string, children: { title: string; done: boolean }[]) {
  await db.delete(subtasks).where(eq(subtasks.taskId, taskId));
  if (children.length > 0) {
    await db.insert(subtasks).values(
      children.map((child) => ({ taskId, title: child.title, done: child.done })),
    );
  }
}

export async function createTask(userId: string, input: TaskInput): Promise<Task> {
  const title = cleanText(input.title, 180);
  if (!title) throw new InputError("Give your task a title");

  const projectId = input.projectId ?? null;
  if (projectId) {
    const owned = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
      .limit(1);
    if (owned.length === 0) throw new InputError("Project not found");
  }

  const status = optionalStatus(input.status) ?? "todo";

  const [row] = await db
    .insert(tasks)
    .values({
      userId,
      title,
      notes: cleanText(input.notes, 4000),
      status,
      priority: optionalPriority(input.priority) ?? "medium",
      projectId,
      dueDate: cleanDueDate(input.dueDate) ?? null,
      tags: cleanTags(input.tags) ?? [],
      completedAt: status === "done" ? new Date() : null,
    })
    .returning({ id: tasks.id });

  if (!row) throw new InputError("Could not create task");

  const children = cleanSubtasks(input.subtasks);
  if (children?.length) {
    await replaceSubtasks(row.id, children);
  }

  const created = await getTaskById(userId, row.id);
  if (!created) throw new InputError("Could not create task");
  return created;
}

export async function updateTask(
  userId: string,
  taskId: string,
  input: TaskInput & { title?: string },
): Promise<Task> {
  const existing = await db
    .select({ id: tasks.id, status: tasks.status })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);

  if (existing.length === 0) throw new InputError("Task not found");

  const patch: Partial<typeof tasks.$inferInsert> = { updatedAt: new Date() };

  if (input.title !== undefined) {
    const title = cleanText(input.title, 180);
    if (!title) throw new InputError("Give your task a title");
    patch.title = title;
  }
  if (input.notes !== undefined) patch.notes = cleanText(input.notes, 4000);
  if (input.priority !== undefined) patch.priority = optionalPriority(input.priority);

  if (input.projectId !== undefined) {
    if (input.projectId === null) {
      patch.projectId = null;
    } else {
      const owned = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(eq(projects.id, input.projectId), eq(projects.userId, userId)))
        .limit(1);
      if (owned.length === 0) throw new InputError("Project not found");
      patch.projectId = input.projectId;
    }
  }

  const dueDate = cleanDueDate(input.dueDate);
  if (dueDate !== undefined) patch.dueDate = dueDate;

  const tags = cleanTags(input.tags);
  if (tags !== undefined) patch.tags = tags;

  const status = optionalStatus(input.status);
  if (status !== undefined) {
    patch.status = status;
    if (status === "done") {
      patch.completedAt = existing[0]?.status === "done" ? undefined : new Date();
    } else {
      patch.completedAt = null;
    }
  }

  await db.update(tasks).set(patch).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));

  const children = cleanSubtasks(input.subtasks);
  if (children !== undefined) {
    await replaceSubtasks(taskId, children);
  }

  const updated = await getTaskById(userId, taskId);
  if (!updated) throw new InputError("Task not found");
  return updated;
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const deleted = await db
    .delete(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .returning({ id: tasks.id });
  if (deleted.length === 0) throw new InputError("Task not found");
}

export async function createProject(
  userId: string,
  input: { name?: unknown; description?: unknown; color?: unknown; emoji?: unknown },
): Promise<Project> {
  const name = cleanText(input.name, 60);
  if (!name) throw new InputError("Give your project a name");

  const color = PROJECT_COLORS.includes(input.color as ProjectColor)
    ? (input.color as ProjectColor)
    : "moss";

  const [row] = await db
    .insert(projects)
    .values({
      userId,
      name,
      description: cleanText(input.description, 240),
      color,
      emoji: cleanText(input.emoji, 8) || "🌿",
    })
    .returning();

  if (!row) throw new InputError("Could not create project");
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: color as ProjectColor,
    emoji: row.emoji,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function updateProject(
  userId: string,
  projectId: string,
  input: { name?: unknown; description?: unknown; color?: unknown; emoji?: unknown },
): Promise<Project> {
  const patch: Partial<typeof projects.$inferInsert> = {};
  if (input.name !== undefined) {
    const name = cleanText(input.name, 60);
    if (!name) throw new InputError("Give your project a name");
    patch.name = name;
  }
  if (input.description !== undefined) patch.description = cleanText(input.description, 240);
  if (input.color !== undefined && PROJECT_COLORS.includes(input.color as ProjectColor)) {
    patch.color = input.color as ProjectColor;
  }
  if (input.emoji !== undefined) patch.emoji = cleanText(input.emoji, 8) || "🌿";

  const [row] = await db
    .update(projects)
    .set(patch)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .returning();

  if (!row) throw new InputError("Project not found");
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color: PROJECT_COLORS.includes(row.color as ProjectColor)
      ? (row.color as ProjectColor)
      : "moss",
    emoji: row.emoji,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  const deleted = await db
    .delete(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .returning({ id: projects.id });
  if (deleted.length === 0) throw new InputError("Project not found");
}
