import { createKeywordIntentResolver, findVocabularyAmbiguities } from "@/engine/intent";
import { reduce } from "@/engine/reducer";
import { describe, expect, it } from "vitest";
import { blindDateEvents } from "./events";
import { blindDateVocabulary } from "./lexicon";
import { createInitialState } from "./module";
import { blindDateTemplates } from "./templates";

function playSession(inputs: string[]) {
  const resolver = createKeywordIntentResolver(blindDateVocabulary);
  let state = createInitialState();
  for (const text of inputs) {
    const intent = resolver.resolve(text, state);
    state = reduce(state, intent, blindDateEvents).nextState;
  }
  return state;
}

describe("blind-date 内容完整性", () => {
  it("事件卡模板齐全且词表无歧义", () => {
    for (const card of blindDateEvents) {
      expect(card.templateKeys.length).toBeGreaterThan(0);
      for (const key of card.templateKeys) {
        expect(blindDateTemplates[key], `缺失模板:${key}`).toBeDefined();
      }
    }
    expect(findVocabularyAmbiguities(blindDateVocabulary)).toEqual([]);
  });
});

describe("blind-date 通关与失败", () => {
  it("最短通关序列能体面收场", () => {
    const state = playSession([
      "跟对方打招呼",
      "敬酒",
      "聊聊工作话题",
      "请介绍人少催",
      "体面收场",
    ]);
    expect(state.status).toBe("won");
    expect(state.closeness).toBe("已找到");
  });

  it("气氛未到就想收场会被拒绝", () => {
    const state = playSession(["跟对方打招呼", "体面收场"]);
    expect(state.status).toBe("playing");
  });

  it("只会喊服务员耗尽进度会翻车", () => {
    const state = playSession(Array(9).fill("叫服务员"));
    expect(state.status).toBe("lost");
  });
});
