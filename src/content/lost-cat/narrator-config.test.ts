import { describe, expect, it } from "vitest";
import { lostCatNarrator, lostCatNarratorConfig } from "./narrator-config";
import { lostCatEvents } from "./events";
import { LOCATIONS } from "./module";
import type { GameState } from "@/engine/types";

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

describe("找猫模组 narrator 接线", () => {
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

  it("narrate 对每个可能的 triggered eventId(含引擎合成的 finish)都给出真实文案", () => {
    for (const eventId of ALL_TRIGGERED_EVENT_IDS) {
      const text = lostCatNarrator.narrate({ kind: "triggered", eventId }, baseState);
      expect(text, `eventId=${eventId}`).not.toContain("这里似乎还没有对应的叙述文案");
    }
  });

  it("narrate 对已知的 rejected eventId 都给出真实文案", () => {
    for (const eventId of Object.keys(lostCatNarratorConfig.rejectedTemplateKeys)) {
      const text = lostCatNarrator.narrate({ kind: "rejected", eventId }, baseState);
      expect(text, `eventId=${eventId}`).not.toContain("这里似乎还没有对应的叙述文案");
    }
  });

  it("narrate 对 unknown/noop/未知地点的 moved 都有兜底文案,不抛异常", () => {
    expect(lostCatNarrator.narrate({ kind: "unknown" }, baseState).length).toBeGreaterThan(0);
    expect(lostCatNarrator.narrate({ kind: "noop" }, baseState).length).toBeGreaterThan(0);
    expect(
      lostCatNarrator.narrate({ kind: "rejected", eventId: "never-defined" }, baseState).length,
    ).toBeGreaterThan(0);
  });
});
