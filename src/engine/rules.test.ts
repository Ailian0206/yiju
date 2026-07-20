import { describe, expect, it } from "vitest";
import { applyActionCost, evaluateOutcome, skyPhaseForActionsTaken } from "./rules";
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

describe("skyPhaseForActionsTaken", () => {
  it("每 3 次行动推进一档", () => {
    expect(skyPhaseForActionsTaken(0)).toBe("傍晚");
    expect(skyPhaseForActionsTaken(2)).toBe("傍晚");
    expect(skyPhaseForActionsTaken(3)).toBe("黄昏");
    expect(skyPhaseForActionsTaken(5)).toBe("黄昏");
    expect(skyPhaseForActionsTaken(6)).toBe("擦黑");
    expect(skyPhaseForActionsTaken(9)).toBe("天黑");
  });

  it("超过天黑档位的行动次数不再继续推进(封顶)", () => {
    expect(skyPhaseForActionsTaken(20)).toBe("天黑");
  });
});

describe("applyActionCost", () => {
  it("扣除一次剩余行动并推进天色", () => {
    const state = makeState({ actionsTaken: 2, actionsRemaining: 10 });
    const next = applyActionCost(state);

    expect(next.actionsTaken).toBe(3);
    expect(next.actionsRemaining).toBe(9);
    expect(next.sky).toBe("黄昏");
  });

  it("剩余行动次数不会扣成负数", () => {
    const state = makeState({ actionsTaken: 12, actionsRemaining: 0 });
    const next = applyActionCost(state);

    expect(next.actionsRemaining).toBe(0);
  });

  it("不修改传入的原状态对象(不可变)", () => {
    const state = makeState();
    const snapshot = { ...state };
    applyActionCost(state);

    expect(state).toEqual(snapshot);
  });
});

describe("evaluateOutcome", () => {
  it("天黑仍未通关判定为失败", () => {
    const state = makeState({ sky: "天黑", actionsRemaining: 3 });
    expect(evaluateOutcome(state)).toBe("lost");
  });

  it("行动次数用尽判定为失败", () => {
    const state = makeState({ sky: "擦黑", actionsRemaining: 0 });
    expect(evaluateOutcome(state)).toBe("lost");
  });

  it("天色未到天黑且还有行动次数则继续游戏", () => {
    const state = makeState({ sky: "擦黑", actionsRemaining: 2 });
    expect(evaluateOutcome(state)).toBe("playing");
  });

  it("已经是 won/lost 的状态不会被覆盖(终局状态是终态)", () => {
    const wonState = makeState({ status: "won", sky: "天黑", actionsRemaining: 0 });
    expect(evaluateOutcome(wonState)).toBe("won");
  });
});
