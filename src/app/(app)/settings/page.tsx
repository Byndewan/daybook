"use client";

import { useState } from "react";
import { IconCheck, IconLeaf, IconLogout, IconSparkles } from "@/components/icons";
import { Avatar, PageHeader } from "@/components/ui";
import { useWorkspace } from "@/components/workspace-provider";

export default function SettingsPage() {
  const { user, tasks, projects, updateProfile, resetDemoData } = useWorkspace();
  const [name, setName] = useState(user.name);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const done = tasks.filter((task) => task.status === "done").length;

  const save = async () => {
    if (!name.trim() || name.trim() === user.name) return;
    setSaving(true);
    await updateProfile(name.trim());
    setSaving(false);
  };

  const signOut = async () => {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  };

  return (
    <div className="animate-rise max-w-3xl">
      <PageHeader
        eyebrow="Account"
        title="Settings"
        subtitle="Your profile, your workspace, your pace."
      />

      <section className="card p-5">
        <h2 className="text-base font-semibold text-ink">Profile</h2>
        <p className="mt-0.5 text-xs text-muted">This is how Daybook greets you.</p>

        <div className="mt-4 flex items-center gap-3">
          <Avatar name={name || user.name} size="lg" />
          <div>
            <p className="text-sm font-medium text-ink">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="profile-name" className="mb-1.5 block text-xs font-medium text-muted">
              Full name
            </label>
            <input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="field"
            />
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-1.5 block text-xs font-medium text-muted">
              Email
            </label>
            <input id="profile-email" value={user.email} readOnly className="field bg-canvas text-muted" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !name.trim() || name.trim() === user.name}
            className="btn btn-primary"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
          {name.trim() === user.name ? (
            <span className="text-[11.5px] text-muted">You&apos;re all up to date.</span>
          ) : null}
        </div>
      </section>

      <section className="card mt-5 p-5">
        <h2 className="text-base font-semibold text-ink">Workspace</h2>
        <p className="mt-0.5 text-xs text-muted">A quick snapshot of what you&apos;ve built.</p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Projects", value: projects.length },
            { label: "Tasks", value: tasks.length },
            { label: "Completed", value: done },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-canvas px-3 py-3">
              <p className="font-serif text-xl font-semibold text-ink">{stat.value}</p>
              <p className="text-[11px] text-muted">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-line bg-[#fbf9f4] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
                <IconSparkles className="h-4 w-4 text-moss-600" />
                Sample workspace
              </p>
              <p className="mt-0.5 max-w-sm text-[11.5px] leading-relaxed text-muted">
                Load a fresh set of realistic projects and tasks to explore Daybook. This replaces
                your current tasks and projects.
              </p>
            </div>
            {confirmReset ? (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmReset(false);
                    void resetDemoData();
                  }}
                  className="btn btn-danger"
                >
                  Replace data
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="btn btn-secondary shrink-0"
              >
                Load sample data
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="card mt-5 p-5">
        <h2 className="text-base font-semibold text-ink">Session</h2>
        <p className="mt-0.5 text-xs text-muted">
          Signed in as {user.email}. Signing out keeps all of your data safe.
        </p>
        <button
          type="button"
          onClick={() => void signOut()}
          disabled={signingOut}
          className="btn btn-secondary mt-4"
        >
          <IconLogout className="h-4 w-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </section>

      <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted">
        <IconLeaf className="h-3.5 w-3.5 text-moss-600" />
        Daybook · made for a calmer kind of productive
      </div>
      <div className="mt-2 flex items-center justify-center gap-1 text-[11px] text-muted/70">
        <IconCheck className="h-3 w-3" />
        Your tasks are stored persistently in PostgreSQL
      </div>
    </div>
  );
}
