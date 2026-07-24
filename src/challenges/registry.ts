import type { ChallengeMeta } from "@/challenges/types";
import { mastermindMeta } from "@/challenges/mastermind/meta";

const ALL: ChallengeMeta[] = [mastermindMeta];

/** 主页展示的挑战局列表。 */
export function listChallenges(): ChallengeMeta[] {
  return ALL;
}

export function getChallenge(id: string): ChallengeMeta | undefined {
  return ALL.find((c) => c.id === id);
}
