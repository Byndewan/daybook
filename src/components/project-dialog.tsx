"use client";

import { useEffect, useState } from "react";
import { IconTrash, IconX } from "@/components/icons";
import { useWorkspace } from "@/components/workspace-provider";
import { PROJECT_COLORS, PROJECT_COLOR_STYLES, type Project, type ProjectColor } from "@/lib/types";

const EMOJI_CHOICES = ["🌿", "🧭", "🏡", "🫀", "📚", "💼", "🎨", "✈️", "🧘", "🛠️"];

export function ProjectDialog({
  open,
  project,
  onClose,
  onDeleted,
}: {
  open: boolean;
  project: Project | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const { createProject, updateProject, deleteProject } = useWorkspace();
  const [name, setName] = useState(project?.name ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [emoji, setEmoji] = useState(project?.emoji ?? "🌿");
  const [color, setColor] = useState<ProjectColor>(project?.color ?? "moss");
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setEmoji(project?.emoji ?? "🌿");
    setColor(project?.color ?? "moss");
    setError("");
    setConfirmDelete(false);
  }, [open, project]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    if (!name.trim()) {
      setError("Projects need a name.");
      return;
    }
    onClose();
    if (project) {
      await updateProject(project.id, { name, description, color, emoji });
    } else {
      await createProject({ name, description, color, emoji });
    }
  };

  const styles = PROJECT_COLOR_STYLES[color];

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-forest/40 backdrop-blur-[2px] sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={project ? "Edit project" : "New project"}
        className="animate-pop relative z-10 w-full max-w-md rounded-t-2xl border border-line bg-surface shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-base font-semibold text-ink">
            {project ? "Edit project" : "New project"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted transition hover:bg-canvas hover:text-ink"
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className={`flex items-center gap-3 rounded-xl ${styles.soft} p-3`}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/70 text-xl">
              {emoji}
            </span>
            <div className="min-w-0">
              <p className={`truncate text-sm font-semibold ${styles.text}`}>
                {name.trim() || "Project name"}
              </p>
              <p className="truncate text-[11.5px] text-muted">
                {description.trim() || "A short description of this project"}
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="project-name" className="mb-1.5 block text-xs font-medium text-muted">
              Name
            </label>
            <input
              id="project-name"
              autoFocus
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setError("");
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submit();
              }}
              placeholder="e.g. Home & Errands"
              className="field"
            />
            {error ? <p className="mt-1.5 text-xs text-[#a8472c]">{error}</p> : null}
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="mb-1.5 block text-xs font-medium text-muted"
            >
              Description <span className="font-normal">(optional)</span>
            </label>
            <textarea
              id="project-description"
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What belongs in this project?"
              className="field resize-none"
            />
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted">Icon</span>
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_CHOICES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setEmoji(option)}
                  aria-label={`Choose ${option}`}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-base transition ${
                    emoji === option
                      ? "border-moss-500 bg-moss-50"
                      : "border-line hover:border-line-strong"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-xs font-medium text-muted">Colour</span>
            <div className="flex items-center gap-2">
              {PROJECT_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setColor(option)}
                  aria-label={`Use ${option} colour`}
                  className={`flex h-7 w-7 items-center justify-center rounded-full ring-offset-2 transition ${
                    PROJECT_COLOR_STYLES[option].dot
                  } ${color === option ? "ring-2 ring-ink/40" : "opacity-70 hover:opacity-100"}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-line bg-[#fbf9f4] px-5 py-3.5">
          <div>
            {project ? (
              confirmDelete ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDeleted?.();
                    void deleteProject(project.id);
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
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="button" onClick={() => void submit()} className="btn btn-primary">
              {project ? "Save project" : "Create project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
