/** 数独:9×9 行列宫不重复。 */

export type DifficultyId = "easy" | "normal" | "hard";

export type Level = {
  id: DifficultyId;
  label: string;
  /** 0=空,1-9=给定 */
  givens: number[][];
  solution: number[][];
};

export type Session = {
  difficulty: DifficultyId;
  grid: number[][];
  givenMask: boolean[][];
  status: "playing" | "won";
};

function parseRows(rows: string[]): number[][] {
  return rows.map((row) =>
    row
      .trim()
      .split(/\s+/)
      .map((n) => Number(n)),
  );
}

/** 经典难度梯度:空格越多、分支越多越难。 */
export const LEVELS: Record<DifficultyId, Level> = {
  easy: {
    id: "easy",
    label: "简单",
    // 经典入门盘:可顺推,但仍需观察行列宫
    givens: parseRows([
      "5 3 0 0 7 0 0 0 0",
      "6 0 0 1 9 5 0 0 0",
      "0 9 8 0 0 0 0 6 0",
      "8 0 0 0 6 0 0 0 3",
      "4 0 0 8 0 3 0 0 1",
      "7 0 0 0 2 0 0 0 6",
      "0 6 0 0 0 0 2 8 0",
      "0 0 0 4 1 9 0 0 5",
      "0 0 0 0 8 0 0 7 9",
    ]),
    solution: parseRows([
      "5 3 4 6 7 8 9 1 2",
      "6 7 2 1 9 5 3 4 8",
      "1 9 8 3 4 2 5 6 7",
      "8 5 9 7 6 1 4 2 3",
      "4 2 6 8 5 3 7 9 1",
      "7 1 3 9 2 4 8 5 6",
      "9 6 1 5 3 7 2 8 4",
      "2 8 7 4 1 9 6 3 5",
      "3 4 5 2 8 6 1 7 9",
    ]),
  },
  normal: {
    id: "normal",
    label: "普通",
    givens: parseRows([
      "0 0 0 2 6 0 7 0 1",
      "6 8 0 0 7 0 0 9 0",
      "1 9 0 0 0 4 5 0 0",
      "8 2 0 1 0 0 0 4 0",
      "0 0 4 6 0 2 9 0 0",
      "0 5 0 0 0 3 0 2 8",
      "0 0 9 3 0 0 0 7 4",
      "0 4 0 0 5 0 0 3 6",
      "7 0 3 0 1 8 0 0 0",
    ]),
    solution: parseRows([
      "4 3 5 2 6 9 7 8 1",
      "6 8 2 5 7 1 4 9 3",
      "1 9 7 8 3 4 5 6 2",
      "8 2 6 1 9 5 3 4 7",
      "3 7 4 6 8 2 9 1 5",
      "9 5 1 7 4 3 6 2 8",
      "5 1 9 3 2 6 8 7 4",
      "2 4 8 9 5 7 1 3 6",
      "7 6 3 4 1 8 2 5 9",
    ]),
  },
  hard: {
    id: "hard",
    label: "困难",
    givens: parseRows([
      "0 0 0 0 0 0 0 1 2",
      "0 0 0 0 3 5 0 0 0",
      "0 0 0 6 0 0 0 7 0",
      "7 0 0 0 0 0 3 0 0",
      "0 0 0 4 0 0 8 0 0",
      "1 0 0 0 0 0 0 0 0",
      "0 0 0 1 2 0 0 0 0",
      "0 8 0 0 0 0 0 4 0",
      "0 5 0 0 0 0 6 0 0",
    ]),
    solution: parseRows([
      "6 7 3 8 9 4 5 1 2",
      "9 1 2 7 3 5 4 8 6",
      "8 4 5 6 1 2 9 7 3",
      "7 9 8 2 6 1 3 5 4",
      "5 2 6 4 7 3 8 9 1",
      "1 3 4 5 8 9 2 6 7",
      "4 6 9 1 2 8 7 3 5",
      "2 8 7 3 5 6 1 4 9",
      "3 5 1 9 4 7 6 2 8",
    ]),
  },
};

export function createSession(difficulty: DifficultyId): Session {
  const level = LEVELS[difficulty];
  return {
    difficulty,
    grid: level.givens.map((r) => [...r]),
    givenMask: level.givens.map((r) => r.map((n) => n !== 0)),
    status: "playing",
  };
}

export function isValidPlacement(
  grid: number[][],
  row: number,
  col: number,
  value: number,
): boolean {
  if (value < 1 || value > 9) return false;
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row]![c] === value) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r]![col] === value) return false;
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if ((r !== row || c !== col) && grid[r]![c] === value) return false;
    }
  }
  return true;
}

/** 返回与当前格数字冲突的坐标。 */
export function conflictsAt(
  grid: number[][],
  row: number,
  col: number,
): string[] {
  const value = grid[row]![col]!;
  if (value === 0) return [];
  const hits: string[] = [];
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row]![c] === value) hits.push(`${c},${row}`);
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r]![col] === value) hits.push(`${col},${r}`);
  }
  const br = Math.floor(row / 3) * 3;
  const bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++) {
    for (let c = bc; c < bc + 3; c++) {
      if ((r !== row || c !== col) && grid[r]![c] === value) {
        hits.push(`${c},${r}`);
      }
    }
  }
  return hits;
}

export function setCell(
  session: Session,
  col: number,
  row: number,
  value: number,
): Session {
  if (session.status === "won") return session;
  if (session.givenMask[row]![col]) return session;
  if (value < 0 || value > 9) return session;
  const grid = session.grid.map((r) => [...r]);
  grid[row]![col] = value;
  const next: Session = { ...session, grid };
  if (isComplete(next)) return { ...next, status: "won" };
  return { ...next, status: "playing" };
}

export function isComplete(session: Session): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = session.grid[r]![c]!;
      if (v === 0 || !isValidPlacement(session.grid, r, c, v)) return false;
    }
  }
  return true;
}
