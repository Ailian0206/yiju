import type { ChallengeMeta } from "@/challenges/types";
import { battleshipMeta } from "@/challenges/battleship/meta";
import { mastermindMeta } from "@/challenges/mastermind/meta";
import { minesweeperMeta } from "@/challenges/minesweeper/meta";

const ALL: ChallengeMeta[] = [mastermindMeta, battleshipMeta, minesweeperMeta];

/** 主页展示的挑战局列表。 */
export function listChallenges(): ChallengeMeta[] {
  return ALL;
}

export function getChallenge(id: string): ChallengeMeta | undefined {
  return ALL.find((c) => c.id === id);
}
