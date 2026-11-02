"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { requestMagicLink } from "@/lib/api";
import { useT } from "@/lib/i18n";

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const t = useT();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await requestMagicLink({ email });
      setSent(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t.auth.failed;
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-dome-text-primary/20 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-dome-bg-secondary border border-dome-border rounded-dome-card p-8 w-full max-w-md mx-4 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
        {!sent ? (
          <>
            <SectionLabel>{t.auth.label}</SectionLabel>
            <h2 className="font-sans text-xl font-semibold text-dome-text-primary mb-2">
              {t.auth.title}
            </h2>
            <p className="font-sans text-sm text-dome-text-muted mb-6">
              {t.auth.lead}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-text-secondary mb-2"
                >
                  {t.auth.email}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-dome-bg-tertiary border border-dome-border rounded-dome px-4 py-3 font-sans text-sm text-dome-text-primary placeholder:text-dome-text-muted focus:border-dome-accent focus:outline-none focus:ring-2 focus:ring-dome-accent/20 transition-colors"
                />
              </div>

              {error && (
                <p className="font-sans text-sm text-dome-status-critical">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={loading} className="flex-1">
                  {t.auth.send}
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                  {t.auth.cancel}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <SectionLabel>{t.auth.sentLabel}</SectionLabel>
            <h2 className="font-sans text-xl font-semibold text-dome-text-primary mb-2">
              {t.auth.sentTitle}
            </h2>
            <p className="font-sans text-sm text-dome-text-muted mb-6">
              {t.auth.sentBefore}
              <strong>{email}</strong>
              {t.auth.sentAfter}
            </p>
            <Button variant="secondary" onClick={onClose} className="w-full">
              {t.auth.close}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
