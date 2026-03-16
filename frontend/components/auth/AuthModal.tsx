"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { requestMagicLink } from "@/lib/api";

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
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
      const message = err instanceof Error ? err.message : "Failed to send link.";
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
      <div className="bg-dome-bg-secondary border border-dome-border rounded-dome p-8 w-full max-w-md mx-4 shadow-sm">
        {!sent ? (
          <>
            <SectionLabel>Sign in</SectionLabel>
            <h2 className="font-display text-xl font-semibold text-dome-text-primary mb-2">
              Access your analyses
            </h2>
            <p className="font-body text-sm text-dome-text-muted mb-6">
              Enter your email and we&apos;ll send a sign-in link. No password required.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block font-body text-[11px] font-semibold uppercase tracking-[0.06em] text-dome-text-muted mb-2"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full bg-dome-bg-tertiary border border-dome-border rounded-dome px-4 py-3 font-body text-sm text-dome-text-primary placeholder:text-dome-text-muted focus:border-dome-accent-cyan focus:outline-none focus:ring-1 focus:ring-dome-accent-cyan/20 transition-colors"
                />
              </div>

              {error && (
                <p className="font-body text-sm text-dome-status-critical">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={loading} className="flex-1">
                  Send link
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <SectionLabel>Link sent</SectionLabel>
            <h2 className="font-display text-xl font-semibold text-dome-text-primary mb-2">
              Check your email
            </h2>
            <p className="font-body text-sm text-dome-text-muted mb-6">
              A sign-in link has been sent to <strong>{email}</strong>. It expires in 60 minutes.
            </p>
            <Button variant="secondary" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
