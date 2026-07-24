import type { ChallengeMeta } from "@/challenges/types";
import { DIFFICULTIES as MM } from "@/games/mastermind/rules";
import { LEVELS as NG } from "@/games/nonogram/rules";
import { LEVELS as SK } from "@/games/sokoban/rules";
import { LEVELS as SD } from "@/games/sudoku/rules";

export type DiffLine = { label: string; detail: string };

/** 介绍页「开始」按钮文案。 */
export function playCtaLabel(id: string): string {
  switch (id) {
    case "mastermind":
      return "开始破译";
    case "nonogram":
      return "开始数织";
    case "sudoku":
      return "开始数独";
    case "sokoban":
      return "开始试玩";
    default:
      return "开始挑战";
  }
}

/** 介绍页难度一览。 */
export function difficultyLines(id: string): DiffLine[] {
  if (id === "mastermind") {
    return (Object.keys(MM) as Array<keyof typeof MM>).map((key) => {
      const d = MM[key];
      return {
        label: d.label,
        detail: `${d.codeLength} 位 · ${d.colorCount} 色 · ${d.maxAttempts} 次${
          d.allowDuplicates ? " · 可重复" : " · 无重复"
        }`,
      };
    });
  }
  if (id === "nonogram") {
    return (Object.keys(NG) as Array<keyof typeof NG>).map((key) => {
      const d = NG[key];
      return {
        label: d.label,
        detail: `${d.size}×${d.size} 线索交叉推理`,
      };
    });
  }
  if (id === "sudoku") {
    return (Object.keys(SD) as Array<keyof typeof SD>).map((key) => {
      const empty = SD[key].givens.flat().filter((n) => n === 0).length;
      return { label: SD[key].label, detail: `约 ${empty} 个空格` };
    });
  }
  if (id === "sokoban") {
    return (Object.keys(SK) as Array<keyof typeof SK>).map((key) => ({
      label: SK[key].label,
      detail: `${SK[key].rows.length} 行短关 · 规划推序`,
    }));
  }
  return [];
}

export function introDescription(meta: ChallengeMeta): string {
  return `${meta.title}挑战局:${meta.tagline}`;
}
