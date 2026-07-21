// 候选「下一步」文案;是否展示由 suggestion-policy 门控(开局 / 卡住才给)。
import type { GameState } from "@/engine/types";
import { LOCATIONS } from "./module";

function has(state: GameState, eventId: string): boolean {
  return state.triggeredEventIds.includes(eventId);
}

export function getSuggestedActions(state: GameState): string[] {
  if (state.status !== "playing") return [];

  if (state.closeness === "已找到") {
    return ["带年糕回家"];
  }

  // 后期旗帜优先,避免被早期「去绿化带」分支抢走
  if (state.flags.heard_cat) {
    if (state.currentLocationId !== LOCATIONS.LOCKERS) return ["去快递柜"];
    return ["打开纸箱"];
  }

  if (state.flags.got_flashlight) {
    if (state.currentLocationId !== LOCATIONS.GARAGE) return ["去车库"];
    return ["仔细找找"];
  }

  if (!has(state, "ask-guard")) {
    return ["问问门卫"];
  }

  if (state.currentLocationId !== LOCATIONS.GREENBELT && !has(state, "search-greenbelt")) {
    return ["去绿化带"];
  }

  if (state.currentLocationId === LOCATIONS.GREENBELT && !has(state, "search-greenbelt")) {
    return ["仔细找找"];
  }

  if (has(state, "search-greenbelt") && !has(state, "talk-aunt")) {
    return state.currentLocationId === LOCATIONS.GREENBELT
      ? ["问问陈阿姨"]
      : ["去绿化带", "问问陈阿姨"];
  }

  if (state.currentLocationId !== LOCATIONS.OFFICE) {
    return ["去物业"];
  }

  return ["找找看"];
}
