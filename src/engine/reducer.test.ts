import { describe, expect, it } from "vitest";
import { reduce } from "./reducer";
import type { EventCard, GameState, Intent } from "./types";

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

function makeIntent(overrides: Partial<Intent> = {}): Intent {
  return { type: "search", rawText: "仔细找找", ...overrides };
}

const askGuardCard: EventCard = {
  id: "ask-guard",
  intentType: "talk",
  targetId: "guard",
  effects: { clues: 1 },
  templateKeys: ["ask-guard-1"],
};

const garageWithoutFlashlight: EventCard = {
  id: "garage-search-dark",
  intentType: "search",
  locationId: "garage",
  requiresFlags: ["got_flashlight"],
  effects: { closeness: "很近" },
  templateKeys: ["garage-dark-1"],
};

const askGuardAgain: EventCard = {
  id: "ask-guard-repeat",
  intentType: "talk",
  targetId: "guard",
  repeatable: true,
  effects: {},
  templateKeys: ["ask-guard-repeat-1"],
};

describe("reduce — 基本分类", () => {
  it("unknown 意图不消耗行动次数", () => {
    const state = makeState();
    const result = reduce(state, makeIntent({ type: "unknown", rawText: "呃……" }), []);

    expect(result.outcome).toEqual({ kind: "unknown" });
    expect(result.nextState.actionsRemaining).toBe(12);
    expect(result.nextState.actionsTaken).toBe(0);
  });

  it("合法意图命中事件卡:应用效果并消耗行动", () => {
    const state = makeState();
    const result = reduce(
      state,
      makeIntent({ type: "talk", targetId: "guard", rawText: "问问门卫" }),
      [askGuardCard],
    );

    expect(result.outcome).toEqual({ kind: "triggered", eventId: "ask-guard" });
    expect(result.nextState.clues).toBe(1);
    expect(result.nextState.actionsRemaining).toBe(11);
    expect(result.nextState.triggeredEventIds).toContain("ask-guard");
  });

  it("地点不匹配的事件卡不会跨地点触发(即使 intentType 相同)", () => {
    // 玩家在 unit-entrance,garageWithoutFlashlight 要求 locationId === "garage"——
    // 覆盖率工具标出的两处 guard clause(matchesIntentShape 里的
    // locationId/targetId 判断)在此前的用例里从未真正被命中过。
    const state = makeState({ currentLocationId: "unit-entrance" });
    const result = reduce(state, makeIntent({ type: "search", rawText: "仔细找找" }), [
      garageWithoutFlashlight,
    ]);

    expect(result.outcome).toEqual({ kind: "noop" });
  });

  it("目标不匹配的事件卡不会对错误角色触发(即使 intentType 相同)", () => {
    const state = makeState();
    const result = reduce(
      state,
      makeIntent({ type: "talk", targetId: "aunt", rawText: "问问陈阿姨" }),
      [askGuardCard],
    );

    expect(result.outcome).toEqual({ kind: "noop" });
  });

  it("合法意图但没有匹配的事件卡:noop,仍消耗行动", () => {
    const state = makeState();
    const result = reduce(state, makeIntent({ type: "search", rawText: "找找" }), [askGuardCard]);

    expect(result.outcome).toEqual({ kind: "noop" });
    expect(result.nextState.actionsRemaining).toBe(11);
  });

  it("命中事件卡但前置旗帜不满足:rejected 带 eventId,仍消耗行动(时间照样在走)", () => {
    const state = makeState({ currentLocationId: "garage" });
    const result = reduce(state, makeIntent({ type: "search", rawText: "摸黑找找" }), [
      garageWithoutFlashlight,
    ]);

    expect(result.outcome).toEqual({ kind: "rejected", eventId: "garage-search-dark" });
    expect(result.nextState.actionsRemaining).toBe(11);
    expect(result.nextState.closeness).toBe("远");
  });

  it("事件卡可以设置旗帜(如借到手电),供后续行动的前置条件使用", () => {
    const state = makeState({ currentLocationId: "office" });
    const borrowFlashlight: EventCard = {
      id: "borrow-flashlight",
      intentType: "talk",
      targetId: "guard",
      locationId: "office",
      effects: { setFlags: ["got_flashlight"] },
      templateKeys: ["borrow-flashlight-1"],
    };

    const result = reduce(
      state,
      makeIntent({ type: "talk", targetId: "guard", rawText: "问门卫借手电" }),
      [borrowFlashlight],
    );

    expect(result.nextState.flags.got_flashlight).toBe(true);
  });

  it("满足前置旗帜后同一张卡可以正常触发", () => {
    const state = makeState({ currentLocationId: "garage", flags: { got_flashlight: true } });
    const result = reduce(state, makeIntent({ type: "search", rawText: "用手电照照" }), [
      garageWithoutFlashlight,
    ]);

    expect(result.outcome).toEqual({ kind: "triggered", eventId: "garage-search-dark" });
    expect(result.nextState.closeness).toBe("很近");
  });

  // 呼叫类事件需要按当前亲近感分档,不能无条件改写 closeness
  // (否则「已很近」时再喊一声会被降回「有动静」)。
  it("requiresCloseness 不匹配时不触发该卡,可落到后续 repeatable 卡", () => {
    const callBoost: EventCard = {
      id: "call-boost",
      intentType: "call",
      requiresCloseness: "远",
      effects: { closeness: "有动静" },
      templateKeys: ["call-boost-1"],
    };
    const callRepeat: EventCard = {
      id: "call-repeat",
      intentType: "call",
      repeatable: true,
      effects: {},
      templateKeys: ["call-repeat-1"],
    };

    const far = reduce(makeState({ closeness: "远" }), makeIntent({ type: "call", rawText: "喊年糕" }), [
      callBoost,
      callRepeat,
    ]);
    expect(far.outcome).toEqual({ kind: "triggered", eventId: "call-boost" });
    expect(far.nextState.closeness).toBe("有动静");

    const near = reduce(
      makeState({ closeness: "很近" }),
      makeIntent({ type: "call", rawText: "喊年糕" }),
      [callBoost, callRepeat],
    );
    expect(near.outcome).toEqual({ kind: "triggered", eventId: "call-repeat" });
    expect(near.nextState.closeness).toBe("很近");
  });
});

