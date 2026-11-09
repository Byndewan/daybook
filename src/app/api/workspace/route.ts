import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getProjects, getTasks } from "@/lib/data";
import { seedDemoWorkspace } from "@/lib/seed";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const [tasks, projects] = await Promise.all([getTasks(user.id), getProjects(user.id)]);
  return Response.json({ user, tasks, projects });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  await seedDemoWorkspace(user.id);
  const [tasks, projects] = await Promise.all([getTasks(user.id), getProjects(user.id)]);
  return Response.json({ tasks, projects });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  if (!name) return Response.json({ error: "Name cannot be empty" }, { status: 400 });

  const [updated] = await db
    .update(users)
    .set({ name })
    .where(eq(users.id, user.id))
    .returning({ id: users.id, name: users.name, email: users.email });

  return Response.json({ user: updated });
}
