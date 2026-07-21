import type { GameState } from "@/engine/types";
import type { ModuleUi } from "@/content/types";

export const LOCATIONS = {
  TABLE: "table",
} as const;

export const CHARACTERS = {
  PARTNER: "partner",
  MATCHMAKER: "matchmaker",
} as const;

export const ITEMS = {
  WINE: "wine",
  TOPIC: "topic",
} as const;

export const INITIAL_ACTIONS = 12;

export const LOCATION_NAMES: Record<string, string> = {
  [LOCATIONS.TABLE]: "餐厅圆桌",
};

export const OPENING_NARRATION =
  "暖黄灯光下,圆桌已经摆好。对面的人礼貌地笑了笑,介绍人正忙着给你俩夹菜——第一句怎么开口,可能决定整晚气氛。";

export const blindDateUi: ModuleUi = {
  locationNames: LOCATION_NAMES,
  labels: {
    sky: "饭局进度",
    clues: "话题进展",
    closeness: "好感",
    actions: "剩余行动",
  },
  skyDisplay: {
    傍晚: "刚入座",
    黄昏: "热菜上桌",
    擦黑: "甜点将至",
    天黑: "场面崩了",
  },
  closenessDisplay: {
    远: "客套",
    有动静: "缓和",
    很近: "来电",
    已找到: "可收场",
  },
  ending: {
    wonTitle: "体面收场",
    wonBody: "你们礼貌地交换了联系方式。介绍人终于消停了——这一局,至少没社死。",
    lostTitle: "彻底翻车",
    lostBody: "空气降到冰点。介绍人干笑着喊买单——回家的路上你只想把自己埋进被窝。",
    cluesLabel: "推进话题",
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
    currentLocationId: LOCATIONS.TABLE,
    flags: {},
    triggeredEventIds: [],
    log: [],
  };
}
