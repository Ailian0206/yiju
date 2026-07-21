// 各模组共用的「主线模板 + filler 走 LLM」叙述装配,避免每个模组复制一套 try/catch。
import { createTemplatePoolNarrator, type TemplatePoolConfig } from "@/engine/narrator";
import type { ActionOutcome, GameState, Narrator } from "@/engine/types";
import type { ModuleNarratorOptions } from "@/content/types";

const DEFAULT_MAX_LLM_CALLS_PER_SESSION = 15;

function isFillerOutcome(outcome: ActionOutcome, config: TemplatePoolConfig): boolean {
  if (outcome.kind === "unknown" || outcome.kind === "noop") return true;
  if (outcome.kind === "rejected") return !config.rejectedTemplateKeys[outcome.eventId];
  return false;
}

/** 用模板池做主线;filler 场景可选走 LLM,失败静默回落。 */
export function createHybridNarrator(
  config: TemplatePoolConfig,
  options: ModuleNarratorOptions = {},
): Narrator {
  const templateNarrator = createTemplatePoolNarrator(config);
  const { llmNarrator, maxCallsPerSession = DEFAULT_MAX_LLM_CALLS_PER_SESSION } = options;
  let callsUsed = 0;

  return {
    async narrate(outcome: ActionOutcome, state: GameState, rawText: string): Promise<string> {
      const shouldTryLLM =
        Boolean(llmNarrator) && isFillerOutcome(outcome, config) && callsUsed < maxCallsPerSession;

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
