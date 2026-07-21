import type { GameState } from "@/engine/types";

function has(state: GameState, eventId: string): boolean {
  return state.triggeredEventIds.includes(eventId);
}

export function getSuggestedActions(state: GameState): string[] {
  if (state.status !== "playing") return [];
  if (state.closeness === "已找到") return ["确认购票"];
  if (!has(state, "refresh-page")) return ["刷新购票页"];
  if (!has(state, "ask-family")) return ["问问家人"];
  if (!has(state, "change-train")) return ["换个车次"];
  if (!has(state, "grab-ticket")) return ["候补抢票"];
  return ["确认购票"];
}
