/** 数织(Nonogram):根据行列线索填黑格。 */

export type CellState = "empty" | "fill" | "mark";
export type DifficultyId = "easy" | "normal" | "hard";

export type Level = {
  id: DifficultyId;
  label: string;
  size: number;
  /** 1=应填黑,0=应留白 */
  solution: number[][];
};

export type Session = {
  difficulty: DifficultyId;
  size: number;
  rowClues: number[][];
  colClues: number[][];
  cells: CellState[][];
  status: "playing" | "won";
  solution: number[][];
};

/** 手工关卡:线索需行列交叉推理,非点满即过。 */
export const LEVELS: Record<DifficultyId, Level> = {
  easy: {
    id: "easy",
    label: "简单 5×5",
    size: 5,
    // 菱形环:多行线索相同,必须靠列交叉锁定
    solution: [
      [0, 1, 1, 1, 0],
      [1, 0, 1, 0, 1],
      [1, 1, 0, 1, 1],
      [1, 0, 1, 0, 1],
      [0, 1, 1, 1, 0],
    ],
  },
  normal: {
    id: "normal",
    label: "普通 10×10",
    size: 10,
    // 交错走廊:大量 [1,1]/[2,2] 类线索,需要标记排除
    solution: [
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
      [1, 1, 0, 1, 0, 0, 1, 0, 1, 1],
      [1, 1, 0, 1, 0, 0, 1, 0, 1, 1],
      [1, 0, 0, 1, 1, 1, 1, 0, 0, 1],
      [0, 1, 1, 1, 0, 0, 1, 1, 1, 0],
      [1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
      [1, 1, 0, 0, 1, 1, 0, 0, 1, 1],
    ],
  },
  hard: {
    id: "hard",
    label: "困难 15×15",
    size: 15,
    // 大盘面不对称图案,逼迫分段线索推进
    solution: [
      [0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0],
      [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
      [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
      [0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0],
      [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
      [1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1],
      [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
      [0, 1, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0],
      [1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1],
      [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
      [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1],
      [0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0],
      [0, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0],
    ],
  },
};

/** 一行/一列的连续黑段 → 线索。全空为 [0]。 */
export function cellClues(line: number[]): number[] {
  const clues: number[] = [];
  let run = 0;
  for (const v of line) {
    if (v === 1) run += 1;
    else if (run > 0) {
      clues.push(run);
      run = 0;
    }
  }
  if (run > 0) clues.push(run);
  return clues.length ? clues : [0];
}

function colLine(grid: number[][], x: number): number[] {
  return grid.map((row) => row[x]!);
}

export function createSession(difficulty: DifficultyId): Session {
  const level = LEVELS[difficulty];
  const rowClues = level.solution.map((row) => cellClues(row));
  const colClues = Array.from({ length: level.size }, (_, x) =>
    cellClues(colLine(level.solution, x)),
  );
  return {
    difficulty,
    size: level.size,
    rowClues,
    colClues,
    cells: Array.from({ length: level.size }, () =>
      Array.from({ length: level.size }, () => "empty" as CellState),
    ),
    status: "playing",
    solution: level.solution.map((r) => [...r]),
  };
}

/** 单击循环:空→填黑→叉掉→空。 */
export function cycleCell(session: Session, x: number, y: number): Session {
  if (session.status === "won") return session;
  const cur = session.cells[y]![x]!;
  const nextState: CellState =
    cur === "empty" ? "fill" : cur === "fill" ? "mark" : "empty";
  const cells = session.cells.map((row, ry) =>
    row.map((c, cx) => (ry === y && cx === x ? nextState : c)),
  );
  const next: Session = { ...session, cells };
  if (isWon(next)) return { ...next, status: "won" };
  return next;
}

export function isWon(session: Session): boolean {
  for (let y = 0; y < session.size; y++) {
    for (let x = 0; x < session.size; x++) {
      const shouldFill = session.solution[y]![x] === 1;
      const filled = session.cells[y]![x] === "fill";
      if (shouldFill !== filled) return false;
    }
  }
  return true;
}

/** 对照题解检查:多填的黑格记为错误(叉与空都算「未填」)。 */
export function checkBoard(session: Session): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  for (let y = 0; y < session.size; y++) {
    for (let x = 0; x < session.size; x++) {
      if (session.cells[y]![x] === "fill" && session.solution[y]![x] !== 1) {
        errors.push(`${x},${y}`);
      }
    }
  }
  return { ok: errors.length === 0 && isWon(session), errors };
}
