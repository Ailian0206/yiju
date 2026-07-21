import { createKeywordIntentResolver, findVocabularyAmbiguities } from "@/engine/intent";
import { reduce } from "@/engine/reducer";
import { describe, expect, it } from "vitest";
import { chunyunEvents } from "./events";
import { chunyunVocabulary } from "./lexicon";
import { createInitialState } from "./module";
import { chunyunTemplates } from "./templates";

function playSession(inputs: string[]) {
  const resolver = createKeywordIntentResolver(chunyunVocabulary);
  let state = createInitialState();
  for (const text of inputs) {
    state = reduce(state, resolver.resolve(text, state), chunyunEvents).nextState;
  }
  return state;
}

describe("chunyun", () => {
  it("模板与词表完整", () => {
    for (const card of chunyunEvents) {
      for (const key of card.templateKeys) expect(chunyunTemplates[key]).toBeDefined();
    }
    expect(findVocabularyAmbiguities(chunyunVocabulary)).toEqual([]);
  });

  it("最短通关", () => {
    const state = playSession([
      "刷新购票页",
      "问问家人",
      "换个车次",
      "候补抢票",
      "确认购票",
    ]);
    expect(state.status).toBe("won");
  });

  it("未锁票不能回家", () => {
    expect(playSession(["刷新购票页", "确认购票"]).status).toBe("playing");
  });

  it("只盯屏幕会失败", () => {
    expect(playSession(Array(9).fill("盯着屏幕")).status).toBe("lost");
  });
});
