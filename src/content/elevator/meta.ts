import type { ModuleMeta } from "@/content/types";

export const elevatorMeta: ModuleMeta = {
  id: "elevator",
  title: "电梯故障 60 分钟",
  tagline: "困在箱里,和陌生人一起等救援",
  storyBackground:
    "下班高峰,电梯在两层之间突然停住。应急灯亮着,手机信号时有时无。你和几个陌生人挤在狭小轿厢里,外面的维修声若有若无——六十分钟内,你会看见每个人最真实的一面。",
  howToPlay:
    "场景几乎只有轿厢内部。用自然语言与同梯的人交谈、检查按钮、安抚情绪或尝试自救。关注有限的时间与人际关系;达成「安全出梯」或关键人物态度目标即可通关。",
  coverSrc: "/modules/elevator/cover.webp",
  status: "playable",
  estimatedMinutes: 20,
};
