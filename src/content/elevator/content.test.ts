import { createKeywordIntentResolver } from "@/engine/intent";
import { reduce } from "@/engine/reducer";
import { findVocabularyAmbiguities } from "@/engine/intent";
import { describe, expect, it } from "vitest";
import { elevatorEvents } from "./events";
import { elevatorVocabulary } from "./lexicon";
import { createInitialState } from "./module";
import { elevatorTemplates } from "./templates";

function playSession(inputs: string[]) {
  const resolver = createKeywordIntentResolver(elevatorVocabulary);
  let state = createInitialState();
  for (const text of inputs) {
    const intent = resolver.resolve(text, state);
    state = reduce(state, intent, elevatorEvents).nextState;
  }
  return state;
}

describe("elevator 内容完整性", () => {
  it("每张事件卡至少有一条模板,且模板表里都有对应文案", () => {
    for (const card of elevatorEvents) {
      expect(card.templateKeys.length).toBeGreaterThan(0);
      for (const key of card.templateKeys) {
        expect(elevatorTemplates[key], `缺失模板:${key}`).toBeDefined();
      }
    }
  });

  it("词表无跨类别子串歧义", () => {
    expect(findVocabularyAmbiguities(elevatorVocabulary)).toEqual([]);
  });
});

describe("elevator 通关与失败", () => {
  it("最短通关序列能安全出梯", () => {
    const state = playSession([
      "安抚老太太",
      "按报警铃",
      "问问白领",
      "检查面板",
      "用对讲机",
      "走出电梯",
    ]);
    expect(state.status).toBe("won");
    expect(state.closeness).toBe("已找到");
    expect(state.flags.alarm_on).toBe(true);
    expect(state.flags.panel_checked).toBe(true);
  });

  it("未接通对讲就想出梯会被拒绝且仍在玩", () => {
    const state = playSession(["安抚老太太", "走出电梯"]);
    expect(state.status).toBe("playing");
    expect(state.closeness).not.toBe("已找到");
  });

  it("只喊救命耗尽时段会失败", () => {
    const state = playSession(Array(9).fill("大声喊救命"));
    expect(state.status).toBe("lost");
  });

  it("面板检查后再搜索不会回落到太早文案事件", () => {
    const state = playSession(["安抚老太太", "按报警铃", "检查面板", "检查一下"]);
    expect(state.triggeredEventIds).toContain("check-panel");
    expect(state.flags.panel_checked).toBe(true);
    // 重复搜索走 check-panel-repeat,不会再触发误导性的 too-early 卡
    expect(state.triggeredEventIds).not.toContain("check-panel-too-early");
  });
});
