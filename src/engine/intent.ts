// 意图解析:P0 关键词表实现。IntentResolver 是 types.ts 定义的接口,
// P1 若换成 LLM 实现,签名不变,reducer/UI 不用改。
//
// 匹配优先级(产品文档 §4.2、开发计划 §1.2):
// finish → move(地点同义词)→ talk(角色同义词)→ use(物品同义词)→ call → search → unknown。
// move/talk/use 靠"句子里是否出现对应实体的同义词"匹配,不要求特定动词——
// 这样「跟门卫聊聊」「问问门卫」都能落到同一个 talk 意图,不用穷举动词组合。
//
// 已知取舍:纯提及地点名而未提及角色名的句子(如「问问物业」,物业本身
// 不是可对话角色)会先落到 move,而不是"去物业跟人聊聊"这种复合意图——
// 找猫模组的实际词表里可对话角色都有具名同义词(老周/陈阿姨/小吴),
// 不会撞上这种情况;若未来内容需要"地点即角色"的表达,再补动词信号,
// 现在不为假设的场景加复杂度。
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

/**
 * 在同义词字典里找第一个出现在 text 中的 entityId。
 * 注意:命中顺序取决于对象键的插入顺序,不做"最长匹配优先"——
 * 内容层编写 lexicon 时,若某实体的同义词更常被误认成别的实体,
 * 应把它排在字典靠前的位置。跨类别(地点/角色/物品)的词汇歧义
 * 由 findVocabularyAmbiguities 在加载期检测,不在这里运行时处理。
 */
function findMatchingEntity(
  text: string,
  synonyms: Record<string, string[]>,
): string | undefined {
  return Object.entries(synonyms).find(([, words]) => containsAny(text, words))?.[0];
}

interface VocabularyWord {
  category: "location" | "character" | "item";
  entityId: string;
  word: string;
}

function collectWords(category: VocabularyWord["category"], dict: Record<string, string[]>): VocabularyWord[] {
  return Object.entries(dict).flatMap(([entityId, words]) =>
    words.map((word) => ({ category, entityId, word })),
  );
}

/**
 * 校验词表:找出跨类别(地点/角色/物品)的子串歧义,如某角色同义词恰好是
 * 某地点同义词的子串——由于 move 的优先级高于 talk(见文件头注释),
 * 这类词会被地点吞掉,talk 意图永远匹配不到。
 *
 * 这不是运行时行为的一部分,是内容层(M2 起)加载 lexicon 时应调用的
 * 一次性校验,失败时应在开发环境下 throw,而不是让歧义悄悄进入 P0。
 */
export function findVocabularyAmbiguities(vocabulary: VocabularyConfig): string[] {
  const words = [
    ...collectWords("location", vocabulary.locationSynonyms),
    ...collectWords("character", vocabulary.characterSynonyms),
    ...collectWords("item", vocabulary.itemSynonyms),
  ];

  const conflicts: string[] = [];
  for (const a of words) {
    for (const b of words) {
      if (a.category === b.category || a.word === b.word) continue;
      if (b.word.includes(a.word)) {
        conflicts.push(
          `${a.category}:${a.entityId}「${a.word}」是 ${b.category}:${b.entityId}「${b.word}」的子串,` +
            "优先级更高的类别会吞掉后者,导致后者永远匹配不到",
        );
      }
    }
  }
  return conflicts;
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
