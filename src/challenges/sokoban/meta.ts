import type { ChallengeMeta } from "@/challenges/types";

export const sokobanMeta: ChallengeMeta = {
  id: "sokoban",
  title: "推箱子",
  tagline: "贴着木箱推,绕开砖墙,规划推序才能通关",
  storyBackground:
    "仓库工人要把木箱推到绿色垫上。砖墙挡路,只能推不能拉——推错一步就可能卡死在墙角。这不是手速游戏,而是一步步的空间推理。",
  howToPlay:
    "方向键或 WASD 操控工人;贴着箱子再往前会把箱子推出去。共 5 关,最短通关步数约每关翻倍。前方是墙或另一箱则推不动。全部箱子压在目标垫上即通关,支持撤销;本机记录每关最少步数。",
  coverSrc: "/challenges/sokoban/cover.webp",
  status: "playable",
  estimatedMinutes: 15,
};
