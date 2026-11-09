import Link from "next/link";
import { IconArrowLeft, IconLeaf } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-moss-700 text-white">
        <IconLeaf className="h-5 w-5" />
      </span>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-moss-600">
        404
      </p>
      <h1 className="mt-1.5 font-serif text-3xl font-semibold text-ink">
        This page isn&apos;t on the list
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The page you were looking for doesn&apos;t exist. Let&apos;s get you back to your day.
      </p>
      <div className="mt-6 flex items-center gap-2">
        <Link href="/dashboard" className="btn btn-primary">
          <IconArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
        <Link href="/login" className="btn btn-secondary">
          Sign in
        </Link>
      </div>
    </div>
  );
}
