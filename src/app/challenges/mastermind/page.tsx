import type { Metadata } from "next";
import { MastermindGame } from "@/components/mastermind/MastermindGame";

export const metadata: Metadata = {
  title: "密码破译 · 一局",
  description: "Mastermind 风格颜色密码破译:三档难度,位准/色准反馈。",
};

export default function MastermindPage() {
  return (
    <main>
      <MastermindGame />
    </main>
  );
}
