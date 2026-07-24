import { describe, expect, it } from "vitest";
import { difficultyLines, playCtaLabel } from "./introCopy";

describe("introCopy", () => {
  it("三款挑战都有难度行与 CTA", () => {
    expect(playCtaLabel("mastermind")).toMatch(/破译/);
    expect(playCtaLabel("nonogram")).toMatch(/数织/);
    expect(playCtaLabel("sudoku")).toMatch(/数独/);
    expect(difficultyLines("mastermind").length).toBe(3);
    expect(difficultyLines("nonogram")[0]?.detail).toMatch(/5×5/);
    expect(difficultyLines("sudoku").some((l) => l.detail.includes("空格"))).toBe(
      true,
    );
  });
});
