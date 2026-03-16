// Minimal className joiner — avoids adding a dependency for this
export function clsx(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
