"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { ClarifyingQuestion, ClarificationAnswer } from "@/lib/types";

interface Props {
  questions: ClarifyingQuestion[];
  onRefine: (answers: ClarificationAnswer[]) => void;
  refining: boolean;
  className?: string;
}

const affectsVariant: Record<string, "default" | "critical" | "major" | "minor"> = {
  governance: "critical",
  automation: "high" as "default",
  systems: "default",
  timing: "minor",
  steps: "minor",
};

export function ClarifyingQuestions({ questions, onRefine, refining, className }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(questions.map((q) => [q.id, ""]))
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const filled = Object.entries(answers)
      .filter(([, v]) => v.trim().length > 0)
      .map(([question_id, answer]) => ({ question_id, answer: answer.trim() }));

    if (filled.length === 0) return;
    onRefine(filled);
  }

  if (questions.length === 0) return null;

  return (
    <Card className={className}>
      <SectionLabel>Clarifying questions</SectionLabel>
      <h3 className="font-display text-lg font-semibold text-dome-text-primary mb-2">
        Refine the analysis
      </h3>
      <p className="font-body text-sm text-dome-text-muted mb-5">
        Answer any of these questions to improve accuracy. You don&apos;t need to answer all of them.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {questions.map((q) => (
          <div key={q.id}>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant={affectsVariant[q.affects] ?? "default"}>
                {q.affects}
              </Badge>
            </div>
            <label
              htmlFor={q.id}
              className="block font-body text-sm font-medium text-dome-text-primary mb-1"
            >
              {q.question}
            </label>
            <p className="font-body text-xs text-dome-text-muted mb-2">{q.context}</p>
            <textarea
              id={q.id}
              value={answers[q.id]}
              onChange={(e) =>
                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
              }
              rows={2}
              maxLength={2000}
              placeholder="Your answer…"
              className="w-full bg-dome-bg-tertiary border border-dome-border rounded-dome px-4 py-2.5 font-body text-sm text-dome-text-primary placeholder:text-dome-text-muted resize-y focus:border-dome-accent-cyan focus:outline-none transition-colors"
            />
          </div>
        ))}

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={refining}>
            Refine analysis
          </Button>
        </div>
      </form>
    </Card>
  );
}
