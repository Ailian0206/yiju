import type { GameState } from "@/engine/types";
import type { ModuleUi } from "@/content/types";

export const LOCATIONS = { DESK: "desk" } as const;
export const CHARACTERS = { FAMILY: "family" } as const;
export const ITEMS = { REFRESH: "refresh", TRAIN: "train", TICKET: "ticket" } as const;
export const INITIAL_ACTIONS = 12;

export const LOCATION_NAMES: Record<string, string> = { [LOCATIONS.DESK]: "书桌前" };

export const OPENING_NARRATION =
  "零点将近。手机屏幕的亮光映在你脸上,热门车次还是灰的。家人在群里问「抢到了吗」——这一夜,只能靠你。";

export const chunyunUi: ModuleUi = {
  locationNames: LOCATION_NAMES,
  labels: { sky: "时刻", clues: "策略进展", closeness: "车票把握", actions: "剩余行动" },
  skyDisplay: { 傍晚: "23:40", 黄昏: "23:50", 擦黑: "23:58", 天黑: "售罄" },
  closenessDisplay: { 远: "没谱", 有动静: "有候补", 很近: "接近有票", 已找到: "已锁票" },
  ending: {
    wonTitle: "抢到了",
    wonBody: "支付成功的提示跳出。你把截图丢进家庭群——除夕,回家的路通了。",
    lostTitle: "没抢到",
    lostBody: "页面跳出「无票」。群里安静了一秒,妈妈说「没事,我们想别的办法」。",
    cluesLabel: "推进策略",
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
    currentLocationId: LOCATIONS.DESK,
    flags: {},
    triggeredEventIds: [],
    log: [],
  };
}
