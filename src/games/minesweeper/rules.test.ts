import { describe, expect, it } from "vitest";
import {
  DIFFICULTIES,
  createBoard,
  reveal,
  toggleFlag,
  countFlags,
  type Board,
} from "./rules";

function fixedRng(values: number[]) {
  let i = 0;
  return () => {
    const v = values[i % values.length]!;
    i += 1;
    return v;
  };
}

describe("createBoard(扫雷)", () => {
  it("简单档生成指定雷数,开局格不含雷", () => {
    const cfg = DIFFICULTIES.easy;
    const board = createBoard(cfg, 0, 0, fixedRng([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]));
    expect(board.rows).toBe(cfg.rows);
    expect(board.cols).toBe(cfg.cols);
    expect(board.status).toBe("playing");

    let mines = 0;
    for (let y = 0; y < board.rows; y++) {
      for (let x = 0; x < board.cols; x++) {
        if (board.cells[y]![x]!.mine) mines += 1;
      }
    }
    expect(mines).toBe(cfg.mines);
    expect(board.cells[0]![0]!.mine).toBe(false);
  });
});

describe("reveal / flag(扫雷)", () => {
  it("点开空白会连锁翻开邻居", () => {
    // 3×3,仅右下角一雷 → 点左上应翻开多格
    const board = {
      rows: 3,
      cols: 3,
      mines: 1,
      status: "playing" as const,
      cells: [
        [
          { mine: false, adjacent: 0, revealed: false, flagged: false },
          { mine: false, adjacent: 0, revealed: false, flagged: false },
          { mine: false, adjacent: 1, revealed: false, flagged: false },
        ],
        [
          { mine: false, adjacent: 0, revealed: false, flagged: false },
          { mine: false, adjacent: 1, revealed: false, flagged: false },
          { mine: false, adjacent: 1, revealed: false, flagged: false },
        ],
        [
          { mine: false, adjacent: 1, revealed: false, flagged: false },
          { mine: false, adjacent: 1, revealed: false, flagged: false },
          { mine: true, adjacent: 0, revealed: false, flagged: false },
        ],
      ],
    };

    const next = reveal(board, 0, 0);
    expect(next.cells[0]![0]!.revealed).toBe(true);
    expect(next.cells[0]![1]!.revealed).toBe(true);
    expect(next.cells[1]![0]!.revealed).toBe(true);
    expect(next.cells[2]![2]!.revealed).toBe(false);
    // 除雷外全部可连锁翻开 → 直接胜利
    expect(next.status).toBe("won");
  });

  it("点到雷即败;清完非雷格即胜", () => {
    const board = {
      rows: 2,
      cols: 2,
      mines: 1,
      status: "playing" as const,
      cells: [
        [
          { mine: false, adjacent: 1, revealed: false, flagged: false },
          { mine: false, adjacent: 1, revealed: false, flagged: false },
        ],
        [
          { mine: false, adjacent: 1, revealed: false, flagged: false },
          { mine: true, adjacent: 0, revealed: false, flagged: false },
        ],
      ],
    };

    const boom = reveal(board, 1, 1);
    expect(boom.status).toBe("lost");

    let win: Board = board;
    win = reveal(win, 0, 0);
    win = reveal(win, 1, 0);
    win = reveal(win, 0, 1);
    expect(win.status).toBe("won");
  });

  it("插旗/取消插旗,已翻开不可插旗", () => {
    const board = createBoard(DIFFICULTIES.easy, 2, 2, () => 0.5);
    const flagged = toggleFlag(board, 0, 0);
    expect(flagged.cells[0]![0]!.flagged).toBe(true);
    expect(countFlags(flagged)).toBe(1);

    const cleared = toggleFlag(flagged, 0, 0);
    expect(cleared.cells[0]![0]!.flagged).toBe(false);

    const opened = reveal(board, 1, 1);
    const noop = toggleFlag(opened, 1, 1);
    expect(noop.cells[1]![1]!.flagged).toBe(false);
  });
});
