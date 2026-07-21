import type { ModuleMeta } from "@/content/types";

/** 找猫模组主页/简介文案。 */
export const lostCatMeta: ModuleMeta = {
  id: "lost-cat",
  title: "找回走丢的猫",
  tagline: "天黑前,把年糕找回家",
  storyBackground:
    "傍晚时分,你发现小猫「年糕」从单元楼跑丢了。小区里绿化带、车库、物业亭和快递柜都可能藏着线索。天色一点点暗下去,你得赶在天黑前把它带回来。",
  howToPlay:
    "用日常中文直接打你想做的事,例如「问问门卫」「去绿化带」「仔细找找」。右侧状态会告诉你天色、线索和亲近感。找到年糕后再输入「带年糕回家」即可通关;行动耗尽或天黑则失败。",
  coverSrc: "/modules/lost-cat/cover.webp",
  status: "playable",
  estimatedMinutes: 15,
};
