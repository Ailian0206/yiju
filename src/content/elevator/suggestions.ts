import type { GameState } from "@/engine/types";

function has(state: GameState, eventId: string): boolean {
  return state.triggeredEventIds.includes(eventId);
}

export function getSuggestedActions(state: GameState): string[] {
  if (state.status !== "playing") return [];
  if (state.closeness === "已找到") return ["走出电梯"];
  if (!has(state, "calm-grandma")) return ["安抚老太太"];
  if (!state.flags.alarm_on) return ["按报警铃"];
  if (!has(state, "ask-office")) return ["问问白领"];
  if (!state.flags.panel_checked) return ["检查面板"];
  if (!state.flags.rescue_coming) return ["用对讲机"];
  return ["走出电梯"];
}