describe("reduce — move 不消耗行动", () => {
  it("移动到目标地点,不查事件卡、不消耗行动次数", () => {
    const state = makeState({ currentLocationId: "unit-entrance" });
    const result = reduce(state, makeIntent({ type: "move", targetId: "greenbelt", rawText: "去绿化带" }), []);

    expect(result.outcome).toEqual({ kind: "moved", locationId: "greenbelt" });
    expect(result.nextState.currentLocationId).toBe("greenbelt");
    expect(result.nextState.actionsRemaining).toBe(12);
    expect(result.nextState.sky).toBe("傍晚");
  });

  it("move 意图缺少 targetId(解析器异常兜底)时视为 unknown,不消耗行动", () => {
    const state = makeState();
    const result = reduce(state, makeIntent({ type: "move", targetId: undefined, rawText: "去那边" }), []);

    expect(result.outcome).toEqual({ kind: "unknown" });
    expect(result.nextState).toEqual(state);
  });
});

describe("reduce — 防刷规则", () => {
  it("同一张不可重复的事件卡不会二次触发同样的效果", () => {
    const alreadyTriggered = makeState({ triggeredEventIds: ["ask-guard"] });
    const result = reduce(
      alreadyTriggered,
      makeIntent({ type: "talk", targetId: "guard", rawText: "再问一次门卫" }),
      [askGuardCard],
    );

    // 没有可用的非重复卡命中,落到 noop,线索不会重复增加
    expect(result.outcome).toEqual({ kind: "noop" });
    expect(result.nextState.clues).toBe(0);
  });

  it("重复访问有专门的 repeatable 应付卡时,走该卡而不是 noop", () => {
    const alreadyTriggered = makeState({ triggeredEventIds: ["ask-guard"] });
    const result = reduce(
      alreadyTriggered,
      makeIntent({ type: "talk", targetId: "guard", rawText: "再问一次门卫" }),
      [askGuardCard, askGuardAgain],
    );

    expect(result.outcome).toEqual({ kind: "triggered", eventId: "ask-guard-repeat" });
  });
});

describe("reduce — finish 与终局", () => {
  it("closeness 已找到时执行 finish 判定为通关", () => {
    const state = makeState({ closeness: "已找到", actionsRemaining: 5 });
    const result = reduce(state, makeIntent({ type: "finish", rawText: "带年糕回家" }), []);

    expect(result.nextState.status).toBe("won");
  });

  it("closeness 未到已找到时执行 finish 不通关,视为 rejected", () => {
    const state = makeState({ closeness: "很近" });
    const result = reduce(state, makeIntent({ type: "finish", rawText: "回家" }), []);

    expect(result.outcome).toEqual({ kind: "rejected", eventId: "finish" });
    expect(result.nextState.status).toBe("playing");
  });

  it("最后一次行动同时满足通关条件时,判定为 won 而不是 lost(通关优先)", () => {
    const state = makeState({ closeness: "已找到", actionsRemaining: 1 });
    const result = reduce(state, makeIntent({ type: "finish", rawText: "带年糕回家" }), []);

    expect(result.nextState.actionsRemaining).toBe(0);
    expect(result.nextState.status).toBe("won");
  });

  it("行动次数耗尽后状态自动变为 lost", () => {
    const state = makeState({ actionsRemaining: 1 });
    const result = reduce(state, makeIntent({ type: "search", rawText: "再找找" }), []);

    expect(result.nextState.actionsRemaining).toBe(0);
    expect(result.nextState.status).toBe("lost");
  });

  it("游戏已结束(won/lost)时,再喂任何意图都不再变化状态", () => {
    const state = makeState({ status: "won" });
    const result = reduce(state, makeIntent({ type: "search", rawText: "还想再找找" }), []);

    expect(result.outcome).toEqual({ kind: "noop" });
    expect(result.nextState).toEqual(state);
  });
});
