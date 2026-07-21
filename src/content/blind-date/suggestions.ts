import type { GameState } from "@/engine/types";

function has(state: GameState, eventId: string): boolean {
  return state.triggeredEventIds.includes(eventId);
}

export function getSuggestedActions(state: GameState): string[] {
  if (state.status !== "playing") return [];
  if (state.closeness === "已找到") return ["体面收场"];
  if (!has(state, "greet-partner")) return ["跟对方打招呼"];
  if (!has(state, "toast-wine")) return ["敬一杯"];
  if (!has(state, "chat-topic")) return ["聊聊工作"];
  if (!has(state, "calm-matchmaker")) return ["安抚介绍人"];
  return ["体面收场"];
}
