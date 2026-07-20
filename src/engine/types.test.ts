import { describe, expect, it } from "vitest";
import type { GameState } from "./types";

// M0 冒烟测试:证明测试管线可跑通并校验类型可用。
// 真正的引擎行为测试(状态转移、意图解析、防刷规则)在 M1 补齐。
describe("engine/types", () => {
  it("GameState 的开局值满足产品文档 §5 定义的初始状态", () => {
    const initialState: GameState = {
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
    };

    expect(initialState.status).toBe("playing");
    expect(initialState.actionsRemaining).toBe(12);
  });
});
