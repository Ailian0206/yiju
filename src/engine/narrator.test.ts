import { describe, expect, it, vi } from "vitest";
import { createTemplatePoolNarrator } from "./narrator";
import type { GameState } from "./types";

function makeState(overrides: Partial<GameState> = {}): GameState {
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
    ...overrides,
  };
}

const templates: Record<string, string> = {
  "ask-guard-1": "老周说往绿化带去了。",
  "ask-guard-2": "老周指了指绿化带。",
  "unknown-1": "你想了想,没想好。",
  "noop-1": "这里没什么特别的。",
  "rejected-generic-1": "现在还不是时候。",
  "garage-rejected-1": "太黑了,什么都看不清。",
  "arrive-greenbelt-1": "你走进了绿化带。",
};

describe("createTemplatePoolNarrator", () => {
  const narrator = createTemplatePoolNarrator({
    templates,
    eventTemplateKeys: { "ask-guard": ["ask-guard-1", "ask-guard-2"] },
    rejectedTemplateKeys: { "garage-search": ["garage-rejected-1"] },
    fallback: { unknown: ["unknown-1"], noop: ["noop-1"], rejected: ["rejected-generic-1"] },
    arrivalTemplateKeys: { greenbelt: ["arrive-greenbelt-1"] },
  });

  it("triggered:从该事件的模板池里选一条", () => {
    const text = narrator.narrate({ kind: "triggered", eventId: "ask-guard" }, makeState());
    expect(["老周说往绿化带去了。", "老周指了指绿化带。"]).toContain(text);
  });

  it("triggered:未知 eventId(内容缺失模板)有兜底,不抛异常", () => {
    const text = narrator.narrate({ kind: "triggered", eventId: "no-such-event" }, makeState());
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("rejected:有专门模板的 eventId 用专门文案", () => {
    const text = narrator.narrate({ kind: "rejected", eventId: "garage-search" }, makeState());
    expect(text).toBe("太黑了,什么都看不清。");
  });

  it("rejected:没有专门模板的 eventId 落到通用兜底", () => {
    const text = narrator.narrate({ kind: "rejected", eventId: "finish" }, makeState());
    expect(text).toBe("现在还不是时候。");
  });

  it("unknown:走通用兜底", () => {
    const text = narrator.narrate({ kind: "unknown" }, makeState());
    expect(text).toBe("你想了想,没想好。");
  });

  it("noop:走通用兜底", () => {
    const text = narrator.narrate({ kind: "noop" }, makeState());
    expect(text).toBe("这里没什么特别的。");
  });

  it("moved:有专门到达文案的地点用专门文案", () => {
    const text = narrator.narrate({ kind: "moved", locationId: "greenbelt" }, makeState());
    expect(text).toBe("你走进了绿化带。");
  });

  it("moved:没有专门到达文案的地点有通用兜底,不抛异常", () => {
    const text = narrator.narrate({ kind: "moved", locationId: "nowhere" }, makeState());
    expect(typeof text).toBe("string");
    expect(text.length).toBeGreaterThan(0);
  });

  it("随机选择是均匀分布的(用固定种子式 mock 验证两条都可能选到)", () => {
    const spy = vi.spyOn(Math, "random");
    spy.mockReturnValueOnce(0);
    const first = narrator.narrate({ kind: "triggered", eventId: "ask-guard" }, makeState());
    spy.mockReturnValueOnce(0.99);
    const second = narrator.narrate({ kind: "triggered", eventId: "ask-guard" }, makeState());
    spy.mockRestore();

    expect(first).toBe("老周说往绿化带去了。");
    expect(second).toBe("老周指了指绿化带。");
  });
});
