// 规则引擎:天色推进、行动扣除、胜负判定。这些是产品文档 §4 明确规定
// "不交给模型自由发挥"的部分,必须是纯函数、可单测、可回归。
import type { DayPhase, GameState, SkyPhase } from "./types";

const SKY_SEQUENCE: SkyPhase[] = ["傍晚", "黄昏", "擦黑", "天黑"];
const ACTIONS_PER_SKY_PHASE = 3;
/** 日制模组默认一周天数;超过后未通关即失败。 */
export const DAY_MODE_MAX_DAY = 7;

/** 根据已用行动次数计算天色档位。每 3 次行动推进一档,到「天黑」后不再继续推进。 */
export function skyPhaseForActionsTaken(actionsTaken: number): SkyPhase {
  const index = Math.min(
    SKY_SEQUENCE.length - 1,
    Math.floor(actionsTaken / ACTIONS_PER_SKY_PHASE),
  );
  return SKY_SEQUENCE[index];
}

/** 日制:早→晚;晚→次日早。 */
export function advanceDayPhase(
  day: number,
  phase: DayPhase,
): { day: number; phase: DayPhase } {
  if (phase === "早") {
    return { day, phase: "晚" };
  }
  return { day: day + 1, phase: "早" };
}

/** 消耗一次行动:扣剩余次数;经典模式推进天色,日制模式推进 day/phase。 */
export function applyActionCost(state: GameState): GameState {
  const actionsTaken = state.actionsTaken + 1;
  const actionsRemaining = Math.max(0, state.actionsRemaining - 1);

  // 日制:有 day 字段时不推天色,改推早晚与天数。
  if (state.day !== undefined) {
    const currentPhase: DayPhase = state.phase ?? "早";
    const next = advanceDayPhase(state.day, currentPhase);
    return {
      ...state,
      actionsTaken,
      actionsRemaining,
      day: next.day,
      phase: next.phase,
    };
  }

  return {
    ...state,
    actionsTaken,
    actionsRemaining,
    sky: skyPhaseForActionsTaken(actionsTaken),
  };
}

/**
 * 失败判定。通关(won)由 reducer 在 finish 命中「已找到」时显式设置。
 * 日制:超过第 7 天、行动用尽、或 plant_dead 旗帜 → 失败;不看天色。
 * 经典:天黑或行动用尽 → 失败。
 */
export function evaluateOutcome(state: GameState): GameState["status"] {
  if (state.status !== "playing") {
    return state.status;
  }

  if (state.day !== undefined) {
    if (state.flags.plant_dead) {
      return "lost";
    }
    if (state.day > DAY_MODE_MAX_DAY || state.actionsRemaining <= 0) {
      return "lost";
    }
    return "playing";
  }

  if (state.sky === "天黑" || state.actionsRemaining <= 0) {
    return "lost";
  }
  return "playing";
}
