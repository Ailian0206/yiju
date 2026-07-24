import type { ChallengeMeta } from "@/challenges/types";

export const nonogramMeta: ChallengeMeta = {
  id: "nonogram",
  title: "数织",
  tagline: "行列线索交叉推理,填出隐藏图案",
  storyBackground:
    "一张空白网格,只有上下左右的数字线索。每一串数字都在约束连续黑格的长度——单独看一行往往有多种可能,必须和列线索互相咬合,才能一步步锁死图案。",
  howToPlay:
    "根据行列线索填黑格。单击循环:空→黑→叉→空。叉用于标记必白格。三档 5×5 / 10×10 / 15×15。可用「核对」查出多填的黑格。",
  coverSrc: "/challenges/nonogram/cover.svg",
  status: "playable",
  estimatedMinutes: 10,
};
