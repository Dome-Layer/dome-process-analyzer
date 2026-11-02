"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n";

const INTERVAL_MS = 2500;

export function StatusCycler() {
  const MESSAGES = useT().status;
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        // Every language has the same five messages (the catalogue's type guarantees it).
        setIndex((i) => (i + 1) % 5);
        setVisible(true);
      }, 300);
    }, INTERVAL_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 h-6">
      <span
        className="w-1.5 h-1.5 rounded-full bg-dome-accent flex-shrink-0"
        aria-hidden="true"
      />
      <p
        className="font-sans text-[11px] font-semibold uppercase tracking-dome text-dome-accent transition-opacity duration-300"
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
