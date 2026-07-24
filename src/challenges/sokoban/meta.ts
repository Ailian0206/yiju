import type { ChallengeMeta } from "@/challenges/types";

export const sokobanMeta: ChallengeMeta = {
  id: "sokoban",
  title: "推箱子",
  tagline: "试玩 · 只能推不能拉,先想清楚再动手",
  storyBackground:
    "仓库里的箱子要推到指定圆点。路很窄,推错一步就可能卡死在墙角——所以这不是手速游戏,而是一步步的空间推理。",
  howToPlay:
    "方向键或 WASD 移动人物。碰到箱子会尝试推动;前方是墙或另一箱则推不动。所有箱子落在目标点即通关。支持撤销与三档关卡。",
  coverSrc: "/challenges/sokoban/cover.svg",
  status: "demo",
  estimatedMinutes: 8,
};
