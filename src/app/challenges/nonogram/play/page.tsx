import type { Metadata } from "next";
import { NonogramGame } from "@/components/nonogram/NonogramGame";

export const metadata: Metadata = {
  title: "数织中 · 一局",
  description: "数织挑战进行中。",
};

export default function NonogramPlayPage() {
  return (
    <main>
      <NonogramGame />
    </main>
  );
}
