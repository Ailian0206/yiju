// 找猫模组的静态标识与开局状态。引擎(src/engine/**)不 import 本文件——
// 依赖方向永远是 content -> engine,不能反过来。
import type { GameState } from "@/engine/types";
import type { ModuleUi } from "@/content/types";

export const LOCATIONS = {
  UNIT_ENTRANCE: "unit-entrance",
  GREENBELT: "greenbelt",
  GARAGE: "garage",
  OFFICE: "office",
  LOCKERS: "lockers",
} as const;

export const CHARACTERS = {
  GUARD: "guard",
  AUNT: "aunt",
  COURIER: "courier",
} as const;

export const ITEMS = {
  FLASHLIGHT: "flashlight",
  BOX: "box",
} as const;

/** 产品文档 §4.3:开局剩余行动次数。 */
export const INITIAL_ACTIONS = 12;

/** 供界面渲染地点名称,如叙事区"你来到了 {name}"。 */
export const LOCATION_NAMES: Record<string, string> = {
  [LOCATIONS.UNIT_ENTRANCE]: "单元楼下",
  [LOCATIONS.GREENBELT]: "绿化带",
  [LOCATIONS.GARAGE]: "地下车库入口",
  [LOCATIONS.OFFICE]: "物业亭",
  [LOCATIONS.LOCKERS]: "快递柜旁",
};

/**
 * 开局叙述:日志为空时显示。不是一句干巴巴的"你想做什么",而是把第一步
 * 自然地缝进故事里——试玩反馈发现"没有引导,很难玩",这是最低成本的
 * 修复:用叙事本身给出第一条线索,而不是弹一个操作说明。
 */
export const OPENING_NARRATION =
  "傍晚,你发现猫「年糕」不见了。天快黑了。你想起门卫老周一直在楼下,他也许看到了什么。";

export const lostCatUi: ModuleUi = {
  locationNames: LOCATION_NAMES,
  labels: {
    sky: "天色",
    clues: "线索",
    closeness: "亲近感",
    actions: "剩余行动",
  },
  ending: {
    wonTitle: "重逢",
    wonBody: "你抱起年糕往家走,它在怀里蹭了蹭,像是在说这一路它也不容易。",
    lostTitle: "天黑了",
    lostBody: "天黑了,你在家门口放了猫粮和年糕的毯子。明天一早再找。",
    cluesLabel: "收集线索",
  },
};

export function createInitialState(): GameState {
  return {
    status: "playing",
    sky: "傍晚",
    clues: 0,
    closeness: "远",
    actionsRemaining: INITIAL_ACTIONS,
    actionsTaken: 0,
    currentLocationId: LOCATIONS.UNIT_ENTRANCE,
    flags: {},
    triggeredEventIds: [],
    log: [],
  };
}
