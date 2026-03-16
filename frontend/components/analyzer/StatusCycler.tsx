"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Mapping process steps",
  "Identifying systems",
  "Running governance checks",
  "Identifying automation opportunities",
  "Finalising analysis",
];

const INTERVAL_MS = 2500;

export function StatusCycler() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 h-6">
      <span
        className="w-1.5 h-1.5 rounded-full bg-dome-accent-cyan flex-shrink-0"
        aria-hidden="true"
      />
      <p
        className="font-mono text-[11px] uppercase tracking-dome text-dome-accent-cyan transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
        aria-live="polite"
        aria-atomic="true"
      >
        {MESSAGES[index]}
        <span className="animate-blink">_</span>
      </p>
    </div>
  );
}
