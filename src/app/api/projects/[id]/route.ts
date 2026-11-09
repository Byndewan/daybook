import { getCurrentUser } from "@/lib/auth";
import { InputError, deleteProject, updateProject } from "@/lib/mutations";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const project = await updateProject(user.id, id, body);
    return Response.json({ project });
  } catch (error) {
    const message = error instanceof InputError ? error.message : "Could not update project";
    return Response.json({ error: message }, { status: 404 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  try {
    await deleteProject(user.id, id);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof InputError ? error.message : "Could not delete project";
    return Response.json({ error: message }, { status: 400 });
  }
}
