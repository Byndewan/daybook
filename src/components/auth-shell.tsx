import Link from "next/link";
import type { ReactNode } from "react";
import { IconCheck, IconLeaf, IconSun } from "@/components/icons";

const HIGHLIGHTS = [
  "One calm list for today, not twelve scattered notes",
  "Projects, checklists and due dates that stay in view",
  "Works on your phone in line, and your laptop at your desk",
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col lg:grid lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-forest px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-moss-500/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-moss-400/10 blur-3xl"
        />

        <Link href="/" className="relative flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-moss-500/25 text-moss-200 ring-1 ring-white/10">
            <IconLeaf className="h-4.5 w-4.5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-xl font-semibold">Daybook</span>
            <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-moss-200/60">
              Personal tasks
            </span>
          </span>
        </Link>

        <div className="relative max-w-md">
          <p className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-moss-100">
            <IconSun className="h-3 w-3" />
            A daybook, not a backlog
          </p>
          <h2 className="font-serif text-[34px] leading-[1.15] font-semibold tracking-tight">
            A calmer place to get things done.
          </h2>
          <p className="mt-3 text-[14px] leading-relaxed text-moss-100/75">
            Daybook keeps your day, your projects and your head in one gentle system — so the
            important things stay visible without the noise.
          </p>
          <ul className="mt-6 space-y-2.5">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[13px] text-moss-100/85">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-moss-500/30 text-moss-100">
                  <IconCheck className="h-2.5 w-2.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-[12px] leading-relaxed text-moss-100/80">
            &ldquo;I stopped juggling four apps. Everything I need to do today lives in one calm
            page.&rdquo;
          </p>
          <p className="mt-2 text-[11px] text-moss-200/60">— a very relieved Daybook user</p>
        </div>
      </aside>

      <main className="flex flex-1 flex-col px-5 py-8 sm:px-8">
        <div className="mb-8 flex items-center justify-between lg:mb-0">
          <Link href="/" className="flex items-center gap-2 lg:invisible">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-moss-700 text-white">
              <IconLeaf className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight">Daybook</span>
          </Link>
          <Link href="/" className="text-xs font-medium text-muted transition hover:text-ink">
            ← Back home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-[380px] animate-rise">{children}</div>
        </div>

        <p className="mt-8 text-center text-[11px] text-muted">
          Built for one person at a time. Your data stays yours.
        </p>
      </main>
    </div>
  );
}
