"use client";

import type { ReactNode } from "react";
import { TaskRow } from "@/components/task-row";
import type { Project, Task } from "@/lib/types";

export function TaskList({
  tasks,
  projects,
  showProject = true,
  empty,
}: {
  tasks: Task[];
  projects: Project[];
  showProject?: boolean;
  empty?: ReactNode;
}) {
  const projectById = new Map(projects.map((project) => [project.id, project]));

  if (tasks.length === 0) {
    return <>{empty}</>;
  }

  return (
    <ul className="divide-y divide-[#f0ece1]">
      {tasks.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          project={task.projectId ? projectById.get(task.projectId) : undefined}
          showProject={showProject}
        />
      ))}
    </ul>
  );
}
