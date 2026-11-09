import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, hashPassword } from "@/lib/auth";
import { seedStarterWorkspace } from "@/lib/seed";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name) return Response.json({ error: "Please tell us your name" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "That email doesn't look right" }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json({ error: "Password needs at least 8 characters" }, { status: 400 });
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return Response.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const [created] = await db
    .insert(users)
    .values({ name, email, passwordHash: hashPassword(password) })
    .returning({ id: users.id, name: users.name, email: users.email });

  if (!created) return Response.json({ error: "Could not create account" }, { status: 500 });

  await seedStarterWorkspace(created.id);
  await createSession(created.id);

  return Response.json({ user: created }, { status: 201 });
}
