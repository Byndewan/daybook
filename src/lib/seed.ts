import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, subtasks, tasks, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { addDaysISO } from "@/lib/dates";

export const DEMO_EMAIL = "alex@daybook.app";
export const DEMO_PASSWORD = "daybook123";

type SeedTask = {
  title: string;
  notes?: string;
  project: string;
  status?: "todo" | "in_progress" | "done";
  priority?: "low" | "medium" | "high" | "urgent";
  due?: number | null;
  tags?: string[];
  completed?: number;
  subtasks?: { title: string; done?: boolean }[];
};

const PROJECT_SEED = [
  {
    key: "personal",
    name: "Personal",
    emoji: "🌿",
    color: "moss",
    description: "Slow-life goals, habits and everything in between.",
  },
  {
    key: "work",
    name: "Work",
    emoji: "🧭",
    color: "ocean",
    description: "Studio projects, reviews and follow-ups.",
  },
  {
    key: "home",
    name: "Home & Errands",
    emoji: "🏡",
    color: "amber",
    description: "The little things that keep life running.",
  },
  {
    key: "health",
    name: "Health",
    emoji: "🫀",
    color: "rose",
    description: "Move, rest and eat well.",
  },
];

const TASK_SEED: SeedTask[] = [
  {
    title: "Plan the weekend hike with Sam",
    notes:
      "Trail options: Eagle Ridge (6 mi, moderate) or Cedar Loop (3 mi, easy). Check the weather Saturday morning before locking it in.",
    project: "personal",
    status: "in_progress",
    priority: "medium",
    due: 0,
    tags: ["weekend", "outdoors"],
    subtasks: [
      { title: "Check the weather forecast", done: true },
      { title: "Pick a trail and share with Sam", done: true },
      { title: "Pack snacks and water", done: false },
      { title: "Charge the camera battery", done: false },
    ],
  },
  {
    title: "Review the Q3 roadmap draft",
    notes: "Focus on the two launch risks Priya flagged on page 4.",
    project: "work",
    status: "in_progress",
    priority: "high",
    due: 0,
    tags: ["planning"],
    subtasks: [
      { title: "Read the draft end to end", done: true },
      { title: "Leave comments in the doc", done: false },
      { title: "Book a follow-up review", done: false },
    ],
  },
  {
    title: "Design review with Priya",
    project: "work",
    status: "in_progress",
    priority: "high",
    due: 0,
    tags: ["meeting", "design"],
  },
  {
    title: "Call Mom back",
    notes: "She wanted to hear about the new apartment.",
    project: "personal",
    priority: "medium",
    due: 0,
  },
  {
    title: "Water the fiddle leaf fig",
    project: "home",
    priority: "low",
    due: 0,
  },
  {
    title: "Pick up the dry cleaning",
    project: "home",
    priority: "low",
    due: -1,
    tags: ["errand"],
  },
  {
    title: "Book the dentist appointment",
    notes: "Ask for a morning slot — the 8:30 ones go fast.",
    project: "health",
    priority: "high",
    due: -2,
  },
  {
    title: "Return the library books",
    project: "home",
    priority: "medium",
    due: -3,
    tags: ["errand"],
  },
  {
    title: "Draft the newsletter intro",
    notes: "Three paragraphs, warm tone, end on the reading list.",
    project: "work",
    priority: "medium",
    due: 1,
    tags: ["writing"],
  },
  {
    title: "Meal prep for the week",
    notes: "Roast vegetables, cook a pot of farro, make the lemon dressing.",
    project: "home",
    priority: "medium",
    due: 1,
    subtasks: [
      { title: "Write the shopping list", done: true },
      { title: "Grocery run", done: false },
      { title: "Roast vegetables", done: false },
    ],
  },
  {
    title: "Renew the gym membership",
    project: "health",
    priority: "low",
    due: 2,
  },
  {
    title: "Send invoice to Northwind",
    project: "work",
    status: "in_progress",
    priority: "urgent",
    due: 3,
    tags: ["finance"],
  },
  {
    title: "Deep clean the kitchen",
    notes: "Including the oven — it has been a while.",
    project: "home",
    priority: "low",
    due: 4,
  },
  {
    title: "Weekly budget review",
    notes: "Reconcile receipts, move the rest into savings.",
    project: "personal",
    priority: "high",
    due: 5,
    tags: ["finance", "ritual"],
  },
  {
    title: "Replace the running shoes",
    project: "health",
    priority: "low",
    due: 6,
  },
  {
    title: "Plan the autumn studio offsite",
    notes: "Two days, somewhere reachable by train.",
    project: "work",
    priority: "medium",
    due: 9,
    tags: ["planning"],
  },
  {
    title: "Update the portfolio site",
    notes: "Added the Northwind case study and refreshed the about page.",
    project: "personal",
    status: "done",
    priority: "medium",
    due: -2,
    completed: -1,
    tags: ["personal-brand"],
  },
  {
    title: "Tidy up the 1:1 notes",
    project: "work",
    status: "done",
    priority: "low",
    due: -3,
    completed: -2,
  },
  {
    title: "30 minutes of stretching",
    project: "health",
    status: "done",
    priority: "low",
    due: 0,
    completed: 0,
  },
  {
    title: "Pay the internet bill",
    project: "home",
    status: "done",
    priority: "high",
    due: -1,
    completed: 0,
  },
  {
    title: "Reply to the design newsletter thread",
    project: "work",
    status: "done",
    priority: "low",
    due: 1,
    completed: -1,
  },
  {
    title: "Read 30 pages of Deep Work",
    project: "personal",
    priority: "low",
    due: 2,
    tags: ["reading", "ritual"],
  },
];

