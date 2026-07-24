import { describe, expect, it } from "vitest";
import { LEVELS, createSession, move, isWon, undo } from "./rules";

describe("sokoban rules", () => {
  it("三档关卡都有墙/箱/目标/玩家", () => {
    for (const id of ["easy", "normal", "hard"] as const) {
      const level = LEVELS[id];
      const map = level.rows.join("");
      expect(level.rows.length).toBeGreaterThan(3);
      expect(map).toMatch(/#/);
      expect(map).toMatch(/\$|\*/);
      expect(map).toMatch(/\.|\+|\*/);
      expect(map).toMatch(/@|\+/);
    }
  });

  it("推动箱子到目标即胜;撞墙不动;可撤销", () => {
    const mini = {
      id: "easy" as const,
      label: "测",
      rows: ["#####", "#@$.#", "#####"],
    };
    let s = createSession(mini);
    expect(s.player).toEqual({ x: 1, y: 1 });
    expect(s.boxes.has("2,1")).toBe(true);
    expect(s.goals.has("3,1")).toBe(true);

    const blocked = move(s, "up");
    expect(blocked.player).toEqual(s.player);

    s = move(s, "right");
    expect(s.player).toEqual({ x: 2, y: 1 });
    expect(s.boxes.has("3,1")).toBe(true);
    expect(isWon(s)).toBe(true);

    const back = undo(s);
    expect(isWon(back)).toBe(false);
    expect(back.boxes.has("2,1")).toBe(true);
    expect(back.player).toEqual({ x: 1, y: 1 });
  });
});
