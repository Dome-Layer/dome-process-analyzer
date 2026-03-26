"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DomeLogo } from "@/components/layout/DomeLogo";

function UnlockForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passphrase, setPassphrase] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const next = searchParams.get("next") ?? "/";
      const res = await fetch(`/api/unlock?next=${encodeURIComponent(next)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passphrase }),
      });

      if (res.ok) {
        const data = await res.json();
        router.replace(data.redirect ?? "/");
      } else {
        setError("Incorrect passphrase. Try again.");
        setPassphrase("");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          placeholder="Passphrase"
          autoFocus
          required
          className={`w-full px-4 py-3 rounded-dome border bg-dome-bg-tertiary font-body text-sm
            text-dome-text-primary placeholder:text-dome-text-muted
            focus:outline-none focus:ring-1 focus:border-dome-accent-cyan focus:ring-dome-accent-cyan/20 transition-colors
            ${error ? "border-dome-status-critical" : "border-dome-border"}`}
        />
        {error && (
          <p className="mt-2 font-mono text-[11px] text-dome-status-critical">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !passphrase}
        className="w-full py-3 rounded-dome bg-dome-text-primary text-white font-display text-sm font-medium
          hover:opacity-90 active:scale-[0.98] transition-all
          disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? "Verifying…" : "Unlock"}
      </button>
    </form>
  );
}

export default function UnlockPage() {
  return (
    <div className="min-h-screen bg-dome-bg-primary flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-4">
          <DomeLogo width={100} />
          <div className="text-center">
            <h1 className="font-display text-xl font-semibold text-dome-text-primary">
              Process Analyzer
            </h1>
            <p className="mt-1 font-body text-sm text-dome-text-muted">
              Enter the passphrase to continue
            </p>
          </div>
        </div>

        <Suspense>
          <UnlockForm />
        </Suspense>
      </div>
    </div>
  );
}
