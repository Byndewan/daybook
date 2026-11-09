"use client";

import { useRef, useState } from "react";
import { IconPlus } from "@/components/icons";
import { useWorkspace, type TaskDefaults } from "@/components/workspace-provider";
import type { TaskPriority } from "@/lib/types";

export function QuickAdd({
  defaults,
  placeholder = "Add a task and press enter…",
  priority = "medium",
}: {
  defaults?: TaskDefaults;
  placeholder?: string;
  priority?: TaskPriority;
}) {
  const { createTask } = useWorkspace();
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const submit = async () => {
    const title = value.trim();
    if (!title) return;
    setValue("");
    setBusy(true);
    await createTask({
      title,
      status: defaults?.status ?? "todo",
      priority,
      projectId: defaults?.projectId ?? null,
      dueDate: defaults?.dueDate ?? null,
    });
    setBusy(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border border-line-strong bg-white px-2.5 py-1.5 transition focus-within:border-moss-500 focus-within:ring-3 focus-within:ring-moss-500/12">
      <IconPlus className="h-4 w-4 shrink-0 text-moss-600" />
      <input
        ref={inputRef}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            void submit();
          }
        }}
        placeholder={placeholder}
        aria-label="Add a task"
        className="min-w-0 flex-1 bg-transparent py-1 text-sm text-ink outline-none placeholder:text-[#9aa39d]"
      />
      <button
        type="button"
        onClick={() => void submit()}
        disabled={busy || value.trim().length === 0}
        className="btn btn-primary px-2.5 py-1 text-xs disabled:opacity-40"
      >
        Add
      </button>
    </div>
  );
}
