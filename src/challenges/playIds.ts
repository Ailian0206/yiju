/** 可挂载游玩组件的挑战 id(服务端安全,勿放 "use client" 文件)。 */
export const PLAYABLE_GAME_IDS = ["mastermind", "nonogram", "sudoku"] as const;

export type PlayableGameId = (typeof PLAYABLE_GAME_IDS)[number];

export function listPlayableGameIds(): string[] {
  return [...PLAYABLE_GAME_IDS];
}
