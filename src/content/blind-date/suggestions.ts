import type { GameState } from "@/engine/types";

function hasPlayerActed(state: GameState): boolean {
  return state.log.some((entry) => entry.kind === "player");
}

export function getSuggestedActions(state: GameState): string[] {
  if (state.status !== "playing") return [];
  if (state.closeness === "已找到") return ["体面收场"];
  if (hasPlayerActed(state)) return [];
  return ["跟对方打招呼"];
}
