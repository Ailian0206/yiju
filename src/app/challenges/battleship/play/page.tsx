import type { Metadata } from "next";
import { BattleshipGame } from "@/components/battleship/BattleshipGame";

export const metadata: Metadata = {
  title: "海战中 · 海战棋试玩 · 一局",
  description: "海战棋试玩进行中。",
};

export default function BattleshipPlayPage() {
  return (
    <main>
      <BattleshipGame />
    </main>
  );
}
