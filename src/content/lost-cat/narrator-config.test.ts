import { describe, expect, it } from "vitest";
import { createLostCatNarrator, lostCatNarrator, lostCatNarratorConfig } from "./narrator-config";
import { lostCatEvents } from "./events";
import { LOCATIONS } from "./module";
import type { GameState, Narrator } from "@/engine/types";

const baseState: GameState = {
  status: "playing",
  sky: "傍晚",
  clues: 0,
  closeness: "远",
  actionsRemaining: 12,
  actionsTaken: 0,
  currentLocationId: LOCATIONS.UNIT_ENTRANCE,
  flags: {},
  triggeredEventIds: [],
  log: [],
};

// "finish" 是引擎在 resolveFinish 里合成的 eventId,不对应任何一张
// EventCard——这类"游戏逻辑自己造出来的 id"最容易在内容层被漏掉,
// 之前就因为这个漏了 triggered:finish 的文案,在浏览器里手测才发现。
const SYNTHETIC_EVENT_IDS = ["finish"];
const ALL_TRIGGERED_EVENT_IDS = [...lostCatEvents.map((card) => card.id), ...SYNTHETIC_EVENT_IDS];

describe("找猫模组 narrator 接线(P0 纯模板池行为)", () => {
  it("每张事件卡的 id 在 eventTemplateKeys 里都能查到自己的模板", () => {
    for (const card of lostCatEvents) {
      expect(lostCatNarratorConfig.eventTemplateKeys[card.id]).toEqual(card.templateKeys);
    }
  });

  it("每个地点都有到达文案,不会在移动时掉进沉默兜底", () => {
    for (const locationId of Object.values(LOCATIONS)) {
      expect(lostCatNarratorConfig.arrivalTemplateKeys[locationId]?.length).toBeGreaterThan(0);
    }
  });

  it("narrate 对每个可能的 triggered eventId(含引擎合成的 finish)都给出真实文案", async () => {
    for (const eventId of ALL_TRIGGERED_EVENT_IDS) {
      const text = await lostCatNarrator.narrate({ kind: "triggered", eventId }, baseState, "");
      expect(text, `eventId=${eventId}`).not.toContain("这里似乎还没有对应的叙述文案");
    }
  });

  it("narrate 对已知的 rejected eventId 都给出真实文案", async () => {
    for (const eventId of Object.keys(lostCatNarratorConfig.rejectedTemplateKeys)) {
      const text = await lostCatNarrator.narrate({ kind: "rejected", eventId }, baseState, "");
      expect(text, `eventId=${eventId}`).not.toContain("这里似乎还没有对应的叙述文案");
    }
  });

  it("narrate 对 unknown/noop/未知地点的 moved 都有兜底文案,不抛异常", async () => {
    expect((await lostCatNarrator.narrate({ kind: "unknown" }, baseState, "")).length).toBeGreaterThan(0);
    expect((await lostCatNarrator.narrate({ kind: "noop" }, baseState, "")).length).toBeGreaterThan(0);
    expect(
      (await lostCatNarrator.narrate({ kind: "rejected", eventId: "never-defined" }, baseState, "")).length,
    ).toBeGreaterThan(0);
  });
});

describe("createLostCatNarrator — 混合路由(P1)", () => {
  function makeFakeLLM(response: string | Error): { narrator: Narrator; calls: number[] } {
    const calls: number[] = [];
    const narrator: Narrator = {
      async narrate() {
        calls.push(Date.now());
        if (response instanceof Error) throw response;
        return response;
      },
    };
    return { narrator, calls };
  }

  it("filler 场景(unknown/noop/无专属文案的 rejected)优先走 LLM", async () => {
    const { narrator: llm, calls } = makeFakeLLM("LLM 生成的文本");
    const narrator = createLostCatNarrator({ llmNarrator: llm });

    const text = await narrator.narrate({ kind: "unknown" }, baseState, "随便打点什么");

    expect(text).toBe("LLM 生成的文本");
    expect(calls.length).toBe(1);
  });

  it("非 filler 场景(triggered、有专属文案的 rejected)不走 LLM,省调用次数", async () => {
    const { narrator: llm, calls } = makeFakeLLM("LLM 生成的文本");
    const narrator = createLostCatNarrator({ llmNarrator: llm });

    await narrator.narrate({ kind: "triggered", eventId: "ask-guard" }, baseState, "问问门卫");
    await narrator.narrate(
      { kind: "rejected", eventId: "search-garage-with-flashlight" },
      baseState,
      "仔细找找",
    );

    expect(calls.length).toBe(0);
  });

  it("LLM 调用失败时静默回落模板,不抛异常、不中断游戏", async () => {
    const { narrator: llm } = makeFakeLLM(new Error("network error"));
    const narrator = createLostCatNarrator({ llmNarrator: llm });

    const text = await narrator.narrate({ kind: "noop" }, baseState, "乱打的话");

    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("超过每局调用上限后,即使是 filler 场景也回落模板,不再调用 LLM", async () => {
    const { narrator: llm, calls } = makeFakeLLM("LLM 生成的文本");
    const narrator = createLostCatNarrator({ llmNarrator: llm, maxCallsPerSession: 2 });

    await narrator.narrate({ kind: "unknown" }, baseState, "1");
    await narrator.narrate({ kind: "unknown" }, baseState, "2");
    const thirdText = await narrator.narrate({ kind: "unknown" }, baseState, "3");

    expect(calls.length).toBe(2);
    expect(thirdText).not.toBe("LLM 生成的文本");
  });

  it("不传 llmNarrator 时行为等价于纯模板池(向后兼容)", async () => {
    const narrator = createLostCatNarrator();
    const text = await narrator.narrate({ kind: "unknown" }, baseState, "");
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });
});
