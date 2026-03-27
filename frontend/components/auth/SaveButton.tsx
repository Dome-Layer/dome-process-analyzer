"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { saveAnalysis } from "@/lib/api";
import { AuthModal } from "./AuthModal";

interface SaveButtonProps {
  analysisId: string;
  onSaved?: () => void;
}

export function SaveButton({ analysisId, onSaved }: SaveButtonProps) {
  const { isAuthenticated, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [label, setLabel] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <>
        <Button variant="secondary" onClick={() => setAuthOpen(true)}>
          Save analysis
        </Button>
        {authOpen && <AuthModal onClose={() => setAuthOpen(false)} />}
      </>
    );
  }

  if (saved) {
    return (
      <span className="font-mono text-[11px] uppercase tracking-dome text-dome-status-success">
        Saved
      </span>
    );
  }

  if (!showForm) {
    return (
      <Button variant="secondary" onClick={() => setShowForm(true)}>
        Save analysis
      </Button>
    );
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await saveAnalysis(analysisId, { consent: true, label: label || undefined });
      setSaved(true);
      onSaved?.();
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 401) {
        await signOut();
        setShowForm(false);
        setAuthOpen(true);
        return;
      }
      const message = err instanceof Error ? err.message : "Save failed.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 items-end">
      <p className="font-body text-xs text-dome-text-muted max-w-xs text-right">
        By saving, you consent to storing the full analysis output associated with your account.
        The original process description is never stored.
      </p>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Label (optional)"
        className="w-full max-w-xs bg-dome-bg-tertiary border border-dome-border rounded-dome px-4 py-2 font-body text-sm text-dome-text-primary placeholder:text-dome-text-muted focus:border-dome-accent-cyan focus:outline-none"
      />
      {error && (
        <p className="font-body text-xs text-dome-status-critical">{error}</p>
      )}
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => setShowForm(false)}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button onClick={handleSave} loading={saving}>
          Confirm save
        </Button>
      </div>
    </div>
  );
}
