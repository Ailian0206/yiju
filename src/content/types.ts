import type { Closeness, EventCard, GameState, Narrator, SkyPhase } from "@/engine/types";
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

/** 状态面板/结局文案:引擎四槽复用,展示语义由模组覆盖。 */
export interface ModuleUi {
  locationNames: Record<string, string>;
  labels: {
    sky: string;
    clues: string;
    closeness: string;
    actions: string;
  };
  skyDisplay?: Partial<Record<SkyPhase, string>>;
  closenessDisplay?: Partial<Record<Closeness, string>>;
  ending: {
    wonTitle: string;
    wonBody: string;
    lostTitle: string;
    lostBody: string;
    cluesLabel: string;
  };
}

/** 叙事区插图资源:开局/事件/到达地点。 */
export interface ModuleSceneArt {
  opening?: string;
  byEventId?: Record<string, string>;
  byLocationId?: Record<string, string>;
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
  ui: ModuleUi;
  /** 局内插图;缺省则纯文字。 */
  sceneArt?: ModuleSceneArt;
}
