import type { VocabularyConfig } from "@/engine/intent";
import { CHARACTERS, ITEMS, LOCATIONS } from "./module";

export const plantWeekVocabulary: VocabularyConfig = {
  finishKeywords: ["交还给朋友", "交还植物", "朋友回来", "把植物交还"],
  locationSynonyms: {
    [LOCATIONS.LIVING]: ["客厅", "窗边", "屋里"],
    [LOCATIONS.BALCONY]: ["阳台", "外头", "外面晒"],
  },
  characterSynonyms: {
    [CHARACTERS.PLANT]: ["植物", "绿植", "叶子", "盆栽"],
  },
  itemSynonyms: {
    [ITEMS.WATER]: ["浇水", "浇一下", "见干见湿", "补水"],
    [ITEMS.FERTILIZER]: ["施肥", "肥料", "营养液"],
    [ITEMS.SHADE]: ["遮阴", "躲开暴晒", "拉帘", "遮光"],
  },
  callKeywords: ["喊", "叫"],
  searchKeywords: ["看", "观察", "晒", "偷懒", "发呆", "检查"],
};