export async function seedDemoWorkspace(userId: string): Promise<void> {
  await db.delete(tasks).where(eq(tasks.userId, userId));
  await db.delete(projects).where(eq(projects.userId, userId));

  const projectRows = await db
    .insert(projects)
    .values(
      PROJECT_SEED.map((project) => ({
        userId,
        name: project.name,
        description: project.description,
        color: project.color,
        emoji: project.emoji,
      })),
    )
    .returning({ id: projects.id, name: projects.name });

  const projectIdByKey = new Map<string, string>();
  PROJECT_SEED.forEach((project, index) => {
    const row = projectRows[index];
    if (row) projectIdByKey.set(project.key, row.id);
  });

  const today = new Date();

  for (const task of TASK_SEED) {
    const completedAt =
      task.status === "done"
        ? new Date(today.getTime() + (task.completed ?? 0) * 24 * 60 * 60 * 1000)
        : null;

    const [row] = await db
      .insert(tasks)
      .values({
        userId,
        projectId: projectIdByKey.get(task.project) ?? null,
        title: task.title,
        notes: task.notes ?? "",
        status: task.status ?? "todo",
        priority: task.priority ?? "medium",
        dueDate: task.due === null || task.due === undefined ? null : addDaysISO(today, task.due),
        tags: task.tags ?? [],
        completedAt,
      })
      .returning({ id: tasks.id });

    if (row && task.subtasks?.length) {
      await db.insert(subtasks).values(
        task.subtasks.map((subtask) => ({
          taskId: row.id,
          title: subtask.title,
          done: subtask.done ?? false,
        })),
      );
    }
  }
}

export async function seedStarterWorkspace(userId: string): Promise<void> {
  await db.insert(projects).values([
    {
      userId,
      name: "Personal",
      description: "Everything that matters outside of work.",
      color: "moss",
      emoji: "🌿",
    },
    {
      userId,
      name: "Work",
      description: "Projects, meetings and follow-ups.",
      color: "ocean",
      emoji: "🧭",
    },
  ]);
}

let seedPromise: Promise<void> | null = null;

export async function ensureDemoSeed(): Promise<void> {
  if (seedPromise) return seedPromise;

  seedPromise = (async () => {
    try {
      const existing = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, DEMO_EMAIL))
        .limit(1);

      if (existing.length > 0) return;

      const [created] = await db
        .insert(users)
        .values({
          name: "Alex Rivera",
          email: DEMO_EMAIL,
          passwordHash: hashPassword(DEMO_PASSWORD),
        })
        .onConflictDoNothing()
        .returning({ id: users.id });

      if (created) {
        await seedDemoWorkspace(created.id);
      }
    } catch (error) {
      seedPromise = null;
      console.error("Failed to seed demo workspace", error);
    }
  })();

  return seedPromise;
}
