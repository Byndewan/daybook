import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession } from "@/lib/auth";
import { DEMO_EMAIL, ensureDemoSeed } from "@/lib/seed";

export async function POST() {
  await ensureDemoSeed();

  const [user] = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);
  if (!user) {
    return Response.json({ error: "Demo account is warming up, try again" }, { status: 500 });
  }

  await createSession(user.id);
  return Response.json({ user: { id: user.id, name: user.name, email: user.email } });
}
