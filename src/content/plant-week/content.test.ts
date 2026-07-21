import { createKeywordIntentResolver, findVocabularyAmbiguities } from "@/engine/intent";
import { reduce } from "@/engine/reducer";
import { describe, expect, it } from "vitest";
import { plantWeekEvents } from "./events";
import { plantWeekVocabulary } from "./lexicon";
import { createInitialState } from "./module";
import { plantWeekTemplates } from "./templates";

function playSession(inputs: string[]) {
  const resolver = createKeywordIntentResolver(plantWeekVocabulary);
  let state = createInitialState();
  for (const text of inputs) {
    state = reduce(state, resolver.resolve(text, state), plantWeekEvents).nextState;
  }
  return state;
}

const WIN_PATH = [
  "浇水",
  "去阳台",
  "晒太阳",
  "施肥",
  "回客厅",
  "浇水",
  "观察植物",
  "交还给朋友",
];

describe("plant-week", () => {
  it("模板与词表完整", () => {
    for (const card of plantWeekEvents) {
      for (const key of card.templateKeys) expect(plantWeekTemplates[key]).toBeDefined();
    }
    expect(findVocabularyAmbiguities(plantWeekVocabulary)).toEqual([]);
  });

  it("开局启用日制", () => {
    const state = createInitialState();
    expect(state.day).toBe(1);
    expect(state.phase).toBe("早");
  });

  it("最短通关", () => {
    const state = playSession(WIN_PATH);
    expect(state.status).toBe("won");
    expect(state.day).toBeLessThanOrEqual(7);
  });

  it("未健康不能交还", () => {
    expect(playSession(["浇水", "交还给朋友"]).status).toBe("playing");
  });

  it("一路偷懒会拖过一周失败", () => {
    expect(playSession(Array(14).fill("偷懒")).status).toBe("lost");
  });
});
