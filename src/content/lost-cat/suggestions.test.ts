import { describe, expect, it } from "vitest";
import { getSuggestedActions } from "./suggestions";
import { createInitialState, LOCATIONS } from "./module";
import type { GameState } from "@/engine/types";

function makeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), ...overrides };
}

describe("getSuggestedActions — 新手引导", () => {
  it("开局在单元楼下:建议问门卫", () => {
    expect(getSuggestedActions(makeState())).toContain("问问门卫");
  });

  it("已经问过门卫:建议去绿化带,不再重复建议问门卫", () => {
    const state = makeState({ triggeredEventIds: ["ask-guard"] });
    const suggestions = getSuggestedActions(state);

    expect(suggestions).toContain("去绿化带");
    expect(suggestions).not.toContain("问问门卫");
  });

  it("在绿化带、还没搜过:建议仔细找找", () => {
    const state = makeState({ currentLocationId: LOCATIONS.GREENBELT });
    expect(getSuggestedActions(state)).toContain("仔细找找");
  });

  it("在绿化带、搜过了但没问阿姨:建议问问陈阿姨", () => {
    const state = makeState({
      currentLocationId: LOCATIONS.GREENBELT,
      triggeredEventIds: ["search-greenbelt"],
    });
    expect(getSuggestedActions(state)).toContain("问问陈阿姨");
  });

  it("在物业、没手电:建议找找看", () => {
    const state = makeState({ currentLocationId: LOCATIONS.OFFICE });
    expect(getSuggestedActions(state)).toContain("找找看");
  });

  it("在物业、已有手电:建议去车库,不再建议找找看", () => {
    const state = makeState({
      currentLocationId: LOCATIONS.OFFICE,
      flags: { got_flashlight: true },
    });
    const suggestions = getSuggestedActions(state);

    expect(suggestions).toContain("去车库");
    expect(suggestions).not.toContain("找找看");
  });

  it("在车库、没手电:建议先去物业,而不是建议一个会被拒绝的搜证", () => {
    const state = makeState({ currentLocationId: LOCATIONS.GARAGE });
    const suggestions = getSuggestedActions(state);

    expect(suggestions).toContain("去物业");
    expect(suggestions).not.toContain("仔细找找");
  });

  it("在车库、有手电、还没听到猫叫:建议仔细找找", () => {
    const state = makeState({
      currentLocationId: LOCATIONS.GARAGE,
      flags: { got_flashlight: true },
    });
    expect(getSuggestedActions(state)).toContain("仔细找找");
  });

  it("在车库、已听到猫叫:建议去快递柜", () => {
    const state = makeState({
      currentLocationId: LOCATIONS.GARAGE,
      flags: { got_flashlight: true, heard_cat: true },
    });
    expect(getSuggestedActions(state)).toContain("去快递柜");
  });

  it("在快递柜、还没听到猫叫:不建议开箱(会被拒绝)", () => {
    const state = makeState({ currentLocationId: LOCATIONS.LOCKERS });
    expect(getSuggestedActions(state)).not.toContain("打开纸箱");
  });

  it("在快递柜、已听到猫叫:建议打开纸箱", () => {
    const state = makeState({
      currentLocationId: LOCATIONS.LOCKERS,
      flags: { heard_cat: true },
    });
    expect(getSuggestedActions(state)).toContain("打开纸箱");
  });

  it("亲近感已经是「已找到」:无论在哪都建议带年糕回家", () => {
    const state = makeState({ closeness: "已找到", currentLocationId: LOCATIONS.LOCKERS });
    expect(getSuggestedActions(state)).toEqual(["带年糕回家"]);
  });

  it("游戏已结束时不给建议(避免误导玩家继续操作)", () => {
    const state = makeState({ status: "won" });
    expect(getSuggestedActions(state)).toEqual([]);
  });

  it("建议数量不超过 2 条,避免选择过载", () => {
    for (const locationId of Object.values(LOCATIONS)) {
      const suggestions = getSuggestedActions(makeState({ currentLocationId: locationId }));
      expect(suggestions.length).toBeLessThanOrEqual(2);
    }
  });
});
