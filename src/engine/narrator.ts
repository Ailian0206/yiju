// 叙述生成:P0 模板池实现。Narrator 是 types.ts 定义的接口,P1 若换成
// LLM 实现,签名不变——UI 只认 Narrator.narrate(outcome, state, rawText),
// 不关心底下是模板池还是真模型。这个实现本身是同步的,包一层
// Promise.resolve 只是为了满足接口签名。
//
// 内容层(如 content/lost-cat/narrator-config.ts)负责把 EventCard.templateKeys
// 之类的分散数据组装成这里要的几张扁平表,narrator 本身不认识任何具体事件。
import type { ActionOutcome, GameState, Narrator } from "./types";

export interface TemplatePoolConfig {
  /** templateKey -> 叙述文本。 */
  templates: Record<string, string>;
  /** eventId -> triggered 时可选的 templateKey 列表。 */
  eventTemplateKeys: Record<string, string[]>;
  /** eventId -> rejected 时的专属 templateKey 列表;未覆盖的 eventId 落到 fallback.rejected。 */
  rejectedTemplateKeys: Record<string, string[]>;
  /** locationId -> moved 时的到达文案;未覆盖的地点落到 genericMovedKeys。 */
  arrivalTemplateKeys: Record<string, string[]>;
  fallback: {
    unknown: string[];
    noop: string[];
    rejected: string[];
  };
  /** moved 到没有专属到达文案的地点时使用。 */
  genericMovedKeys?: string[];
}

const SILENT_FALLBACK_TEXT = "……(这里似乎还没有对应的叙述文案)";

function pickTemplate(templates: Record<string, string>, keys: readonly string[]): string {
  const validKeys = keys.filter((key) => templates[key] !== undefined);
  if (validKeys.length === 0) {
    return SILENT_FALLBACK_TEXT;
  }
  const index = Math.floor(Math.random() * validKeys.length);
  return templates[validKeys[index]];
}

export function createTemplatePoolNarrator(config: TemplatePoolConfig): Narrator {
  function resolveText(outcome: ActionOutcome): string {
    switch (outcome.kind) {
      case "unknown":
        return pickTemplate(config.templates, config.fallback.unknown);
      case "noop":
        return pickTemplate(config.templates, config.fallback.noop);
      case "moved": {
        const keys = config.arrivalTemplateKeys[outcome.locationId] ?? config.genericMovedKeys ?? [];
        return pickTemplate(config.templates, keys);
      }
      case "rejected": {
        const keys = config.rejectedTemplateKeys[outcome.eventId] ?? config.fallback.rejected;
        return pickTemplate(config.templates, keys);
      }
      case "triggered": {
        const keys = config.eventTemplateKeys[outcome.eventId] ?? [];
        return pickTemplate(config.templates, keys);
      }
      default:
        return SILENT_FALLBACK_TEXT;
    }
  }

  return {
    narrate: async (outcome: ActionOutcome, _state: GameState, _rawText: string): Promise<string> =>
      resolveText(outcome),
  };
}
