import { describe, expect, it } from "vitest";
import { createKeywordIntentResolver, findVocabularyAmbiguities } from "@/engine/intent";
import { reduce } from "@/engine/reducer";
import type { GameState } from "@/engine/types";
import { lostCatEvents } from "./events";
import { lostCatVocabulary } from "./lexicon";
import { createInitialState } from "./module";
import { lostCatTemplates } from "./templates";

// 内容完整性校验:M2 checklist 要求"每事件 ≥2 套模板",且事件卡引用的
// templateKey 必须在模板池里真实存在——拼错 key 这种低级错误应该在测试
// 阶段就暴露,而不是等玩家触发到才发现叙述缺失。
describe("找猫模组内容完整性", () => {
  it("每张事件卡至少有 2 条叙述模板", () => {
    for (const card of lostCatEvents) {
      expect(card.templateKeys.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("事件卡引用的每个 templateKey 在模板池中都存在", () => {
    for (const card of lostCatEvents) {
      for (const key of card.templateKeys) {
        expect(lostCatTemplates[key], `缺失模板:${key}`).toBeDefined();
      }
    }
  });

  it("词表没有跨类别的子串歧义", () => {
    expect(findVocabularyAmbiguities(lostCatVocabulary)).toEqual([]);
  });
});

// 用真实词表把一整局"喂"给引擎:玩家只输入自然语言,resolver 解析、
// reduce 推进状态——这条测试同时验证内容数据和引擎接线是否正确,
// 是产品文档 §9 成功标准 3(能稳定打出一次通关)的自动化版本。
function playSession(inputs: readonly string[]): GameState {
  const resolver = createKeywordIntentResolver(lostCatVocabulary);
  let state = createInitialState();

  for (const text of inputs) {
    const intent = resolver.resolve(text, state);
    state = reduce(state, intent, lostCatEvents).nextState;
  }

  return state;
}

describe("找猫模组 — 最优通关序列", () => {
  it("按最优路径操作,能在预算内通关(产品文档 §4.5:8-12 次有效行动)", () => {
    const finalState = playSession([
      "问问门卫", // talk guard:clues 1,-1 action
      "去绿化带", // move,免费
      "仔细找找", // search greenbelt:clues 2,closeness 有动静,-1 action
      "问问陈阿姨", // talk aunt:clues 3,-1 action
      "去物业", // move,免费
      "找找看", // search office:拿到手电,-1 action
      "去车库", // move,免费
      "仔细找找", // search garage(已有手电):closeness 很近,-1 action
      "去快递柜", // move,免费
      "问问小吴", // talk courier:clues 4,-1 action
      "打开纸箱", // use box:closeness 已找到,-1 action
      "带年糕回家", // finish:通关,-1 action
    ]);

    expect(finalState.status).toBe("won");
    expect(finalState.closeness).toBe("已找到");
    // 断言关键 flag/线索确实是"沿路径拿到的",不是巧合通过——
    // 否则这条测试测不出 use-box 缺 requiresFlags 这类跳关 bug。
    expect(finalState.flags.got_flashlight).toBe(true);
    expect(finalState.flags.heard_cat).toBe(true);
    expect(finalState.clues).toBe(4);
    // 8 次消耗行动的交互(4 次免费移动不计入),剩 4 次容错空间,
    // 对应产品文档"12 次配额允许 4-6 次走弯路"。
    expect(finalState.actionsRemaining).toBe(4);
  });

  it("courier 线索非强制:不问小吴直接开箱也能通关(线索引导玩法,非硬性解谜门禁)", () => {
    const finalState = playSession([
      "问问门卫",
      "去绿化带",
      "仔细找找",
      "问问陈阿姨",
      "去物业",
      "找找看",
      "去车库",
      "仔细找找",
      "去快递柜",
      "打开纸箱",
      "带年糕回家",
    ]);

    expect(finalState.status).toBe("won");
    expect(finalState.flags.heard_cat).toBe(true);
    expect(finalState.clues).toBe(3);
  });

  it("「用手电照照」这种直接提物品名的说法也能触发车库事件(不是只有「仔细找找」才行)", () => {
    // 回归用例:intent 解析优先级里 use 排在 search 前面,提到"手电"二字
    // 会被解析成 use 意图——车库/物业亭都需要各自的 use 版事件卡兜住,
    // 否则这句产品文档自己举例的话在游戏里会是个哑动作。
    const finalState = playSession([
      "问问门卫",
      "去绿化带",
      "仔细找找",
      "去物业",
      "用手电", // use(flashlight)@office,而不是 search
      "去车库",
      "用手电照照", // use(flashlight)@garage,而不是 search
      "去快递柜",
      "打开纸箱",
      "带年糕回家",
    ]);

    expect(finalState.status).toBe("won");
    expect(finalState.flags.got_flashlight).toBe(true);
    expect(finalState.flags.heard_cat).toBe(true);
  });
});

describe("找猫模组 — 跳关应该失败", () => {
  it("没去车库、没听见猫叫,直接开箱不能通关(纸箱不是从开局就能开)", () => {
    const finalState = playSession(["去快递柜", "打开纸箱", "带年糕回家"]);

    expect(finalState.status).toBe("playing");
    expect(finalState.closeness).toBe("远");
    expect(finalState.flags.cat_in_box).toBeUndefined();
  });

  it("有手电但还没在车库听见猫叫,开箱依然被拒绝", () => {
    const finalState = playSession([
      "去物业",
      "找找看", // 拿到手电,但还没去车库触发 heard_cat
      "去快递柜",
      "打开纸箱",
    ]);

    expect(finalState.closeness).toBe("远");
    expect(finalState.flags.cat_in_box).toBeUndefined();
  });
});

describe("找猫模组 — 呼叫", () => {
  it("亲近感为远时首次呼喊会提升到有动静,并消耗行动", () => {
    const state = playSession(["喊年糕"]);

    expect(state.closeness).toBe("有动静");
    expect(state.actionsRemaining).toBe(11);
    expect(state.triggeredEventIds).toContain("call-name-distant");
  });

  it("亲近感已过远时再呼喊走 repeat 卡,不会把亲近感降回去", () => {
    const state = playSession(["去绿化带", "仔细找找", "喊年糕"]);
    // 绿化带搜证已把亲近感提到有动静;再喊不应改档、也不应命中 distant 卡
    expect(state.closeness).toBe("有动静");
    expect(state.triggeredEventIds).not.toContain("call-name-distant");
  });
});

describe("找猫模组 — 必败序列", () => {
  it("只做呼喊而不推进线索,天黑后判定失败(首次呼喊仍可提一档亲近感)", () => {
    const finalState = playSession([
      "喊年糕",
      "喊年糕",
      "喊年糕",
      "喊年糕",
      "喊年糕",
      "喊年糕",
      "喊年糕",
      "喊年糕",
      "喊年糕",
    ]);

    expect(finalState.status).toBe("lost");
    expect(finalState.sky).toBe("天黑");
    // 产品文档 §6:喊名字可提一档;纯呼喊仍找不到猫,通关不了
    expect(finalState.closeness).toBe("有动静");
  });

  it("失败后继续输入不会让游戏复活或状态异常变化", () => {
    const lostState = playSession(Array(9).fill("喊年糕"));
    const afterMore = playSession([...Array(9).fill("喊年糕"), "带年糕回家"]);

    expect(lostState.status).toBe("lost");
    expect(afterMore.status).toBe("lost");
  });
});
