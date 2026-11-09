"use client";

import { useState } from "react";
import { IconSparkles } from "@/components/icons";

export function DemoButton({ className = "btn btn-primary px-5 py-2.5" }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/auth/demo", { method: "POST" });
      if (!response.ok) throw new Error("Demo unavailable");
      window.location.assign("/dashboard");
    } catch {
      setBusy(false);
      setError("Couldn't open the demo. Please try again.");
    }
  };

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" onClick={() => void start()} disabled={busy} className={className}>
        <IconSparkles className="h-4 w-4" />
        {busy ? "Setting the table…" : "Explore the live demo"}
      </button>
      {error ? <span className="text-[11px] text-[#a8472c]">{error}</span> : null}
    </span>
  );
}
