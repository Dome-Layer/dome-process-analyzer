"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface AnalysisFormProps {
  onSubmit: (description: string, processName?: string, domainHint?: string) => void;
  loading: boolean;
}

const PLACEHOLDER = `Describe your business process in plain language. Include who does what, which systems are used, and any approval steps.

Example: "Our supplier invoice process starts when the AP team receives an invoice by email. They manually check it against the purchase order in SAP, then route it to the budget owner for approval via email. If approved, they re-enter the payment details into SAP and schedule payment. If the amount exceeds €50,000 the CFO must also approve, but we don't have a formal escalation rule in the system..."`;

export function AnalysisForm({ onSubmit, loading }: AnalysisFormProps) {
  const [description, setDescription] = useState("");
  const [processName, setProcessName] = useState("");
  const [domainHint, setDomainHint] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (description.trim().length < 50) return;
    onSubmit(
      description.trim(),
      processName.trim() || undefined,
      domainHint.trim() || undefined
    );
  }

  const charCount = description.trim().length;
  const tooShort = charCount > 0 && charCount < 50;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label
          htmlFor="description"
          className="block font-body text-[11px] font-semibold uppercase tracking-[0.06em] text-dome-text-muted mb-2"
        >
          Process description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={10}
          className="w-full bg-dome-bg-tertiary border border-dome-border rounded-dome px-4 py-3 font-body text-sm text-dome-text-primary placeholder:text-dome-text-muted leading-relaxed resize-y focus:border-dome-accent-cyan focus:outline-none focus:ring-1 focus:ring-dome-accent-cyan/20 transition-colors"
        />
        <div className="flex justify-between mt-1.5">
          {tooShort ? (
            <p className="font-mono text-[11px] text-dome-status-critical">
              Minimum 50 characters ({50 - charCount} more needed)
            </p>
          ) : (
            <span />
          )}
          <p className="font-mono text-[11px] text-dome-text-muted">
            {charCount.toLocaleString()} / 10,000
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="font-mono text-[11px] uppercase tracking-dome text-dome-accent-cyan text-left hover:text-dome-accent-lightblue transition-colors"
      >
        {showAdvanced ? "— Hide options" : "+ Optional fields"}
      </button>

      {showAdvanced && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="processName"
              className="block font-body text-[11px] font-semibold uppercase tracking-[0.06em] text-dome-text-muted mb-2"
            >
              Process name
            </label>
            <input
              id="processName"
              type="text"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder="e.g. Supplier Invoice Approval"
              maxLength={120}
              className="w-full bg-dome-bg-tertiary border border-dome-border rounded-dome px-4 py-3 font-body text-sm text-dome-text-primary placeholder:text-dome-text-muted focus:border-dome-accent-cyan focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="domainHint"
              className="block font-body text-[11px] font-semibold uppercase tracking-[0.06em] text-dome-text-muted mb-2"
            >
              Domain hint
            </label>
            <input
              id="domainHint"
              type="text"
              value={domainHint}
              onChange={(e) => setDomainHint(e.target.value)}
              placeholder="e.g. Procure-to-Pay, Commodity Finance"
              className="w-full bg-dome-bg-tertiary border border-dome-border rounded-dome px-4 py-3 font-body text-sm text-dome-text-primary placeholder:text-dome-text-muted focus:border-dome-accent-cyan focus:outline-none transition-colors"
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <p className="font-body text-xs text-dome-text-muted max-w-sm">
          The process description is analysed and then discarded. It is never stored without your explicit consent.
        </p>
        <Button
          type="submit"
          loading={loading}
          disabled={charCount < 50 || charCount > 10000}
        >
          Analyse process
        </Button>
      </div>
    </form>
  );
}
