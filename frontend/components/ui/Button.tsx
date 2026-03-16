import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { clsx } from "@/lib/clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-mono text-sm font-medium uppercase tracking-dome transition-all duration-200 rounded-dome disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-dome-text-primary text-dome-bg-primary px-8 py-3.5 hover:bg-dome-text-secondary",
    secondary:
      "bg-transparent text-dome-text-primary border border-dome-text-primary px-8 py-3.5 hover:border-dome-accent-cyan hover:text-dome-accent-cyan",
    ghost:
      "bg-transparent text-dome-accent-cyan px-4 py-3 underline underline-offset-4 hover:text-dome-accent-lightblue",
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
