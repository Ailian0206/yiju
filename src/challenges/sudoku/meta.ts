import type { ChallengeMeta } from "@/challenges/types";

export const sudokuMeta: ChallengeMeta = {
  id: "sudoku",
  title: "数独",
  tagline: "行列宫不重复,空格越多越要排除法",
  storyBackground:
    "九宫格里,每个数字都既是答案也是约束。简单档可以顺推;普通与困难档空格更多,往往要列候选、找唯一解或配对排除——错一步会连锁冲突。",
  howToPlay:
    "点选空格后用下方数字填入。每行、每列、每个 3×3 宫 1–9 不重复。冲突格标红。给定数字不可改。三档难度。",
  coverSrc: "/challenges/sudoku/cover.svg",
  status: "playable",
  estimatedMinutes: 12,
};
