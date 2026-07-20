// 引擎核心类型。此文件禁止 import React 或 content/ 下的具体模组数据——
// 引擎只认识这些抽象概念,不认识"猫""年糕"这些具体内容(见 AGENT.md 工程优先级 1)。

/** 天色:每 3 次有效行动推进一档,到「天黑」即失败(若未通关)。 */
export type SkyPhase = "傍晚" | "黄昏" | "擦黑" | "天黑";

/** 亲近感:离目标物越来越近的抽象进度条,不是具体的"猫在哪"。 */
export type Closeness = "远" | "有动静" | "很近" | "已找到";

/** 玩家自由输入被归一化后的意图类型。unknown 不消耗行动次数。 */
export type IntentType = "move" | "search" | "talk" | "use" | "call" | "finish" | "unknown";

export interface Intent {
  type: IntentType;
  /** move/talk/use 等意图指向的目标 id(地点 id / 角色 id / 物品 id),由内容层定义具体取值。 */
  targetId?: string;
  /** 原始输入,用于日志与无法归类时的引导文案。 */
  rawText: string;
}

/** 一局游戏的完整状态。所有更新走不可变模式,reducer 返回新对象。 */
export interface GameState {
  status: "playing" | "won" | "lost";
  sky: SkyPhase;
  clues: number;
  closeness: Closeness;
  actionsRemaining: number;
  actionsTaken: number;
  currentLocationId: string;
  /** 隐藏旗帜,如 got_flashlight、cat_in_box,内容层定义具体 key。 */
  flags: Record<string, boolean>;
  /** 已触发过的事件 id,用于防止同一线索重复掉落。 */
  triggeredEventIds: string[];
  /** 叙事日志,供界面渲染滚动区。 */
  log: LogEntry[];
}

export interface LogEntry {
  id: string;
  /** player = 玩家输入回显;narration = 引擎生成的叙述文本。 */
  kind: "player" | "narration";
  text: string;
}

/**
 * 一次行动的结果:拒绝 / 触发了某个事件 / 通过但未命中任何事件卡,三选一。
 * 用可辨识联合而非独立的 rejected+triggeredEventId,避免出现
 * "既 rejected 又有 triggeredEventId" 这种类型层面本不该存在的状态。
 */
export type ActionOutcome =
  | { kind: "rejected" }
  | { kind: "triggered"; eventId: string }
  | { kind: "noop" };

/** reducer 单次处理的结果:新状态 + 本次行动的结果分类(供 narrator 取模板)。 */
export interface ReduceResult {
  nextState: GameState;
  outcome: ActionOutcome;
}

/** 事件卡:内容层数据,引擎只按接口消费,不关心具体触发条件的业务含义。 */
export interface EventCard {
  id: string;
  intentType: IntentType;
  /** 触发所需的地点/目标匹配条件,由内容层解释。 */
  locationId?: string;
  targetId?: string;
  /** 前置旗帜要求,全部为 true 才能触发。 */
  requiresFlags?: string[];
  /** 触发后的状态效果。 */
  effects: EventEffects;
  /** 叙述模板 key 列表,narrator 随机选一条(P0 mock 实现)。 */
  templateKeys: string[];
}

export interface EventEffects {
  clues?: number;
  closeness?: Closeness;
  setFlags?: string[];
  moveToLocationId?: string;
}

/** 意图解析器接口:P0 用关键词表实现,P1 可换 LLM 实现,签名不变。 */
export interface IntentResolver {
  resolve(rawText: string, state: GameState): Intent;
}

/** 叙述生成器接口:P0 用模板池实现,P1 可换 LLM 实现,签名不变。 */
export interface Narrator {
  narrate(outcome: ActionOutcome, state: GameState): string;
}
