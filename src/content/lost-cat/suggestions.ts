// 新手引导:根据当前局面给 1-2 条"大概率有用"的建议行动,点了直接提交,
// 不用背地点+动作的对应关系。这是纯内容层逻辑(哪个地点该建议什么,
// 是找猫模组自己的知识),不影响引擎能理解任何自由文本输入。
import type { GameState } from "@/engine/types";
import { LOCATIONS } from "./module";

function hasTriggered(state: GameState, eventId: string): boolean {
  return state.triggeredEventIds.includes(eventId);
}

export function getSuggestedActions(state: GameState): string[] {
  if (state.status !== "playing") {
    return [];
  }

  if (state.closeness === "已找到") {
    return ["带年糕回家"];
  }

  switch (state.currentLocationId) {
    case LOCATIONS.UNIT_ENTRANCE:
      return hasTriggered(state, "ask-guard") ? ["去绿化带"] : ["问问门卫"];

    case LOCATIONS.GREENBELT:
      if (!hasTriggered(state, "search-greenbelt")) return ["仔细找找"];
      if (!hasTriggered(state, "talk-aunt")) return ["问问陈阿姨"];
      return ["去物业"];

    case LOCATIONS.OFFICE:
      return state.flags.got_flashlight ? ["去车库"] : ["找找看"];

    case LOCATIONS.GARAGE:
      if (!state.flags.got_flashlight) return ["去物业"];
      return state.flags.heard_cat ? ["去快递柜"] : ["仔细找找"];

    case LOCATIONS.LOCKERS:
      if (state.flags.heard_cat) return ["打开纸箱"];
      return hasTriggered(state, "talk-courier") ? ["去车库"] : ["问问小吴"];

    default:
      return [];
  }
}
