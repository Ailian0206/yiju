import type { VocabularyConfig } from "@/engine/intent";
import { CHARACTERS, ITEMS, LOCATIONS } from "./module";

export const blindDateVocabulary: VocabularyConfig = {
  finishKeywords: ["体面收场", "结束相亲", "告辞", "买单离开", "礼貌结束"],
  locationSynonyms: {
    [LOCATIONS.TABLE]: ["圆桌", "餐桌", "饭桌"],
  },
  characterSynonyms: {
    [CHARACTERS.PARTNER]: ["对方", "对象", "相亲对象", "ta", "TA"],
    [CHARACTERS.MATCHMAKER]: ["介绍人", "阿姨", "亲戚", "红娘"],
  },
  itemSynonyms: {
    [ITEMS.WINE]: ["酒", "敬酒", "碰杯", "干杯"],
    [ITEMS.TOPIC]: ["话题", "工作", "房子", "兴趣"],
  },
  callKeywords: ["喊", "叫服务员"],
  searchKeywords: ["找", "看", "听", "观察", "打量"],
};
