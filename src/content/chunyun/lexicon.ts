import type { VocabularyConfig } from "@/engine/intent";
import { CHARACTERS, ITEMS, LOCATIONS } from "./module";

export const chunyunVocabulary: VocabularyConfig = {
  finishKeywords: ["确认购票", "抢到票回家", "支付车票", "锁票回家"],
  locationSynonyms: { [LOCATIONS.DESK]: ["书桌", "电脑前", "房间"] },
  characterSynonyms: { [CHARACTERS.FAMILY]: ["家人", "妈妈", "爸", "家庭群"] },
  itemSynonyms: {
    [ITEMS.REFRESH]: ["刷新", "购票页", "页面"],
    [ITEMS.TRAIN]: ["车次", "改签", "换车", "中转"],
    [ITEMS.TICKET]: ["候补", "抢票", "下单", "支付"],
  },
  callKeywords: ["喊", "叫"],
  searchKeywords: ["找", "看", "查", "搜", "盯"],
};
