import type { ChallengeMeta } from "@/challenges/types";

/** 海战棋试玩元数据(非正式立项,可试玩后决定)。 */
export const battleshipMeta: ChallengeMeta = {
  id: "battleship",
  title: "海战棋",
  tagline: "试玩 · 对隐藏舰队开火,听命中与击沉反馈",
  storyBackground:
    "雾海上的敌方舰队已经布好阵。你看不见船身,只能一发发炮弹探路。未命中、命中、击沉——用最少的炮火清空海域。",
  howToPlay:
    "8×8 棋盘,敌方随机放置航母/巡洋舰/驱逐舰。点格子开火。灰点=未命中,红叉=命中;该舰全部格子被打中即击沉。打沉全部即胜利。这是试玩 Demo,正式版可能再加难度与记录。",
  coverSrc: "/challenges/battleship/cover.svg",
  status: "demo",
  estimatedMinutes: 5,
};
