// 找猫模组事件卡。顺序即引擎匹配顺序(见 engine/reducer.ts 头部注释)——
// 更具体的卡排在对应的 repeatable 兜底卡之前。
//
// 呼叫(call):产品文档 §6「喊名字 → 远处似有回应,亲近感可提一档」。
// P0 用确定性实现代替「概率性」——仅当亲近感仍为「远」时首次呼喊提档;
// 已更近后再喊走 repeat 卡,避免把「很近」降回去。必败序列仍可只靠呼喊耗尽行动。
import type { EventCard } from "@/engine/types";
import { CHARACTERS, ITEMS, LOCATIONS } from "./module";

export const lostCatEvents: EventCard[] = [
  // 早期:喊名字(任意地点)。requiresCloseness 限制只在「远」时提档一次。
  {
    id: "call-name-distant",
    intentType: "call",
    requiresCloseness: "远",
    effects: { closeness: "有动静" },
    templateKeys: ["call-distant-1", "call-distant-2"],
  },
  {
    id: "call-name-repeat",
    intentType: "call",
    repeatable: true,
    effects: {},
    templateKeys: ["call-repeat-1", "call-repeat-2"],
  },

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
    id: "search-greenbelt-repeat",
    intentType: "search",
    locationId: LOCATIONS.GREENBELT,
    repeatable: true,
    effects: {},
    templateKeys: ["search-greenbelt-repeat-1", "search-greenbelt-repeat-2"],
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

  // 中期:物业亭借手电。同一件事两种问法都要能触发——
  // 「找找看」落到 search,「找手电」因为提到物品名会被 intent 解析成
  // use(见 engine/intent.ts 优先级:use 在 search 之前),两张卡效果一致。
  {
    id: "search-office-flashlight",
    intentType: "search",
    locationId: LOCATIONS.OFFICE,
    effects: { setFlags: ["got_flashlight"] },
    templateKeys: ["search-office-flashlight-1", "search-office-flashlight-2"],
  },
  {
    id: "use-flashlight-office",
    intentType: "use",
    targetId: ITEMS.FLASHLIGHT,
    locationId: LOCATIONS.OFFICE,
    effects: { setFlags: ["got_flashlight"] },
    templateKeys: ["search-office-flashlight-1", "search-office-flashlight-2"],
  },
  {
    id: "office-flashlight-repeat",
    intentType: "search",
    locationId: LOCATIONS.OFFICE,
    repeatable: true,
    effects: {},
    templateKeys: ["office-repeat-1", "office-repeat-2"],
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
  // 车库暗处:无手电 → requiresFlags 不满足 → rejected(见 reducer.ts,
  // 会带上这张卡的 eventId,供 M3 narrator 给"太黑看不清"这类针对性文案)。
  // 「仔细找找」「用手电照照」两种说法都要能触发,效果一致。
  {
    id: "search-garage-with-flashlight",
    intentType: "search",
    locationId: LOCATIONS.GARAGE,
    requiresFlags: ["got_flashlight"],
    effects: { closeness: "很近", setFlags: ["heard_cat"] },
    templateKeys: ["search-garage-with-flashlight-1", "search-garage-with-flashlight-2"],
  },
  {
    id: "use-flashlight-garage",
    intentType: "use",
    targetId: ITEMS.FLASHLIGHT,
    locationId: LOCATIONS.GARAGE,
    requiresFlags: ["got_flashlight"],
    effects: { closeness: "很近", setFlags: ["heard_cat"] },
    templateKeys: ["search-garage-with-flashlight-1", "search-garage-with-flashlight-2"],
  },
  {
    id: "garage-repeat",
    intentType: "search",
    locationId: LOCATIONS.GARAGE,
    requiresFlags: ["got_flashlight"],
    repeatable: true,
    effects: {},
    templateKeys: ["garage-repeat-1", "garage-repeat-2"],
  },

  // 通关:必须先在车库听见猫叫(heard_cat)才能开箱——纸箱本身不会
  // 从开局直接可开,呼应产品文档 §6 把它放在"后期(线索 4+)"的设计。
  {
    id: "use-box",
    intentType: "use",
    targetId: ITEMS.BOX,
    locationId: LOCATIONS.LOCKERS,
    requiresFlags: ["heard_cat"],
    effects: { closeness: "已找到", setFlags: ["cat_in_box"] },
    templateKeys: ["use-box-1", "use-box-2"],
  },
];
