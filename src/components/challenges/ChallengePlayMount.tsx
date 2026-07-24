"use client";

import type { ComponentType } from "react";
import { MastermindGame } from "@/components/mastermind/MastermindGame";
import { NonogramGame } from "@/components/nonogram/NonogramGame";
import { SudokuGame } from "@/components/sudoku/SudokuGame";
import type { PlayableGameId } from "@/challenges/playIds";

const GAMES: Record<PlayableGameId, ComponentType> = {
  mastermind: MastermindGame,
  nonogram: NonogramGame,
  sudoku: SudokuGame,
};

/** 按挑战 id 挂载对应游玩组件。 */
export function ChallengePlayMount({ id }: { id: string }) {
  const Game = GAMES[id as PlayableGameId];
  if (!Game) return null;
  return <Game />;
}
