import { getCurrentUser } from "@/lib/auth";
import { getProjects } from "@/lib/data";
import { InputError, createProject } from "@/lib/mutations";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ projects: await getProjects(user.id) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  try {
    const project = await createProject(user.id, body);
    return Response.json({ project }, { status: 201 });
  } catch (error) {
    const message = error instanceof InputError ? error.message : "Could not create project";
    return Response.json({ error: message }, { status: 400 });
  }
}
