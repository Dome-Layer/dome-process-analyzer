import { describe, expect, it } from "vitest";
import { MESSAGES } from "./messages";

/** The shape of a catalogue, with functions and arrays reduced to markers, for comparing languages. */
function shape(value: unknown): unknown {
  if (typeof value === "function") return `fn/${value.length}`;
  if (Array.isArray(value)) return `array/${value.length}`;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, shape((value as Record<string, unknown>)[key])])
    );
  }
  return typeof value;
}

describe("Process Analyzer catalogue (roadmap row 6)", () => {
  it("has the same keys, functions and list lengths in every language", () => {
    const english = shape(MESSAGES.en);
    for (const locale of ["it", "nl", "de"] as const) {
      expect(shape(MESSAGES[locale]), locale).toEqual(english);
    }
  });

  it("labels every step type, severity and automation type the backend sends", () => {
    for (const locale of ["en", "it", "nl", "de"] as const) {
      const t = MESSAGES[locale];
      for (const type of ["manual", "automated", "decision", "approval", "external"] as const) {
        expect(t.steps.type[type], `${locale} ${type}`).toBeTruthy();
      }
      for (const severity of ["critical", "major", "minor"] as const) {
        expect(t.governance.severity[severity]).toBeTruthy();
      }
      for (const type of ["rpa", "ai_extraction", "api_integration", "workflow_engine", "llm_agent", "rule_engine"]) {
        expect(t.automation.type[type], `${locale} ${type}`).toBeTruthy();
      }
    }
  });

  it("writes durations the way each language does", () => {
    expect(MESSAGES.en.duration(1, 30)).toBe("1h 30m");
    expect(MESSAGES.en.duration(0, 45)).toBe("45m");
    expect(MESSAGES.de.duration(2, 0)).toBe("2 Std.");
    expect(MESSAGES.it.duration(1, 5)).toBe("1 h 5 min");
    expect(MESSAGES.nl.duration(0, 20)).toBe("20 min");
  });
});
