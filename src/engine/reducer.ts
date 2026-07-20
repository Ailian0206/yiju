// 状态机核心:(state, intent, eventCards) -> ReduceResult。
// eventCards 由内容层传入,reducer 本身不 import 任何具体模组数据(工程优先级 1)。
import { applyActionCost, evaluateOutcome } from "./rules";
import type { EventCard, GameState, Intent, ReduceResult } from "./types";

function matchesIntentShape(card: EventCard, intent: Intent, state: GameState): boolean {
  if (card.intentType !== intent.type) return false;
  if (card.locationId && card.locationId !== state.currentLocationId) return false;
  if (card.targetId && card.targetId !== intent.targetId) return false;
  return true;
}

function isFlagsMet(card: EventCard, state: GameState): boolean {
  return (card.requiresFlags ?? []).every((flag) => state.flags[flag]);
}

function isAvailable(card: EventCard, state: GameState): boolean {
  const alreadyTriggered = state.triggeredEventIds.includes(card.id);
  return isFlagsMet(card, state) && (!alreadyTriggered || Boolean(card.repeatable));
}

function applyEffects(state: GameState, card: EventCard): GameState {
  const { effects } = card;
  const nextFlags = effects.setFlags
    ? {
        ...state.flags,
        ...Object.fromEntries(effects.setFlags.map((flag) => [flag, true])),
      }
    : state.flags;
  const nextTriggeredIds = card.repeatable
    ? state.triggeredEventIds
    : [...state.triggeredEventIds, card.id];

  return {
    ...state,
    clues: state.clues + (effects.clues ?? 0),
    closeness: effects.closeness ?? state.closeness,
    currentLocationId: effects.moveToLocationId ?? state.currentLocationId,
    flags: nextFlags,
    triggeredEventIds: nextTriggeredIds,
  };
}

/** finish 意图单独处理:是否通关只看 closeness,不查事件卡。 */
function resolveFinish(state: GameState): ReduceResult {
  const costed = applyActionCost(state);

  if (state.closeness === "已找到") {
    return { nextState: { ...costed, status: "won" }, outcome: { kind: "triggered", eventId: "finish" } };
  }

  return {
    nextState: { ...costed, status: evaluateOutcome(costed) },
    outcome: { kind: "rejected" },
  };
}

export function reduce(
  state: GameState,
  intent: Intent,
  eventCards: readonly EventCard[],
): ReduceResult {
  if (state.status !== "playing") {
    return { nextState: state, outcome: { kind: "noop" } };
  }

  if (intent.type === "unknown") {
    return { nextState: state, outcome: { kind: "unknown" } };
  }

  if (intent.type === "finish") {
    return resolveFinish(state);
  }

  // 命中顺序 = eventCards 数组顺序,取第一张可用的卡。内容层(M2 起)
  // 若同一 intentType 下有多张候选卡,更具体的卡(同时限定 locationId+targetId)
  // 应排在更宽泛的兜底卡之前,否则宽泛卡可能抢先命中。
  const candidates = eventCards.filter((card) => matchesIntentShape(card, intent, state));
  const match = candidates.find((card) => isAvailable(card, state));
  const costed = applyActionCost(state);
  const finalized = { ...costed, status: evaluateOutcome(costed) };

  if (match) {
    return {
      nextState: applyEffects(finalized, match),
      outcome: { kind: "triggered", eventId: match.id },
    };
  }

  const blockedByFlags = candidates.some((card) => !isFlagsMet(card, state));
  return {
    nextState: finalized,
    outcome: { kind: blockedByFlags ? "rejected" : "noop" },
  };
}
