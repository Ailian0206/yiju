import { describe, expect, it } from "vitest";
import {
  cellClues,
  checkBoard,
  createSession,
  cycleCell,
  isWon,
  LEVELS,
} from "./rules";

describe("cellClues(数织)", () => {
  it("把一行连续黑格压成线索数组", () => {
    expect(cellClues([0, 1, 1, 0, 1])).toEqual([2, 1]);
    expect(cellClues([0, 0, 0])).toEqual([0]);
    expect(cellClues([1, 1, 1])).toEqual([3]);
  });
});

describe("createSession / cycleCell / checkBoard", () => {
  it("开局盘面全空,线索与题解一致", () => {
    const session = createSession("easy");
    const level = LEVELS.easy;
    expect(session.size).toBe(level.size);
    expect(session.rowClues).toEqual(
      level.solution.map((row) => cellClues(row)),
    );
    expect(session.cells.every((row) => row.every((c) => c === "empty"))).toBe(
      true,
    );
    expect(session.status).toBe("playing");
  });

  it("左键循环:空→填→叉→空", () => {
    let s = createSession("easy");
    s = cycleCell(s, 0, 0);
    expect(s.cells[0]![0]).toBe("fill");
    s = cycleCell(s, 0, 0);
    expect(s.cells[0]![0]).toBe("mark");
    s = cycleCell(s, 0, 0);
    expect(s.cells[0]![0]).toBe("empty");
  });

  it("按题解填满后 isWon;错填 checkBoard 标错", () => {
    const level = LEVELS.easy;
    let s = createSession("easy");
    for (let y = 0; y < level.size; y++) {
      for (let x = 0; x < level.size; x++) {
        if (level.solution[y]![x] === 1) {
          s = cycleCell(s, x, y); // empty -> fill
        }
      }
    }
    expect(isWon(s)).toBe(true);
    expect(checkBoard(s).ok).toBe(true);

    // 多填一格(若该空位存在)
    let wrong = createSession("easy");
    wrong = cycleCell(wrong, 0, 0);
    if (level.solution[0]![0] === 0) {
      const result = checkBoard(wrong);
      expect(result.ok).toBe(false);
      expect(result.errors).toContain("0,0");
    }
  });
});
