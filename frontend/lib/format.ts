import type { Messages } from "./messages";

/** Minutes as the visitor's language writes a duration ("1h 30m", "1 Std. 30 Min."); null stays null. */
export function formatMinutes(t: Messages, mins: number | null): string | null {
  if (mins === null) return null;
  return t.duration(Math.floor(mins / 60), mins % 60);
}
