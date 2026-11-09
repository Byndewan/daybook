"use client";

import { IconAlert, IconLeaf } from "@/components/icons";

export default function AppError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="card w-full max-w-md p-7 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fbeae4] text-[#a8472c]">
          <IconAlert className="h-5 w-5" />
        </span>
        <h1 className="mt-4 font-serif text-xl font-semibold text-ink">Something slipped</h1>
        <p className="mt-1.5 text-sm text-muted">
          Daybook couldn&apos;t load this page. Your data is safe — give it another try.
        </p>
        <button type="button" onClick={reset} className="btn btn-primary mt-5">
          <IconLeaf className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
