// 电梯故障:单地点轿厢,用现有 sky/clues/closeness 映射「时段/进展/同梯气氛」。
import type { GameState } from "@/engine/types";
import type { ModuleUi } from "@/content/types";

export const LOCATIONS = {
  CABIN: "cabin",
} as const;

export const CHARACTERS = {
  GRANDMA: "grandma",
  OFFICE: "office",
  RIDER: "rider",
} as const;

export const ITEMS = {
  ALARM: "alarm",
  INTERCOM: "intercom",
} as const;

export const INITIAL_ACTIONS = 12;

export const LOCATION_NAMES: Record<string, string> = {
  [LOCATIONS.CABIN]: "电梯轿厢",
};

export const OPENING_NARRATION =
  "电梯在两层之间突然顿住。应急灯嗡嗡亮着。旁边的老太太攥紧购物袋,白领盯着失灵的楼层灯,外卖骑手已经在拍门——你得先稳住场面。";

export const elevatorUi: ModuleUi = {
  locationNames: LOCATION_NAMES,
  labels: {
    sky: "时段",
    clues: "进展",
    closeness: "同梯气氛",
    actions: "剩余行动",
  },
  skyDisplay: {
    傍晚: "刚停住",
    黄昏: "闷热起来",
    擦黑: "焦躁",
    天黑: "超时",
  },
  closenessDisplay: {
    远: "紧绷",
    有动静: "缓和",
    很近: "协作",
    已找到: "可出梯",
  },
  ending: {
    wonTitle: "安全出梯",
    wonBody: "门缝透进楼道的光。你们互相点点头,像刚一起熬过一场短暂的共难。",
    lostTitle: "还困着",
    lostBody: "外面传来维修声,却迟迟打不开门。手机电量见底——这一局,你们还得再等一会儿。",
    cluesLabel: "推进进展",
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
    currentLocationId: LOCATIONS.CABIN,
    flags: {},
    triggeredEventIds: [],
    log: [],
  };
}
