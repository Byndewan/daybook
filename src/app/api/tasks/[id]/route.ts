import { getCurrentUser } from "@/lib/auth";
import { InputError, deleteTask, updateTask } from "@/lib/mutations";
import type { TaskInput } from "@/lib/types";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  let body: TaskInput;
  try {
    body = (await request.json()) as TaskInput;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const task = await updateTask(user.id, id, body);
    return Response.json({ task });
  } catch (error) {
    const message = error instanceof InputError ? error.message : "Could not update task";
    const status = message === "Task not found" ? 404 : 400;
    return Response.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  try {
    await deleteTask(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof InputError ? error.message : "Could not delete task";
    return Response.json({ error: message }, { status: 400 });
  }
}
