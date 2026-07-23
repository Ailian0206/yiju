import type { ChallengeMeta } from "@/challenges/types";

/** 扫雷试玩元数据(非正式立项,可试玩后决定)。 */
export const minesweeperMeta: ChallengeMeta = {
  id: "minesweeper",
  title: "扫雷",
  tagline: "试玩 · 翻开安全格,用数字推理雷区",
  storyBackground:
    "一片未知雷场。你只能靠翻开格子后留下的数字,推断周围哪里有雷。紧张但不靠运气硬刚——信息够用时,可以一步步扫清。",
  howToPlay:
    "左键翻开,右键插旗。数字=周围八格雷数。空白会自动连锁翻开。首击保证安全。简单/普通/困难三档。这是试玩 Demo,正式版可能再加计时与最佳纪录。",
  coverSrc: "/challenges/minesweeper/cover.svg",
  status: "demo",
  estimatedMinutes: 6,
};
