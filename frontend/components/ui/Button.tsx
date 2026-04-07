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
    "inline-flex items-center justify-center gap-2 font-sans text-sm font-semibold leading-none transition-all duration-150 rounded-dome disabled:opacity-40 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-dome-accent text-white px-6 py-3 hover:bg-dome-accent-hover active:bg-dome-accent-active focus-visible:shadow-[0_0_0_3px_rgba(0,128,255,0.25)]",
    secondary:
      "bg-transparent text-dome-accent border border-dome-border-accent px-6 py-3 hover:bg-dome-accent-subtle active:bg-dome-bg-accent",
    ghost:
      "bg-transparent text-dome-accent px-3 py-2 hover:text-dome-accent-hover underline underline-offset-4",
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
