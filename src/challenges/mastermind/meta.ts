import type { ChallengeMeta } from "@/challenges/types";

/** 密码破译(Mastermind)挑战局文案与封面。 */
export const mastermindMeta: ChallengeMeta = {
  id: "mastermind",
  title: "密码破译",
  tagline: "猜出隐藏的色码序列,位准与色准指引你推理",
  storyBackground:
    "色码终端亮起一串未知密码。你看不见答案,只能一次次提交猜测。每次提交后,系统用「位准」和「色准」告诉你哪些对了——信息不完整,但足够让细心的人一步步锁死真相。",
  howToPlay:
    "选择简单/普通/困难后开始。点色填入当前行并提交:黑钉(位准)=颜色与位置都对;白钉(色准)=颜色对但位置错。在次数用尽前猜中整串即通关。无重复难度下,猜测也不允许重复色。",
  coverSrc: "/challenges/mastermind/cover.webp",
  status: "playable",
  estimatedMinutes: 8,
};
