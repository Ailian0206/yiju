// 规则引擎:天色推进、行动扣除、胜负判定。这些是产品文档 §4 明确规定
// "不交给模型自由发挥"的部分,必须是纯函数、可单测、可回归。
import type { GameState, SkyPhase } from "./types";

const SKY_SEQUENCE: SkyPhase[] = ["傍晚", "黄昏", "擦黑", "天黑"];
const ACTIONS_PER_SKY_PHASE = 3;

/** 根据已用行动次数计算天色档位。每 3 次行动推进一档,到「天黑」后不再继续推进。 */
export function skyPhaseForActionsTaken(actionsTaken: number): SkyPhase {
  const index = Math.min(
    SKY_SEQUENCE.length - 1,
    Math.floor(actionsTaken / ACTIONS_PER_SKY_PHASE),
  );
  return SKY_SEQUENCE[index];
}

/** 消耗一次行动:扣剩余次数、推进天色。不判定胜负,职责单一。 */
export function applyActionCost(state: GameState): GameState {
  const actionsTaken = state.actionsTaken + 1;
  const actionsRemaining = Math.max(0, state.actionsRemaining - 1);
  return {
    ...state,
    actionsTaken,
    actionsRemaining,
    sky: skyPhaseForActionsTaken(actionsTaken),
  };
}

/**
 * 失败判定:天黑或行动次数用尽。通关(won)由 reducer 在 finish 意图命中
 * 「已找到」时显式设置,不在这里判断——评估函数只负责检测失败,
 * 且不会覆盖已经存在的终局状态(won/lost 是终态)。
 */
export function evaluateOutcome(state: GameState): GameState["status"] {
  if (state.status !== "playing") {
    return state.status;
  }
  if (state.sky === "天黑" || state.actionsRemaining <= 0) {
    return "lost";
  }
  return "playing";
}
