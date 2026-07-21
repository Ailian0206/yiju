import type { ModuleBundle } from "@/content/types";
import { createLLMNarrator } from "@/content/lost-cat/llm-narrator";
import { plantWeekEvents } from "./events";
import { plantWeekVocabulary } from "./lexicon";
import { plantWeekMeta } from "./meta";
import { createInitialState, plantWeekUi, OPENING_NARRATION } from "./module";
import { createPlantWeekNarrator } from "./narrator-config";
import { getSuggestedActions } from "./suggestions";

export function createPlantWeekBundle(): ModuleBundle {
  return {
    meta: plantWeekMeta,
    createInitialState,
    vocabulary: plantWeekVocabulary,
    events: plantWeekEvents,
    openingNarration: OPENING_NARRATION,
    getSuggestedActions,
    ui: plantWeekUi,
    createNarrator(options) {
      return createPlantWeekNarrator({
        llmNarrator: options?.llmNarrator ?? createLLMNarrator("plant-week"),
        maxCallsPerSession: options?.maxCallsPerSession,
      });
    },
  };
}
