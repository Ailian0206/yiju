import { describe, expect, it } from "vitest";
import {
  LEVEL_PACK,
  createSession,
  shortestSolutionMoves,
  move,
  isWon,
  undo,
} from "./rules";

describe("sokoban rules", () => {
  it("推动箱子到目标即胜;撞墙不动;可撤销", () => {
    const mini = {
      id: "t",
      index: 0,
      label: "测",
      tier: "easy" as const,
      minMoves: 1,
      rows: ["#####", "#@$.#", "#####"],
    };
    let s = createSession(mini);
    expect(s.player).toEqual({ x: 1, y: 1 });
    expect(s.boxes.has("2,1")).toBe(true);
    expect(s.goals.has("3,1")).toBe(true);

    const blocked = move(s, "up");
    expect(blocked.session.player).toEqual(s.player);
    expect(blocked.kind).toBe("blocked");

    const pushed = move(s, "right");
    expect(pushed.kind).toBe("push");
    s = pushed.session;
    expect(s.player).toEqual({ x: 2, y: 1 });
    expect(s.boxes.has("3,1")).toBe(true);
    expect(isWon(s)).toBe(true);

    const back = undo(s);
    expect(isWon(back)).toBe(false);
    expect(back.boxes.has("2,1")).toBe(true);
    expect(back.player).toEqual({ x: 1, y: 1 });
  });

  it("关卡为完整房间,箱=目标,最短步数标注约每关翻倍", () => {
    expect(LEVEL_PACK.length).toBeGreaterThanOrEqual(5);

    for (const level of LEVEL_PACK) {
      const s = createSession(level);
      expect(s.boxes.size, level.label).toBe(s.goals.size);
      expect(s.boxes.size, level.label).toBeGreaterThanOrEqual(1);
      expect(s.height, level.label).toBeGreaterThanOrEqual(5);
      expect(s.width, level.label).toBeGreaterThanOrEqual(5);
      expect(level.minMoves, level.label).toBeGreaterThan(0);
    }

    // 指数翻倍:后一关标注最短步数 ≥ 前一关 × 1.7
    for (let i = 1; i < LEVEL_PACK.length; i++) {
      const prev = LEVEL_PACK[i - 1]!;
      const cur = LEVEL_PACK[i]!;
      expect(
        cur.minMoves,
        `${cur.label}(${cur.minMoves}) 应 ≥ ${prev.label}(${prev.minMoves}) × 1.7`,
      ).toBeGreaterThanOrEqual(prev.minMoves * 1.7);
    }
  });

  it("中低难度关的 minMoves 与 BFS 一致", () => {
    for (const level of LEVEL_PACK) {
      if (level.minMoves > 40) continue;
      expect(shortestSolutionMoves(level), level.label).toBe(level.minMoves);
    }
  });
});
