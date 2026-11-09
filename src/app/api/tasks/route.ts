import { getCurrentUser } from "@/lib/auth";
import { getTasks } from "@/lib/data";
import { InputError, createTask } from "@/lib/mutations";
import type { TaskInput } from "@/lib/types";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ tasks: await getTasks(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: TaskInput;
  try {
    body = (await request.json()) as TaskInput;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const task = await createTask(user.id, body);
    return Response.json({ task }, { status: 201 });
  } catch (error) {
    const message = error instanceof InputError ? error.message : "Could not create task";
    return Response.json({ error: message }, { status: 400 });
  }
}
