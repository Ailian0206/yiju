import type { ModuleBundle } from "@/content/types";
import { createLLMNarrator } from "@/content/lost-cat/llm-narrator";
import { elevatorEvents } from "./events";
import { elevatorVocabulary } from "./lexicon";
import { elevatorMeta } from "./meta";
import { createInitialState, elevatorUi, OPENING_NARRATION } from "./module";
import { createElevatorNarrator } from "./narrator-config";
import { elevatorSceneArt } from "./scene-art";
import { getSuggestedActions } from "./suggestions";

export function createElevatorBundle(): ModuleBundle {
  return {
    meta: elevatorMeta,
    createInitialState,
    vocabulary: elevatorVocabulary,
    events: elevatorEvents,
    openingNarration: OPENING_NARRATION,
    getSuggestedActions,
    ui: elevatorUi,
    sceneArt: elevatorSceneArt,
    createNarrator(options) {
      return createElevatorNarrator({
        llmNarrator: options?.llmNarrator ?? createLLMNarrator("elevator"),
        maxCallsPerSession: options?.maxCallsPerSession,
      });
    },
  };
}
