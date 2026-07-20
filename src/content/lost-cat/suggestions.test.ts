import { describe, expect, it } from "vitest";
import { getSuggestedActions } from "./suggestions";
import { createInitialState, LOCATIONS } from "./module";
import type { GameState, LogEntry } from "@/engine/types";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), ...overrides };
}

function playerLog(text: string): LogEntry {
  return { id: `p-${text}`, kind: "player", text };
}

describe("getSuggestedActions — 开局轻引导(不可通关点击)", () => {
  it("开局、尚未行动:建议问门卫", () => {
    expect(getSuggestedActions(makeState())).toEqual(["问问门卫"]);
  });

  it("玩家已经有过任意输入后:不再给建议,避免一路点提示通关", () => {
    const state = makeState({
      log: [playerLog("随便试试")],
      currentLocationId: LOCATIONS.GREENBELT,
    });
    expect(getSuggestedActions(state)).toEqual([]);
  });

  it("问过门卫后即使还在楼下:也不再建议去绿化带", () => {
    const state = makeState({
      triggeredEventIds: ["ask-guard"],
      log: [playerLog("问问门卫")],
      clues: 1,
    });
    expect(getSuggestedActions(state)).toEqual([]);
  });

  it("中盘各关键地点都不再弹出最优下一步", () => {
    const midgame = [
      makeState({
        currentLocationId: LOCATIONS.GREENBELT,
        log: [playerLog("去绿化带")],
      }),
      makeState({
        currentLocationId: LOCATIONS.OFFICE,
        log: [playerLog("去物业")],
      }),
      makeState({
        currentLocationId: LOCATIONS.GARAGE,
        flags: { got_flashlight: true },
        log: [playerLog("去车库")],
      }),
      makeState({
        currentLocationId: LOCATIONS.LOCKERS,
        flags: { heard_cat: true },
        log: [playerLog("去快递柜")],
      }),
    ];

    for (const state of midgame) {
      expect(getSuggestedActions(state)).toEqual([]);
    }
  });

  it("亲近感已经是「已找到」:仍建议带年糕回家(结局动作,不是探路)", () => {
    const state = makeState({
      closeness: "已找到",
      currentLocationId: LOCATIONS.LOCKERS,
      log: [playerLog("打开纸箱")],
    });
    expect(getSuggestedActions(state)).toEqual(["带年糕回家"]);
  });

  it("游戏已结束时不给建议", () => {
    expect(getSuggestedActions(makeState({ status: "won", log: [playerLog("带年糕回家")] }))).toEqual(
      [],
    );
  });

  it("开局建议数量不超过 1 条", () => {
    expect(getSuggestedActions(makeState()).length).toBeLessThanOrEqual(1);
  });
});
