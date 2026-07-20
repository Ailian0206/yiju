// 把 events.ts / templates.ts 的分散数据组装成 engine/narrator.ts 要的
// 扁平配置。这是唯一知道"某张事件卡对应哪些模板 key"的地方——
// engine/narrator.ts 本身不 import events.ts。
import { createTemplatePoolNarrator, type TemplatePoolConfig } from "@/engine/narrator";
import type { ActionOutcome, GameState, Narrator } from "@/engine/types";
import { LOCATIONS } from "./module";
import { lostCatEvents } from "./events";
import { lostCatTemplates } from "./templates";

const eventTemplateKeys: Record<string, string[]> = {
  ...Object.fromEntries(lostCatEvents.map((card) => [card.id, card.templateKeys])),
  // finish 成功不是一张 EventCard(引擎在 resolveFinish 里直接合成
  // eventId: "finish"),事件表里天然没有它,要在这里单独补上。
  finish: ["finish-success-1", "finish-success-2"],
};

const rejectedTemplateKeys: Record<string, string[]> = {
  "search-garage-with-flashlight": ["garage-dark-rejected-1"],
  "use-flashlight-garage": ["garage-dark-rejected-1"],
  finish: ["finish-rejected-1"],
};

const arrivalTemplateKeys: Record<string, string[]> = {
  [LOCATIONS.UNIT_ENTRANCE]: ["arrive-unit-entrance-1"],
  [LOCATIONS.GREENBELT]: ["arrive-greenbelt-1"],
  [LOCATIONS.GARAGE]: ["arrive-garage-1"],
  [LOCATIONS.OFFICE]: ["arrive-office-1"],
  [LOCATIONS.LOCKERS]: ["arrive-lockers-1"],
};

export const lostCatNarratorConfig: TemplatePoolConfig = {
  templates: lostCatTemplates,
  eventTemplateKeys,
  rejectedTemplateKeys,
  arrivalTemplateKeys,
  fallback: {
    unknown: ["generic-unknown-1", "generic-unknown-2"],
    noop: ["generic-noop-1", "generic-noop-2"],
    rejected: ["generic-rejected-1"],
  },
};

const templateNarrator = createTemplatePoolNarrator(lostCatNarratorConfig);

/**
 * "填词区":玩家输入没命中任何设计好的内容,只能靠通用兜底文案接住的
 * 场景——unknown(没听懂)、noop(合法但这里没这回事)、没有专属文案的
 * rejected。这些地方最容易让玩家觉得"打什么都一个反应",是 P1 接入
 * 真模型时最该优先覆盖的部分;triggered 和有专属文案的 rejected 保留
 * 人工写好的文案,不路由给 LLM——省调用次数,也保住主线内容的质量和
 * 一致性。
 */
function isFillerOutcome(outcome: ActionOutcome): boolean {
  if (outcome.kind === "unknown" || outcome.kind === "noop") return true;
  if (outcome.kind === "rejected") return !lostCatNarratorConfig.rejectedTemplateKeys[outcome.eventId];
  return false;
}

const DEFAULT_MAX_LLM_CALLS_PER_SESSION = 15;

export interface LostCatNarratorOptions {
  /** 提供了才会尝试走 LLM;不提供就是纯模板池行为,P0 默认如此。 */
  llmNarrator?: Narrator;
  /** 每局(每个 hook 实例生命周期)最多调用几次 LLM,超了静默回落模板。 */
  maxCallsPerSession?: number;
}

/**
 * 组合出实际使用的 narrator:filler 场景优先尝试 llmNarrator(如果给了、
 * 且没超预算),LLM 调用失败(网络错误、超时、返回异常)也静默回落模板,
 * 不抛错、不阻塞游戏——保证 P1 接入真模型这件事本身不会让游戏变得更脆弱。
 */
export function createLostCatNarrator(options: LostCatNarratorOptions = {}): Narrator {
  const { llmNarrator, maxCallsPerSession = DEFAULT_MAX_LLM_CALLS_PER_SESSION } = options;
  let callsUsed = 0;

  return {
    async narrate(outcome: ActionOutcome, state: GameState, rawText: string): Promise<string> {
      const shouldTryLLM = Boolean(llmNarrator) && isFillerOutcome(outcome) && callsUsed < maxCallsPerSession;

      if (shouldTryLLM && llmNarrator) {
        callsUsed += 1;
        try {
          return await llmNarrator.narrate(outcome, state, rawText);
        } catch {
          return templateNarrator.narrate(outcome, state, rawText);
        }
      }

      return templateNarrator.narrate(outcome, state, rawText);
    },
  };
}

/** P0 默认导出:纯模板池,不接 LLM。 */
export const lostCatNarrator = createLostCatNarrator();
