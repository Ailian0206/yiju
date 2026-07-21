// 照顾植物一周:启用引擎日制(day/phase),用 closeness 映射植物健康。
import type { GameState } from "@/engine/types";
import type { ModuleUi } from "@/content/types";

export const LOCATIONS = {
  LIVING: "living",
  BALCONY: "balcony",
} as const;

export const CHARACTERS = {
  PLANT: "plant",
} as const;

export const ITEMS = {
  WATER: "water",
  FERTILIZER: "fertilizer",
  SHADE: "shade",
} as const;

/** 一周 7 天 × 早晚 2 段 = 最多 14 次消耗行动。 */
export const INITIAL_ACTIONS = 14;

export const LOCATION_NAMES: Record<string, string> = {
  [LOCATIONS.LIVING]: "客厅窗边",
  [LOCATIONS.BALCONY]: "阳台",
};

export const OPENING_NARRATION =
  "朋友把一盆挑剔的绿植放在客厅窗边,留下一张便签:「见干见湿,别晒死也别涝死。」日历翻到周一——七天后,它得还活着。";

export const plantWeekUi: ModuleUi = {
  locationNames: LOCATION_NAMES,
  labels: {
    sky: "日程",
    clues: "照料心得",
    closeness: "植物状态",
    actions: "剩余行动",
  },
  closenessDisplay: {
    远: "蔫蔫的",
    有动静: "回了点精神",
    很近: "叶子挺括",
    已找到: "健康可交还",
  },
  ending: {
    wonTitle: "交还成功",
    wonBody: "朋友推门进来,绿植还撑着漂亮的叶子。她笑着说:「你比说明书写的还靠谱。」",
    lostTitle: "没养住",
    lostBody: "叶子卷边发黄。朋友沉默片刻,只说:「下次……我还是自己带出门吧。」",
    cluesLabel: "照料心得",
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
    currentLocationId: LOCATIONS.LIVING,
    flags: {},
    triggeredEventIds: [],
    log: [],
    day: 1,
    phase: "早",
  };
}
