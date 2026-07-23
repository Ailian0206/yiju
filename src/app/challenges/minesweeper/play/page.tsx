import type { Metadata } from "next";
import { MinesweeperGame } from "@/components/minesweeper/MinesweeperGame";

export const metadata: Metadata = {
  title: "扫雷中 · 扫雷试玩 · 一局",
  description: "扫雷试玩进行中。",
};

export default function MinesweeperPlayPage() {
  return (
    <main>
      <MinesweeperGame />
    </main>
  );
}
