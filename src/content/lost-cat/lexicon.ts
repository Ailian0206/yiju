// 找猫模组词表:喂给 engine/intent.ts 的 createKeywordIntentResolver。
// 修改这里之后建议跑一下 findVocabularyAmbiguities(lostCatVocabulary),
// 确认没有引入跨类别的子串歧义(见 engine/intent.ts 头部注释)。
import type { VocabularyConfig } from "@/engine/intent";
import { CHARACTERS, ITEMS, LOCATIONS } from "./module";

export const lostCatVocabulary: VocabularyConfig = {
  finishKeywords: ["带回家", "带年糕回家", "带它回家", "回家"],
  locationSynonyms: {
    [LOCATIONS.GREENBELT]: ["绿化带", "草丛"],
    [LOCATIONS.GARAGE]: ["车库", "地下车库"],
    [LOCATIONS.OFFICE]: ["物业亭", "物业"],
    [LOCATIONS.LOCKERS]: ["快递柜"],
    [LOCATIONS.UNIT_ENTRANCE]: ["单元楼下", "楼下"],
  },
  characterSynonyms: {
    [CHARACTERS.GUARD]: ["门卫", "老周"],
    [CHARACTERS.AUNT]: ["阿姨", "陈阿姨", "红衣服的阿姨", "遛娃的邻居", "遛娃的阿姨"],
    [CHARACTERS.COURIER]: ["快递员", "小吴"],
  },
  itemSynonyms: {
    [ITEMS.FLASHLIGHT]: ["手电"],
    [ITEMS.BOX]: ["纸箱", "箱子"],
  },
  callKeywords: ["喊", "呼唤", "叫"],
  searchKeywords: ["找", "搜", "听", "看", "查"],
};
