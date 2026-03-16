import { type ReactNode } from "react";
import { clsx } from "@/lib/clsx";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-dome-bg-secondary border border-dome-border rounded-dome p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
