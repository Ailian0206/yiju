// 新手引导:只在开局给一次「第一步」提示,找到猫后再提示结局动作。
// 中盘不再弹出最优路径——用户反馈一路点建议就能通关,失去探索感。
import type { GameState } from "@/engine/types";
import { LOCATIONS } from "./module";

function hasPlayerActed(state: GameState): boolean {
  return state.log.some((entry) => entry.kind === "player");
}

export function getSuggestedActions(state: GameState): string[] {
  if (state.status !== "playing") {
    return [];
  }

  // 结局动作不是探路剧透,找到猫后仍可点一下带回家
  if (state.closeness === "已找到") {
    return ["带年糕回家"];
  }

  if (hasPlayerActed(state)) {
    return [];
  }

  // 开局只提示问门卫;若玩家先移动到别处,也不再硬塞整条通关链
  if (state.currentLocationId === LOCATIONS.UNIT_ENTRANCE) {
    return ["问问门卫"];
  }

  return [];
}
