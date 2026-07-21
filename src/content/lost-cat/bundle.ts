import type { ModuleBundle } from "@/content/types";
import { lostCatEvents } from "./events";
import { lostCatVocabulary } from "./lexicon";
import { createLLMNarrator } from "./llm-narrator";
import { createInitialState, OPENING_NARRATION } from "./module";
import { createLostCatNarrator } from "./narrator-config";
import { getSuggestedActions } from "./suggestions";
import { lostCatMeta } from "./meta";

export function createLostCatBundle(): ModuleBundle {
  return {
    meta: lostCatMeta,
    createInitialState,
    vocabulary: lostCatVocabulary,
    events: lostCatEvents,
    openingNarration: OPENING_NARRATION,
    getSuggestedActions,
    createNarrator(options) {
      return createLostCatNarrator({
        llmNarrator: options?.llmNarrator ?? createLLMNarrator(),
        maxCallsPerSession: options?.maxCallsPerSession,
      });
    },
  };
}
