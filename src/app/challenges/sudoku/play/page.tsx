import type { Metadata } from "next";
import { SudokuGame } from "@/components/sudoku/SudokuGame";

export const metadata: Metadata = {
  title: "数独中 · 一局",
  description: "数独挑战进行中。",
};

export default function SudokuPlayPage() {
  return (
    <main>
      <SudokuGame />
    </main>
  );
}
