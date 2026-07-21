import type { GameState } from "@/engine/types";

function has(state: GameState, eventId: string): boolean {
  return state.triggeredEventIds.includes(eventId);
}

export function getSuggestedActions(state: GameState): string[] {
  if (state.status !== "playing") return [];
  if (state.closeness === "已找到") return ["交还给朋友"];
  if (!has(state, "water-first") && !has(state, "water-on-balcony")) return ["浇水"];
  if (!has(state, "sunbathe")) return ["搬去阳台晒晒"];
  if (!has(state, "fertilize")) return ["施一点肥"];
  if (!has(state, "shade")) return ["挪到阴凉处"];
  if (!has(state, "check-health")) return ["看看叶子"];
  return ["交还给朋友"];
}
