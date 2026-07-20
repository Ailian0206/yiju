// 找猫模组事件卡。顺序即引擎匹配顺序(见 engine/reducer.ts 头部注释)——
// 更具体的卡排在对应的 repeatable 兜底卡之前。
import type { EventCard } from "@/engine/types";
import { CHARACTERS, ITEMS, LOCATIONS } from "./module";

export const lostCatEvents: EventCard[] = [
  // 早期:问门卫,指向绿化带。门卫在楼下随时能问,不限制地点。
  {
    id: "ask-guard",
    intentType: "talk",
    targetId: CHARACTERS.GUARD,
    effects: { clues: 1 },
    templateKeys: ["ask-guard-1", "ask-guard-2"],
  },
  {
    id: "ask-guard-repeat",
    intentType: "talk",
    targetId: CHARACTERS.GUARD,
    repeatable: true,
    effects: {},
    templateKeys: ["ask-guard-repeat-1", "ask-guard-repeat-2"],
  },

  // 中期:绿化带搜证 + 问陈阿姨
  {
    id: "search-greenbelt",
    intentType: "search",
    locationId: LOCATIONS.GREENBELT,
    effects: { clues: 1, closeness: "有动静" },
    templateKeys: ["search-greenbelt-1", "search-greenbelt-2"],
  },
  {
    id: "talk-aunt",
    intentType: "talk",
    targetId: CHARACTERS.AUNT,
    locationId: LOCATIONS.GREENBELT,
    effects: { clues: 1 },
    templateKeys: ["talk-aunt-1", "talk-aunt-2"],
  },
  {
    id: "talk-aunt-repeat",
    intentType: "talk",
    targetId: CHARACTERS.AUNT,
    locationId: LOCATIONS.GREENBELT,
    repeatable: true,
    effects: {},
    templateKeys: ["talk-aunt-repeat-1", "talk-aunt-repeat-2"],
  },

  // 中期:物业亭借手电
  {
    id: "search-office-flashlight",
    intentType: "search",
    locationId: LOCATIONS.OFFICE,
    effects: { setFlags: ["got_flashlight"] },
    templateKeys: ["search-office-flashlight-1", "search-office-flashlight-2"],
  },

  // 后期:快递员指路,车库照手电,开箱
  {
    id: "talk-courier",
    intentType: "talk",
    targetId: CHARACTERS.COURIER,
    locationId: LOCATIONS.LOCKERS,
    effects: { clues: 1 },
    templateKeys: ["talk-courier-1", "talk-courier-2"],
  },
  {
    id: "talk-courier-repeat",
    intentType: "talk",
    targetId: CHARACTERS.COURIER,
    locationId: LOCATIONS.LOCKERS,
    repeatable: true,
    effects: {},
    templateKeys: ["talk-courier-repeat-1", "talk-courier-repeat-2"],
  },
  {
    id: "search-garage-with-flashlight",
    intentType: "search",
    locationId: LOCATIONS.GARAGE,
    requiresFlags: ["got_flashlight"],
    effects: { closeness: "很近", setFlags: ["heard_cat"] },
    templateKeys: ["search-garage-with-flashlight-1", "search-garage-with-flashlight-2"],
  },
  {
    id: "use-box",
    intentType: "use",
    targetId: ITEMS.BOX,
    locationId: LOCATIONS.LOCKERS,
    effects: { closeness: "已找到", setFlags: ["cat_in_box"] },
    templateKeys: ["use-box-1", "use-box-2"],
  },
];
