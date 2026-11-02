"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useIntlLocale, useT } from "@/lib/i18n";

interface AnalysisFormProps {
  onSubmit: (description: string, processName?: string, domainHint?: string) => void;
  loading: boolean;
}

export function AnalysisForm({ onSubmit, loading }: AnalysisFormProps) {
  const [description, setDescription] = useState("");
  const [processName, setProcessName] = useState("");
  const [domainHint, setDomainHint] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const t = useT();
  const intlLocale = useIntlLocale();

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

  const inputBase =
    "w-full bg-dome-bg-tertiary border border-dome-border rounded-dome px-4 py-3 font-sans text-sm text-dome-text-primary placeholder:text-dome-text-muted focus:border-dome-accent focus:outline-none focus:ring-2 focus:ring-dome-accent/15 transition-colors";

  const labelBase =
    "block font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-text-secondary mb-2";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="description" className={labelBase}>
          {t.form.description}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t.form.placeholder}
          rows={10}
          className={`${inputBase} leading-relaxed resize-y`}
        />
        <div className="flex justify-between mt-1.5">
          {tooShort ? (
            <p className="font-sans text-[11px] text-dome-status-critical">
              {t.form.minChars(50 - charCount)}
            </p>
          ) : (
            <span />
          )}
          <p className="font-sans text-[11px] text-dome-text-muted">
            {charCount.toLocaleString(intlLocale)} / {(10000).toLocaleString(intlLocale)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-accent text-left hover:text-dome-accent-hover transition-colors"
      >
        {showAdvanced ? t.form.hideOptions : t.form.showOptions}
      </button>

      {showAdvanced && (
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="processName" className={labelBase}>
              {t.form.processName}
            </label>
            <input
              id="processName"
              type="text"
              value={processName}
              onChange={(e) => setProcessName(e.target.value)}
              placeholder={t.form.processNamePlaceholder}
              maxLength={120}
              className={inputBase}
            />
          </div>
          <div>
            <label htmlFor="domainHint" className={labelBase}>
              {t.form.domainHint}
            </label>
            <input
              id="domainHint"
              type="text"
              value={domainHint}
              onChange={(e) => setDomainHint(e.target.value)}
              placeholder={t.form.domainHintPlaceholder}
              className={inputBase}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <p className="font-sans text-xs text-dome-text-muted max-w-sm">
          {t.form.privacy}
        </p>
        <Button
          type="submit"
          loading={loading}
          disabled={charCount < 50 || charCount > 10000}
        >
          {t.form.submit}
        </Button>
      </div>
    </form>
  );
}
