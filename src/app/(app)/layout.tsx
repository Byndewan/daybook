import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { WorkspaceProvider } from "@/components/workspace-provider";
import { getCurrentUser } from "@/lib/auth";
import { getProjects, getTasks } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [tasks, projects] = await Promise.all([getTasks(user.id), getProjects(user.id)]);

  return (
    <WorkspaceProvider user={user} tasks={tasks} projects={projects}>
      <AppShell>{children}</AppShell>
    </WorkspaceProvider>
  );
}
