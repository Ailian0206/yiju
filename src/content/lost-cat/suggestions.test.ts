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

describe("getSuggestedActions — 候选下一步(展示由 policy 门控)", () => {
  it("开局建议问门卫", () => {
    expect(getSuggestedActions(makeState())).toEqual(["问问门卫"]);
  });

  it("问过门卫后建议去绿化带", () => {
    expect(
      getSuggestedActions(
        makeState({
          triggeredEventIds: ["ask-guard"],
          log: [playerLog("问问门卫")],
          clues: 1,
        }),
      ),
    ).toEqual(["去绿化带"]);
  });

  it("在绿化带尚未搜证时建议仔细找找", () => {
    expect(
      getSuggestedActions(
        makeState({
          triggeredEventIds: ["ask-guard"],
          currentLocationId: LOCATIONS.GREENBELT,
          log: [playerLog("去绿化带")],
        }),
      ),
    ).toEqual(["仔细找找"]);
  });

  it("已有手电时建议去车库", () => {
    expect(
      getSuggestedActions(
        makeState({
          triggeredEventIds: ["ask-guard", "search-greenbelt", "talk-aunt", "search-office-flashlight"],
          flags: { got_flashlight: true },
          log: [playerLog("找找看")],
        }),
      ),
    ).toEqual(["去车库"]);
  });

  it("听见猫后建议去快递柜开箱", () => {
    expect(
      getSuggestedActions(
        makeState({
          triggeredEventIds: ["ask-guard", "search-greenbelt", "search-garage-with-flashlight"],
          flags: { got_flashlight: true, heard_cat: true },
          log: [playerLog("仔细找找")],
        }),
      ),
    ).toEqual(["去快递柜"]);
  });

  it("亲近感已找到时建议带回家", () => {
    expect(
      getSuggestedActions(
        makeState({
          closeness: "已找到",
          currentLocationId: LOCATIONS.LOCKERS,
          log: [playerLog("打开纸箱")],
        }),
      ),
    ).toEqual(["带年糕回家"]);
  });

  it("游戏结束不给建议", () => {
    expect(getSuggestedActions(makeState({ status: "won", log: [playerLog("带年糕回家")] }))).toEqual(
      [],
    );
  });
});
