import { describe, expect, it } from "vitest";
import { createKeywordIntentResolver } from "./intent";
import type { VocabularyConfig } from "./intent";
import type { GameState } from "./types";

// 测试用词表:结构贴近真实找猫模组,但不 import content/,保持引擎测试独立。
const vocabulary: VocabularyConfig = {
  finishKeywords: ["带回家", "回家", "带年糕回家"],
  locationSynonyms: {
    greenbelt: ["绿化带", "草丛"],
    garage: ["车库", "地下车库"],
    office: ["物业亭", "物业"],
    lockers: ["快递柜"],
  },
  characterSynonyms: {
    guard: ["门卫", "老周"],
    aunt: ["阿姨", "陈阿姨", "红衣服的阿姨", "遛娃的邻居"],
    courier: ["快递员", "小吴"],
  },
  itemSynonyms: {
    flashlight: ["手电"],
    box: ["纸箱", "箱子"],
    catFood: ["猫粮"],
  },
  callKeywords: ["喊", "呼唤"],
  searchKeywords: ["找", "搜", "听", "看"],
};

function makeState(): GameState {
  return {
    status: "playing",
    sky: "傍晚",
    clues: 0,
    closeness: "远",
    actionsRemaining: 12,
    actionsTaken: 0,
    currentLocationId: "unit-entrance",
    flags: {},
    triggeredEventIds: [],
    log: [],
  };
}

const resolver = createKeywordIntentResolver(vocabulary);

// 40+ 条用例,覆盖:六类意图 x 多种口语表达、模糊指代、无法归类兜底。
const cases: Array<{ text: string; type: string; targetId?: string }> = [
  // move
  { text: "去绿化带", type: "move", targetId: "greenbelt" },
  { text: "我想去草丛看看", type: "move", targetId: "greenbelt" },
  { text: "走到车库那边", type: "move", targetId: "garage" },
  { text: "去地下车库", type: "move", targetId: "garage" },
  { text: "回物业亭", type: "move", targetId: "office" },
  { text: "去物业问问", type: "move", targetId: "office" },
  { text: "去快递柜那边看看", type: "move", targetId: "lockers" },
  { text: "前往车库入口", type: "move", targetId: "garage" },
  // talk
  { text: "问问门卫", type: "talk", targetId: "guard" },
  { text: "问问老周", type: "talk", targetId: "guard" },
  { text: "问问那个穿红衣服的阿姨", type: "talk", targetId: "aunt" },
  { text: "问问陈阿姨看见猫没", type: "talk", targetId: "aunt" },
  { text: "问问遛娃的邻居", type: "talk", targetId: "aunt" },
  { text: "问问快递员", type: "talk", targetId: "courier" },
  { text: "问问小吴刚才有没有听到动静", type: "talk", targetId: "courier" },
  // search
  { text: "仔细找找", type: "search" },
  { text: "搜一下这里", type: "search" },
  { text: "听听有没有声音", type: "search" },
  { text: "看看监控回放", type: "search" },
  { text: "四处找找看", type: "search" },
  // use
  { text: "用手电照照", type: "use", targetId: "flashlight" },
  { text: "打开纸箱看看", type: "use", targetId: "box" },
  { text: "打开那个箱子", type: "use", targetId: "box" },
  { text: "撒点猫粮", type: "use", targetId: "catFood" },
  // call
  { text: "喊年糕——", type: "call" },
  { text: "大声呼唤年糕的名字", type: "call" },
  { text: "喊猫的名字试试", type: "call" },
  // finish
  { text: "带年糕回家", type: "finish" },
  { text: "带它回家", type: "finish" },
  { text: "回家", type: "finish" },
  // 模糊指代/长句仍要落到正确意图
  { text: "我去问问那个穿红衣服的阿姨看她有没有看见猫", type: "talk", targetId: "aunt" },
  { text: "我想去绿化带那边仔细找找看有没有线索", type: "move", targetId: "greenbelt" },
  { text: "跟门卫老周聊聊", type: "talk", targetId: "guard" },
  // 无法归类,不应误判为其它意图
  { text: "", type: "unknown" },
  { text: "嗯……", type: "unknown" },
  { text: "今天天气不错", type: "unknown" },
  { text: "随便逛逛", type: "unknown" },
  { text: "我在想接下来该怎么办", type: "unknown" },
  { text: "asdkjaslkdj", type: "unknown" },
  { text: "算了", type: "unknown" },
];

describe("createKeywordIntentResolver — 表驱动用例", () => {
  const state = makeState();

  it.each(cases)("『$text』→ $type", ({ text, type, targetId }) => {
    const intent = resolver.resolve(text, state);
    expect(intent.type).toBe(type);
    if (targetId) {
      expect(intent.targetId).toBe(targetId);
    }
    expect(intent.rawText).toBe(text);
  });

  it("用例数量不少于 40 条,覆盖产品文档要求的口语多样性", () => {
    expect(cases.length).toBeGreaterThanOrEqual(40);
  });
});
