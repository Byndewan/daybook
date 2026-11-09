"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  Project,
  ProjectColor,
  SessionUser,
  Task,
  TaskInput,
  TaskPriority,
  TaskStatus,
} from "@/lib/types";

export type Toast = {
  id: string;
  message: string;
  tone: "success" | "error" | "info";
  action?: { label: string; onClick: () => void };
};

export type TaskDefaults = {
  projectId?: string | null;
  dueDate?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
};

export type DialogState = {
  open: boolean;
  task: Task | null;
  defaults: TaskDefaults;
};

export type TaskUpdate = Partial<TaskInput>;

export type ProjectInput = {
  name: string;
  description?: string;
  color?: ProjectColor;
  emoji?: string;
};

type WorkspaceContextValue = {
  user: SessionUser;
  tasks: Task[];
  projects: Project[];
  isSyncing: boolean;
  dialog: DialogState;
  toasts: Toast[];
  openTaskDialog: (task?: Task | null, defaults?: TaskDefaults) => void;
  closeTaskDialog: () => void;
  createTask: (input: TaskInput) => Promise<Task | null>;
  updateTask: (id: string, patch: TaskUpdate) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<void>;
  toggleTask: (task: Task) => Promise<void>;
  createProject: (input: ProjectInput) => Promise<Project | null>;
  updateProject: (id: string, patch: Partial<ProjectInput>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  updateProfile: (name: string) => Promise<boolean>;
  notify: (
    message: string,
    tone?: Toast["tone"],
    action?: { label: string; onClick: () => void },
  ) => void;
  dismissToast: (id: string) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    throw new Error(typeof payload.error === "string" ? payload.error : "Something went wrong");
  }
  return payload as T;
}

function optimisticSubtasks(input?: { id?: string; title: string; done?: boolean }[]) {
  return (input ?? [])
    .filter((child) => child.title.trim().length > 0)
    .map((child) => ({
      id: child.id ?? `tmp-sub-${uid()}`,
      title: child.title.trim(),
      done: Boolean(child.done),
    }));
}

function optimisticTask(id: string, input: TaskInput): Task {
  const now = new Date().toISOString();
  const status = input.status ?? "todo";
  return {
    id,
    projectId: input.projectId ?? null,
    title: input.title.trim(),
    notes: input.notes ?? "",
    status,
    priority: input.priority ?? "medium",
    dueDate: input.dueDate ?? null,
    tags: input.tags ?? [],
    completedAt: status === "done" ? now : null,
    createdAt: now,
    updatedAt: now,
    subtasks: optimisticSubtasks(input.subtasks),
  };
}

function applyPatch(task: Task, patch: TaskUpdate): Task {
  const nextStatus = patch.status ?? task.status;
  return {
    ...task,
    title: patch.title !== undefined ? patch.title.trim() || task.title : task.title,
    notes: patch.notes ?? task.notes,
    status: nextStatus,
    priority: patch.priority ?? task.priority,
    projectId: patch.projectId !== undefined ? patch.projectId : task.projectId,
    dueDate: patch.dueDate !== undefined ? patch.dueDate : task.dueDate,
    tags: patch.tags ?? task.tags,
    completedAt:
      nextStatus === "done"
        ? (task.completedAt ?? new Date().toISOString())
        : null,
    updatedAt: new Date().toISOString(),
    subtasks:
      patch.subtasks !== undefined
        ? optimisticSubtasks(
            patch.subtasks.map((child) => ({
              id: child.id,
              title: child.title,
              done: child.done,
            })),
          )
        : task.subtasks,
  };
}

function taskToInput(task: Task): TaskInput {
  return {
    title: task.title,
    notes: task.notes,
    status: task.status,
    priority: task.priority,
    projectId: task.projectId,
    dueDate: task.dueDate,
    tags: task.tags,
    subtasks: task.subtasks.map((child) => ({ title: child.title, done: child.done })),
  };
}

