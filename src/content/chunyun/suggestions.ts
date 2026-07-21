import type { GameState } from "@/engine/types";

function hasPlayerActed(state: GameState): boolean {
  return state.log.some((e) => e.kind === "player");
}

export function getSuggestedActions(state: GameState): string[] {
  if (state.status !== "playing") return [];
  if (state.closeness === "已找到") return ["确认购票"];
  if (hasPlayerActed(state)) return [];
  return ["刷新购票页"];
}
