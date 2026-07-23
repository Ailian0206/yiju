/** 挑战局元数据:与文字模组 ModuleMeta 平行,不进 engine。 */
export type ChallengeMeta = {
  id: string;
  title: string;
  tagline: string;
  /** 设定/背景(2–4 句)。 */
  storyBackground: string;
  /** 玩法说明。 */
  howToPlay: string;
  coverSrc: string;
  /** demo=可试玩但非正式立项;preview=仅占位。 */
  status: "playable" | "demo" | "preview";
  estimatedMinutes: number;
};
