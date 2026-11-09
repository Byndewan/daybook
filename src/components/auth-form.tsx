"use client";

import Link from "next/link";
import { useState } from "react";
import { IconAlert, IconSparkles } from "@/components/icons";

export function AuthForm({
  mode,
  demoEmail,
  demoPassword,
}: {
  mode: "login" | "signup";
  demoEmail: string;
  demoPassword: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<"form" | "demo" | null>(null);

  const goToApp = () => {
    // A full navigation drops any cached RSC payloads from a previous session.
    window.location.assign("/dashboard");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy("form");
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "signup" ? { name, email, password } : { email, password }),
      });
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Something went wrong. Please try again.");
        setBusy(null);
        return;
      }
      goToApp();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setBusy(null);
    }
  };

  const demoLogin = async () => {
    setError("");
    setBusy("demo");
    try {
      const response = await fetch("/api/auth/demo", { method: "POST" });
      if (!response.ok) {
        setError("The demo workspace isn't ready yet. Try again in a moment.");
        setBusy(null);
        return;
      }
      goToApp();
    } catch {
      setError("Couldn't start the demo. Please try again.");
      setBusy(null);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="font-serif text-[26px] font-semibold leading-tight text-ink">
          {mode === "login" ? "Welcome back" : "Create your daybook"}
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          {mode === "login"
            ? "Sign in and pick up exactly where you left off."
            : "A calm home for your tasks, projects and plans."}
        </p>
      </div>

      {error ? (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-[#f0d4c8] bg-[#fbeae4] px-3 py-2.5 text-[13px] text-[#8f3a22]">
          <IconAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <form onSubmit={submit} className="space-y-3.5">
        {mode === "signup" ? (
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-muted">
              Your name
            </label>
            <input
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alex Rivera"
              autoComplete="name"
              required
              className="field"
            />
          </div>
        ) : null}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="field"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-muted">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={mode === "signup" ? 8 : undefined}
            required
            className="field"
          />
        </div>

        <button
          type="submit"
          disabled={busy !== null}
          className="btn btn-primary mt-1 w-full py-2.5"
        >
          {busy === "form"
            ? "One moment…"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] uppercase tracking-[0.14em] text-muted">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        type="button"
        onClick={() => void demoLogin()}
        disabled={busy !== null}
        className="btn btn-secondary w-full py-2.5"
      >
        <IconSparkles className="h-4 w-4 text-moss-600" />
        {busy === "demo" ? "Opening the demo…" : "Explore the demo workspace"}
      </button>
      <p className="mt-2 text-center text-[11px] text-muted">
        Demo login: {demoEmail} · {demoPassword}
      </p>

      <p className="mt-6 text-center text-[13px] text-muted">
        {mode === "login" ? (
          <>
            New to Daybook?{" "}
            <Link href="/signup" className="font-medium text-moss-700 hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-moss-700 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
