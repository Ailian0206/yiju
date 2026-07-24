import { describe, expect, it } from "vitest";
import { getChallenge, listChallenges } from "./registry";

describe("challenges registry", () => {
  it("列出可玩挑战局且含密码破译", () => {
    const list = listChallenges();
    expect(list.length).toBeGreaterThanOrEqual(1);
    const mm = list.find((c) => c.id === "mastermind");
    expect(mm?.title).toBe("密码破译");
    expect(mm?.status).toBe("playable");
    expect(mm?.coverSrc).toMatch(/mastermind\/cover/);
  });

  it("按 id 取挑战元数据", () => {
    expect(getChallenge("mastermind")?.tagline).toMatch(/色码|密码|破译/);
    expect(getChallenge("nope")).toBeUndefined();
  });

  it("含数织与数独且可正式开玩", () => {
    expect(getChallenge("nonogram")?.status).toBe("playable");
    expect(getChallenge("sudoku")?.status).toBe("playable");
    expect(getChallenge("battleship")).toBeUndefined();
  });
});
