import type { VocabularyConfig } from "@/engine/intent";
import { CHARACTERS, ITEMS, LOCATIONS } from "./module";

export const elevatorVocabulary: VocabularyConfig = {
  finishKeywords: ["走出电梯", "出门", "出电梯", "离开电梯", "安全离开"],
  locationSynonyms: {
    [LOCATIONS.CABIN]: ["轿厢", "电梯里", "电梯中"],
  },
  characterSynonyms: {
    [CHARACTERS.GRANDMA]: ["老太太", "阿姨", "奶奶", "老人家"],
    [CHARACTERS.OFFICE]: ["白领", "西装男", "上班族", "年轻人"],
    [CHARACTERS.RIDER]: ["骑手", "外卖小哥", "快递员", "送外卖的"],
  },
  itemSynonyms: {
    [ITEMS.ALARM]: ["报警铃", "报警按钮", "报警", "紧急按钮", "红按钮"],
    [ITEMS.INTERCOM]: ["对讲机", "对讲", "通话按钮", "求助电话"],
  },
  callKeywords: ["喊", "叫", "大声"],
  searchKeywords: ["找", "搜", "听", "看", "查", "检查", "查看"],
};
