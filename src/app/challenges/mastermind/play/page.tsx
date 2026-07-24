import type { Metadata } from "next";
import { MastermindGame } from "@/components/mastermind/MastermindGame";

export const metadata: Metadata = {
  title: "破译中 · 密码破译 · 一局",
  description: "进行中的色码破译挑战局。",
};

export default function MastermindPlayPage() {
  return (
    <main>
      <MastermindGame />
    </main>
  );
}
