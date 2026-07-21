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

describe("日制 day/phase", () => {
  it("启用 day 后,行动推进 早→晚→次日早,不改天色", () => {
    const morning = makeState({ day: 1, phase: "早", sky: "傍晚", actionsTaken: 0 });
    const evening = applyActionCost(morning);
    expect(evening).toMatchObject({ day: 1, phase: "晚", sky: "傍晚", actionsTaken: 1 });

    const nextMorning = applyActionCost(evening);
    expect(nextMorning).toMatchObject({ day: 2, phase: "早", sky: "傍晚", actionsTaken: 2 });
  });

  it("日制超过第 7 天判定失败,且不因 sky 天黑以外的天色失败", () => {
    expect(
      evaluateOutcome(makeState({ day: 7, phase: "晚", sky: "傍晚", actionsRemaining: 5 })),
    ).toBe("playing");
    expect(
      evaluateOutcome(makeState({ day: 8, phase: "早", sky: "傍晚", actionsRemaining: 5 })),
    ).toBe("lost");
  });

  it("日制下植物死亡旗帜直接失败", () => {
    expect(
      evaluateOutcome(
        makeState({ day: 3, phase: "早", sky: "傍晚", flags: { plant_dead: true } }),
      ),
    ).toBe("lost");
  });
});
