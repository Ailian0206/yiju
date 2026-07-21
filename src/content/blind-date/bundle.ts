import type { ModuleBundle } from "@/content/types";
import { createLLMNarrator } from "@/content/lost-cat/llm-narrator";
import { blindDateEvents } from "./events";
import { blindDateVocabulary } from "./lexicon";
import { blindDateMeta } from "./meta";
import { createInitialState, blindDateUi, OPENING_NARRATION } from "./module";
import { createBlindDateNarrator } from "./narrator-config";
import { blindDateSceneArt } from "./scene-art";
import { getSuggestedActions } from "./suggestions";

export function createBlindDateBundle(): ModuleBundle {
  return {
    meta: blindDateMeta,
    createInitialState,
    vocabulary: blindDateVocabulary,
    events: blindDateEvents,
    openingNarration: OPENING_NARRATION,
    getSuggestedActions,
    ui: blindDateUi,
    sceneArt: blindDateSceneArt,
    createNarrator(options) {
      return createBlindDateNarrator({
        llmNarrator: options?.llmNarrator ?? createLLMNarrator("blind-date"),
        maxCallsPerSession: options?.maxCallsPerSession,
      });
    },
  };
}
