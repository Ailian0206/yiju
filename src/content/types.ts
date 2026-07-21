import type { EventCard, GameState, Narrator } from "@/engine/types";
import type { VocabularyConfig } from "@/engine/intent";

/** 主页展示与路由用的模组元数据;不含玩法数据。 */
export interface ModuleMeta {
  id: string;
  title: string;
  /** 一句话卖点,卡片副标题。 */
  tagline: string;
  /** 简短故事背景(2–4 句)。 */
  storyBackground: string;
  /** 玩法介绍(玩家怎么输入、目标是什么)。 */
  howToPlay: string;
  coverSrc: string;
  /** playable=可开玩;preview=即将开发。 */
  status: "playable" | "preview";
  estimatedMinutes: number;
}

export interface ModuleNarratorOptions {
  llmNarrator?: Narrator;
  maxCallsPerSession?: number;
}

/** 一套可装配进 useGameSession 的完整模组。 */
export interface ModuleBundle {
  meta: ModuleMeta;
  createInitialState: () => GameState;
  vocabulary: VocabularyConfig;
  events: readonly EventCard[];
  createNarrator: (options?: ModuleNarratorOptions) => Narrator;
  openingNarration: string;
  getSuggestedActions: (state: GameState) => string[];
}
