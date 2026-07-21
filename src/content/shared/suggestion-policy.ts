import type { ActionOutcome } from "@/engine/types";

const STUCK_KINDS: ReadonlySet<ActionOutcome["kind"]> = new Set([
  "unknown",
  "noop",
  "rejected",
]);

/** 仅开局或卡住时给建议,避免一路点芯片通关。 */
export function shouldOfferSuggestions(input: {
  hasPlayerActed: boolean;
  lastOutcomeKind: ActionOutcome["kind"] | null;
}): boolean {
  if (!input.hasPlayerActed) return true;
  if (!input.lastOutcomeKind) return false;
  return STUCK_KINDS.has(input.lastOutcomeKind);
}
