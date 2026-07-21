import type { ActionOutcome } from "@/engine/types";
import type { ModuleSceneArt } from "@/content/types";

/** 按本次 outcome 选一张插图;没有配置则返回 undefined。 */
export function resolveSceneImage(
  sceneArt: ModuleSceneArt | undefined,
  outcome: ActionOutcome,
): string | undefined {
  if (!sceneArt) return undefined;
  if (outcome.kind === "triggered" && sceneArt.byEventId?.[outcome.eventId]) {
    return sceneArt.byEventId[outcome.eventId];
  }
  if (outcome.kind === "moved" && sceneArt.byLocationId?.[outcome.locationId]) {
    return sceneArt.byLocationId[outcome.locationId];
  }
  return undefined;
}
