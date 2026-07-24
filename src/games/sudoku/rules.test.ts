import { describe, expect, it } from "vitest";
import {
  LEVELS,
  createSession,
  isComplete,
  isValidPlacement,
  setCell,
  conflictsAt,
} from "./rules";

describe("sudoku rules", () => {
  it("三档关卡均为 9×9,题面有空格", () => {
    for (const id of ["easy", "normal", "hard"] as const) {
      const level = LEVELS[id];
      expect(level.givens).toHaveLength(9);
      expect(level.solution).toHaveLength(9);
      let empties = 0;
      for (let r = 0; r < 9; r++) {
        expect(level.givens[r]).toHaveLength(9);
        expect(level.solution[r]).toHaveLength(9);
        for (let c = 0; c < 9; c++) {
          if (level.givens[r]![c] === 0) empties += 1;
          else expect(level.givens[r]![c]).toBe(level.solution[r]![c]);
        }
      }
      expect(empties).toBeGreaterThan(20);
    }
  });

  it("开局保留题面数字且不可改给定格", () => {
    const s = createSession("easy");
    expect(s.grid[0]![0]).toBe(LEVELS.easy.givens[0]![0]);
    const blocked = setCell(s, 0, 0, 9);
    expect(blocked.grid[0]![0]).toBe(s.grid[0]![0]);
  });

  it("同行同列同宫冲突检测;填满正确解即完成", () => {
    let s = createSession("easy");
    // 找一个空格,故意填冲突
    let emptyR = -1;
    let emptyC = -1;
    outer: for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (LEVELS.easy.givens[r]![c] === 0) {
          emptyR = r;
          emptyC = c;
          break outer;
        }
      }
    }
    const peer = s.grid[emptyR]!.find((n) => n > 0)!;
    s = setCell(s, emptyC, emptyR, peer);
    expect(isValidPlacement(s.grid, emptyR, emptyC, peer)).toBe(false);
    expect(conflictsAt(s.grid, emptyR, emptyC).length).toBeGreaterThan(0);

    // 填满正确解
    s = createSession("easy");
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (LEVELS.easy.givens[r]![c] === 0) {
          s = setCell(s, c, r, LEVELS.easy.solution[r]![c]!);
        }
      }
    }
    expect(isComplete(s)).toBe(true);
    expect(s.status).toBe("won");
  });
});
