"use client";

import { useLocale, useMessages } from "@dome-layer/dome-ui";
import { INTL_LOCALES } from "@dome-layer/dome-ui/utils";
import { MESSAGES, type Messages } from "./messages";

/** This tool's words in the visitor's language (dome-ui's language rule). */
export function useT(): Messages {
  return useMessages(MESSAGES);
}

/** The `Intl` locale for numbers and dates in the visitor's language. */
export function useIntlLocale(): string {
  return INTL_LOCALES[useLocale()];
}
