// 意图解析:P0 关键词表实现。IntentResolver 是 types.ts 定义的接口,
// P1 若换成 LLM 实现,签名不变,reducer/UI 不用改。
//
// 匹配优先级(产品文档 §4.2、开发计划 §1.2):
// finish → move(地点同义词)→ talk(角色同义词)→ use(物品同义词)→ call → search → unknown。
// move/talk/use 靠"句子里是否出现对应实体的同义词"匹配,不要求特定动词——
// 这样「跟门卫聊聊」「问问门卫」都能落到同一个 talk 意图,不用穷举动词组合。
import type { GameState, Intent, IntentResolver } from "./types";

/** 词表配置,由内容层(如 content/lost-cat/lexicon.ts)提供具体数据。 */
export interface VocabularyConfig {
  finishKeywords: string[];
  /** locationId -> 该地点的同义词列表 */
  locationSynonyms: Record<string, string[]>;
  /** characterId -> 该角色的同义词/模糊指代列表 */
  characterSynonyms: Record<string, string[]>;
  /** itemId -> 该物品的同义词列表 */
  itemSynonyms: Record<string, string[]>;
  callKeywords: string[];
  searchKeywords: string[];
}

function containsAny(text: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => text.includes(keyword));
}

/** 在同义词字典里找第一个出现在 text 中的 entityId;顺序取决于对象键的插入顺序。 */
function findMatchingEntity(
  text: string,
  synonyms: Record<string, string[]>,
): string | undefined {
  return Object.entries(synonyms).find(([, words]) => containsAny(text, words))?.[0];
}

export function createKeywordIntentResolver(vocabulary: VocabularyConfig): IntentResolver {
  return {
    resolve(rawText: string, _state: GameState): Intent {
      const text = rawText.trim();

      if (containsAny(text, vocabulary.finishKeywords)) {
        return { type: "finish", rawText };
      }

      const locationId = findMatchingEntity(text, vocabulary.locationSynonyms);
      if (locationId) {
        return { type: "move", targetId: locationId, rawText };
      }

      const characterId = findMatchingEntity(text, vocabulary.characterSynonyms);
      if (characterId) {
        return { type: "talk", targetId: characterId, rawText };
      }

      const itemId = findMatchingEntity(text, vocabulary.itemSynonyms);
      if (itemId) {
        return { type: "use", targetId: itemId, rawText };
      }

      if (containsAny(text, vocabulary.callKeywords)) {
        return { type: "call", rawText };
      }

      if (containsAny(text, vocabulary.searchKeywords)) {
        return { type: "search", rawText };
      }

      return { type: "unknown", rawText };
    },
  };
}