export function WorkspaceProvider({
  user: initialUser,
  tasks: initialTasks,
  projects: initialProjects,
  children,
}: {
  user: SessionUser;
  tasks: Task[];
  projects: Project[];
  children: ReactNode;
}) {
  const [user, setUser] = useState<SessionUser>(initialUser);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [pending, setPending] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<DialogState>({ open: false, task: null, defaults: {} });

  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const projectsRef = useRef(projects);
  projectsRef.current = projects;

  const track = useCallback(async <T,>(work: () => Promise<T>): Promise<T> => {
    setPending((count) => count + 1);
    try {
      return await work();
    } finally {
      setPending((count) => Math.max(0, count - 1));
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback<WorkspaceContextValue["notify"]>(
    (message, tone = "success", action) => {
      const id = uid();
      setToasts((current) => [...current.slice(-2), { id, message, tone, action }]);
      setTimeout(() => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
      }, 5200);
    },
    [],
  );

  const openTaskDialog = useCallback<WorkspaceContextValue["openTaskDialog"]>((task, defaults) => {
    setDialog({ open: true, task: task ?? null, defaults: defaults ?? {} });
  }, []);

  const closeTaskDialog = useCallback(() => {
    setDialog((current) => ({ ...current, open: false }));
  }, []);

  const createTask = useCallback<WorkspaceContextValue["createTask"]>(
    async (input) => {
      const tempId = `tmp-${uid()}`;
      const optimistic = optimisticTask(tempId, input);
      setTasks((current) => [optimistic, ...current]);

      try {
        const { task } = await track(() =>
          api<{ task: Task }>("/api/tasks", { method: "POST", body: JSON.stringify(input) }),
        );
        setTasks((current) => current.map((item) => (item.id === tempId ? task : item)));
        notify("Task added");
        return task;
      } catch (error) {
        setTasks((current) => current.filter((item) => item.id !== tempId));
        notify(error instanceof Error ? error.message : "Could not add task", "error");
        return null;
      }
    },
    [notify, track],
  );

  const updateTask = useCallback<WorkspaceContextValue["updateTask"]>(
    async (id, patch) => {
      const previous = tasksRef.current.find((task) => task.id === id);
      if (!previous) return null;
      setTasks((current) =>
        current.map((task) => (task.id === id ? applyPatch(task, patch) : task)),
      );

      try {
        const { task } = await track(() =>
          api<{ task: Task }>(`/api/tasks/${id}`, {
            method: "PATCH",
            body: JSON.stringify(patch),
          }),
        );
        setTasks((current) => current.map((item) => (item.id === id ? task : item)));
        return task;
      } catch (error) {
        setTasks((current) => current.map((item) => (item.id === id ? previous : item)));
        notify(error instanceof Error ? error.message : "Could not save task", "error");
        return null;
      }
    },
    [notify, track],
  );

  const deleteTask = useCallback<WorkspaceContextValue["deleteTask"]>(
    async (id) => {
      const target = tasksRef.current.find((task) => task.id === id);
      if (!target) return;
      setTasks((current) => current.filter((task) => task.id !== id));

      try {
        await track(() => api<{ ok: true }>(`/api/tasks/${id}`, { method: "DELETE" }));
        notify("Task deleted", "info", {
          label: "Undo",
          onClick: () => {
            void createTask(taskToInput(target));
          },
        });
      } catch (error) {
        setTasks((current) => [target, ...current]);
        notify(error instanceof Error ? error.message : "Could not delete task", "error");
      }
    },
    [createTask, notify, track],
  );

  const toggleTask = useCallback<WorkspaceContextValue["toggleTask"]>(
    async (task) => {
      const nextStatus: TaskStatus = task.status === "done" ? "todo" : "done";
      await updateTask(task.id, { status: nextStatus });
      if (nextStatus === "done") {
        notify("Nice work — task completed", "success", {
          label: "Undo",
          onClick: () => {
            void updateTask(task.id, { status: task.status });
          },
        });
      }
    },
    [notify, updateTask],
  );

  const createProject = useCallback<WorkspaceContextValue["createProject"]>(
    async (input) => {
      const tempId = `tmp-project-${uid()}`;
      const optimistic: Project = {
        id: tempId,
        name: input.name.trim(),
        description: input.description ?? "",
        color: input.color ?? "moss",
        emoji: input.emoji || "🌿",
        createdAt: new Date().toISOString(),
      };
      setProjects((current) => [...current, optimistic]);

      try {
        const { project } = await track(() =>
          api<{ project: Project }>("/api/projects", {
            method: "POST",
            body: JSON.stringify(input),
          }),
        );
        setProjects((current) =>
          current.map((item) => (item.id === tempId ? project : item)),
        );
        notify("Project created");
        return project;
      } catch (error) {
        setProjects((current) => current.filter((item) => item.id !== tempId));
        notify(error instanceof Error ? error.message : "Could not create project", "error");
        return null;
      }
    },
    [notify, track],
  );

  const updateProject = useCallback<WorkspaceContextValue["updateProject"]>(
    async (id, patch) => {
      const previous = projectsRef.current.find((project) => project.id === id);
      if (!previous) return null;
      setProjects((current) =>
        current.map((project) =>
          project.id === id
            ? {
                ...project,
                name: patch.name ? patch.name.trim() || project.name : project.name,
                description: patch.description ?? project.description,
                color: patch.color ?? project.color,
                emoji: patch.emoji || project.emoji,
              }
            : project,
        ),
      );

      try {
        const { project } = await track(() =>
          api<{ project: Project }>(`/api/projects/${id}`, {
            method: "PATCH",
            body: JSON.stringify(patch),
          }),
        );
        setProjects((current) => current.map((item) => (item.id === id ? project : item)));
        notify("Project updated");
        return project;
      } catch (error) {
        setProjects((current) => current.map((item) => (item.id === id ? previous : item)));
        notify(error instanceof Error ? error.message : "Could not update project", "error");
        return null;
      }
    },
    [notify, track],
  );

  const deleteProject = useCallback<WorkspaceContextValue["deleteProject"]>(
    async (id) => {
      const previousProjects = projectsRef.current;
      const previousTasks = tasksRef.current;
      setProjects((current) => current.filter((project) => project.id !== id));
      setTasks((current) =>
        current.map((task) => (task.projectId === id ? { ...task, projectId: null } : task)),
      );

      try {
        await track(() => api<{ ok: true }>(`/api/projects/${id}`, { method: "DELETE" }));
        notify("Project deleted — its tasks moved to No project", "info");
      } catch (error) {
        setProjects(previousProjects);
        setTasks(previousTasks);
        notify(error instanceof Error ? error.message : "Could not delete project", "error");
      }
    },
    [notify, track],
  );

  const resetDemoData = useCallback<WorkspaceContextValue["resetDemoData"]>(async () => {
    try {
      const result = await track(() =>
        api<{ tasks: Task[]; projects: Project[] }>("/api/workspace", { method: "POST" }),
      );
      setTasks(result.tasks);
      setProjects(result.projects);
      notify("Fresh sample workspace loaded");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not load sample data", "error");
    }
  }, [notify, track]);

  const updateProfile = useCallback<WorkspaceContextValue["updateProfile"]>(
    async (name) => {
      try {
        const result = await track(() =>
          api<{ user: SessionUser }>("/api/workspace", {
            method: "PATCH",
            body: JSON.stringify({ name }),
          }),
        );
        setUser(result.user);
        notify("Profile updated");
        return true;
      } catch (error) {
        notify(error instanceof Error ? error.message : "Could not update profile", "error");
        return false;
      }
    },
    [notify, track],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      user,
      tasks,
      projects,
      isSyncing: pending > 0,
      dialog,
      toasts,
      openTaskDialog,
      closeTaskDialog,
      createTask,
      updateTask,
      deleteTask,
      toggleTask,
      createProject,
      updateProject,
      deleteProject,
      resetDemoData,
      updateProfile,
      notify,
      dismissToast,
    }),
    [
      user,
      tasks,
      projects,
      pending,
      dialog,
      toasts,
      openTaskDialog,
      closeTaskDialog,
      createTask,
      updateTask,
      deleteTask,
      toggleTask,
      createProject,
      updateProject,
      deleteProject,
      resetDemoData,
      updateProfile,
      notify,
      dismissToast,
    ],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return context;
}
