import type { ChallengeMeta } from "@/challenges/types";
import { mastermindMeta } from "@/challenges/mastermind/meta";
import { nonogramMeta } from "@/challenges/nonogram/meta";
import { sokobanMeta } from "@/challenges/sokoban/meta";
import { sudokuMeta } from "@/challenges/sudoku/meta";

const ALL: ChallengeMeta[] = [
  mastermindMeta,
  nonogramMeta,
  sudokuMeta,
  sokobanMeta,
];


/** 主页展示的挑战局列表。 */
export function listChallenges(): ChallengeMeta[] {
  return ALL;
}

export function getChallenge(id: string): ChallengeMeta | undefined {
  return ALL.find((c) => c.id === id);
}
