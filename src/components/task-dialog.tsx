"use client";

import { useEffect, useMemo, useState } from "react";
import { IconCheck, IconPlus, IconTrash, IconX } from "@/components/icons";
import { useWorkspace, type TaskDefaults } from "@/components/workspace-provider";
import { addDaysISO, todayISO } from "@/lib/dates";
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/types";

type DraftSubtask = { key: string; title: string; done: boolean };

function key(): string {
  return Math.random().toString(36).slice(2, 10);
}

function TaskDialogBody({ task, defaults }: { task: Task | null; defaults: TaskDefaults }) {
  const { projects, createTask, updateTask, deleteTask, closeTaskDialog } = useWorkspace();

  const [title, setTitle] = useState(task?.title ?? "");
  const [notes, setNotes] = useState(task?.notes ?? "");
  const [projectId, setProjectId] = useState<string>(task?.projectId ?? defaults.projectId ?? "");
  const [dueDate, setDueDate] = useState<string>(task?.dueDate ?? defaults.dueDate ?? "");
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? defaults.status ?? "todo");
  const [priority, setPriority] = useState<TaskPriority>(
    task?.priority ?? defaults.priority ?? "medium",
  );
  const [tags, setTags] = useState((task?.tags ?? []).join(", "));
  const [subtasks, setSubtasks] = useState<DraftSubtask[]>(
    (task?.subtasks ?? []).map((child) => ({ key: child.id, title: child.title, done: child.done })),
  );
  const [newSubtask, setNewSubtask] = useState("");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTaskDialog();
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [closeTaskDialog]);

  const parsedTags = useMemo(
    () =>
      tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase().replace(/^#/, ""))
        .filter(Boolean)
        .slice(0, 6),
    [tags],
  );

  const addSubtask = () => {
    const value = newSubtask.trim();
    if (!value) return;
    setSubtasks((current) => [...current, { key: key(), title: value, done: false }]);
    setNewSubtask("");
  };

  const submit = async () => {
    if (!title.trim()) {
      setError("Give your task a title first.");
      return;
    }
    const payload = {
      title: title.trim(),
      notes,
      projectId: projectId || null,
      dueDate: dueDate || null,
      status,
      priority,
      tags: parsedTags,
      subtasks: subtasks
        .filter((child) => child.title.trim().length > 0)
        .map((child) => ({ title: child.title.trim(), done: child.done })),
    };

    closeTaskDialog();
    if (task) {
      await updateTask(task.id, payload);
    } else {
      await createTask(payload);
    }
  };

  const duePresets = [
    { label: "Today", value: todayISO() },
    { label: "Tomorrow", value: addDaysISO(new Date(), 1) },
    { label: "Next week", value: addDaysISO(new Date(), 7) },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-forest/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={closeTaskDialog}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={task ? "Edit task" : "New task"}
        className="animate-pop relative z-10 flex max-h-[94dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl sm:max-w-xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <div>
            <h2 className="text-base font-semibold text-ink">
              {task ? "Edit task" : "New task"}
            </h2>
            <p className="text-xs text-muted">
              {task ? "Update the details and save." : "A clear next step is enough to start."}
            </p>
          </div>
          <button
            type="button"
            onClick={closeTaskDialog}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition hover:bg-canvas hover:text-ink"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <div>
            <label htmlFor="task-title" className="mb-1.5 block text-xs font-medium text-muted">
              Task name
            </label>
            <input
              id="task-title"
              autoFocus
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                  void submit();
                }
              }}
              placeholder="e.g. Draft the newsletter intro"
              className="field text-[15px]"
            />
            {error ? <p className="mt-1.5 text-xs text-[#a8472c]">{error}</p> : null}
          </div>

          <div>
            <label htmlFor="task-notes" className="mb-1.5 block text-xs font-medium text-muted">
              Notes
            </label>
            <textarea
              id="task-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              placeholder="Context, links, the details you'll forget…"
              className="field resize-none leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="task-project" className="mb-1.5 block text-xs font-medium text-muted">
                Project
              </label>
              <select
                id="task-project"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
                className="field"
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.emoji} {project.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="task-due" className="mb-1.5 block text-xs font-medium text-muted">
                Due date
              </label>
              <input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="field"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {duePresets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setDueDate(preset.value)}
                className="rounded-full border border-line-strong px-2.5 py-1 text-[11px] font-medium text-muted transition hover:border-moss-400 hover:text-moss-700"
              >
                {preset.label}
              </button>
            ))}
            {dueDate ? (
              <button
                type="button"
                onClick={() => setDueDate("")}
                className="rounded-full px-2 py-1 text-[11px] font-medium text-muted transition hover:text-[#a8472c]"
              >
                Clear date
              </button>
            ) : null}
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted">Priority</span>
            <div className="grid grid-cols-4 gap-1.5 rounded-xl bg-canvas p-1">
              {TASK_PRIORITIES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPriority(option)}
                  className={`rounded-lg px-2 py-1.5 text-xs font-medium capitalize transition ${
                    priority === option
                      ? "bg-surface text-ink shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {PRIORITY_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted">Status</span>
            <div className="grid grid-cols-3 gap-1.5 rounded-xl bg-canvas p-1">
              {TASK_STATUSES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStatus(option)}
                  className={`rounded-lg px-2 py-1.5 text-xs font-medium transition ${
                    status === option
                      ? "bg-surface text-ink shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {STATUS_LABELS[option]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="task-tags" className="mb-1.5 block text-xs font-medium text-muted">
              Tags <span className="font-normal">(comma separated)</span>
            </label>
            <input
              id="task-tags"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="home, errand, deep-work"
              className="field"
            />
            {parsedTags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {parsedTags.map((tag) => (
                  <span key={tag} className="chip bg-moss-50 text-moss-700">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted">Checklist</span>
            <div className="space-y-1.5">
              {subtasks.map((child) => (
                <div key={child.key} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSubtasks((current) =>
                        current.map((item) =>
                          item.key === child.key ? { ...item, done: !item.done } : item,
                        ),
                      )
                    }
                    aria-label={child.done ? "Uncheck item" : "Check item"}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
                      child.done
                        ? "border-moss-600 bg-moss-600 text-white"
                        : "border-line-strong bg-white text-transparent hover:border-moss-400"
                    }`}
                  >
                    <IconCheck className="h-2.5 w-2.5" />
                  </button>
                  <input
                    value={child.title}
                    onChange={(event) =>
                      setSubtasks((current) =>
                        current.map((item) =>
                          item.key === child.key ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                    className={`flex-1 border-b border-transparent bg-transparent py-0.5 text-sm outline-none focus:border-line-strong ${
                      child.done ? "text-muted line-through" : "text-ink"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setSubtasks((current) => current.filter((item) => item.key !== child.key))
                    }
                    aria-label="Remove checklist item"
                    className="rounded p-1 text-muted transition hover:text-[#a8472c]"
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input
                value={newSubtask}
                onChange={(event) => setNewSubtask(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add a step…"
                className="field flex-1 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="btn btn-secondary px-2.5 py-2"
                aria-label="Add checklist item"
              >
                <IconPlus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-line bg-[#fbf9f4] px-5 py-3.5">
          <div>
            {task ? (
              confirmDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    closeTaskDialog();
                    void deleteTask(task.id);
                  }}
                  className="btn btn-danger"
                >
                  Confirm delete
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="btn btn-ghost text-[#a8472c] hover:bg-[#fbeae4]"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                  Delete
                </button>
              )
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={closeTaskDialog} className="btn btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={() => void submit()} className="btn btn-primary">
              {task ? "Save changes" : "Add task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskDialog() {
  const { dialog } = useWorkspace();
  if (!dialog.open) return null;

  const dialogKey = `${dialog.task?.id ?? "new"}-${dialog.defaults.projectId ?? ""}-${
    dialog.defaults.dueDate ?? ""
  }-${dialog.defaults.status ?? ""}`;

  return <TaskDialogBody key={dialogKey} task={dialog.task} defaults={dialog.defaults} />;
}
