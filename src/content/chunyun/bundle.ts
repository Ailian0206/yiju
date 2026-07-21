import type { ModuleBundle } from "@/content/types";
import { createLLMNarrator } from "@/content/lost-cat/llm-narrator";
import { chunyunEvents } from "./events";
import { chunyunVocabulary } from "./lexicon";
import { chunyunMeta } from "./meta";
import { createInitialState, chunyunUi, OPENING_NARRATION } from "./module";
import { createChunyunNarrator } from "./narrator-config";
import { getSuggestedActions } from "./suggestions";

export function createChunyunBundle(): ModuleBundle {
  return {
    meta: chunyunMeta,
    createInitialState,
    vocabulary: chunyunVocabulary,
    events: chunyunEvents,
    openingNarration: OPENING_NARRATION,
    getSuggestedActions,
    ui: chunyunUi,
    createNarrator(options) {
      return createChunyunNarrator({
        llmNarrator: options?.llmNarrator ?? createLLMNarrator("chunyun"),
        maxCallsPerSession: options?.maxCallsPerSession,
      });
    },
  };
}
