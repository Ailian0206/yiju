/** 扫雷规则:翻开/插旗/连锁清空,首击安全。 */

export type Cell = {
  mine: boolean;
  adjacent: number;
  revealed: boolean;
  flagged: boolean;
};

export type Board = {
  rows: number;
  cols: number;
  mines: number;
  cells: Cell[][];
  status: "playing" | "won" | "lost";
};

export type DifficultyId = "easy" | "normal" | "hard";

export const DIFFICULTIES: Record<
  DifficultyId,
  { id: DifficultyId; label: string; rows: number; cols: number; mines: number }
> = {
  easy: { id: "easy", label: "简单", rows: 8, cols: 8, mines: 10 },
  normal: { id: "normal", label: "普通", rows: 10, cols: 10, mines: 18 },
  hard: { id: "hard", label: "困难", rows: 12, cols: 12, mines: 30 },
};

function inBounds(board: Board, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < board.cols && y < board.rows;
}

function neighbors(board: Board, x: number, y: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (inBounds(board, nx, ny)) out.push([nx, ny]);
    }
  }
  return out;
}

function cloneBoard(board: Board): Board {
  return {
    ...board,
    cells: board.cells.map((row) => row.map((c) => ({ ...c }))),
  };
}

function recountAdjacent(board: Board): void {
  for (let y = 0; y < board.rows; y++) {
    for (let x = 0; x < board.cols; x++) {
      const cell = board.cells[y]![x]!;
      if (cell.mine) {
        cell.adjacent = 0;
        continue;
      }
      cell.adjacent = neighbors(board, x, y).filter(
        ([nx, ny]) => board.cells[ny]![nx]!.mine,
      ).length;
    }
  }
}

/**
 * 生成盘面; (safeX,safeY) 首击安全(该格及邻居不布雷,尽量满足)。
 */
export function createBoard(
  cfg: { rows: number; cols: number; mines: number },
  safeX: number,
  safeY: number,
  rng: () => number = Math.random,
): Board {
  const cells: Cell[][] = Array.from({ length: cfg.rows }, () =>
    Array.from({ length: cfg.cols }, () => ({
      mine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
    })),
  );
  const board: Board = {
    rows: cfg.rows,
    cols: cfg.cols,
    mines: cfg.mines,
    cells,
    status: "playing",
  };

  const forbidden = new Set<string>();
  forbidden.add(`${safeX},${safeY}`);
  for (const [nx, ny] of neighbors(board, safeX, safeY)) {
    forbidden.add(`${nx},${ny}`);
  }

  const candidates: Array<[number, number]> = [];
  for (let y = 0; y < cfg.rows; y++) {
    for (let x = 0; x < cfg.cols; x++) {
      if (!forbidden.has(`${x},${y}`)) candidates.push([x, y]);
    }
  }

  // Fisher–Yates 洗牌后取前 mines 格
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = candidates[i]!;
    candidates[i] = candidates[j]!;
    candidates[j] = tmp;
  }

  const mineCount = Math.min(cfg.mines, candidates.length);
  for (let i = 0; i < mineCount; i++) {
    const [x, y] = candidates[i]!;
    board.cells[y]![x]!.mine = true;
  }

  recountAdjacent(board);
  return board;
}

export function countFlags(board: Board): number {
  let n = 0;
  for (const row of board.cells) {
    for (const c of row) if (c.flagged) n += 1;
  }
  return n;
}

function checkWin(board: Board): boolean {
  for (const row of board.cells) {
    for (const c of row) {
      if (!c.mine && !c.revealed) return false;
    }
  }
  return true;
}

/** 翻开一格;空白连锁。 */
export function reveal(board: Board, x: number, y: number): Board {
  if (board.status !== "playing" || !inBounds(board, x, y)) return board;
  const next = cloneBoard(board);
  const cell = next.cells[y]![x]!;
  if (cell.revealed || cell.flagged) return board;

  if (cell.mine) {
    cell.revealed = true;
    // 败局展示全部雷
    for (const row of next.cells) {
      for (const c of row) {
        if (c.mine) c.revealed = true;
      }
    }
    next.status = "lost";
    return next;
  }

  const stack: Array<[number, number]> = [[x, y]];
  while (stack.length) {
    const [cx, cy] = stack.pop()!;
    const cur = next.cells[cy]![cx]!;
    if (cur.revealed || cur.flagged || cur.mine) continue;
    cur.revealed = true;
    if (cur.adjacent === 0) {
      for (const [nx, ny] of neighbors(next, cx, cy)) {
        stack.push([nx, ny]);
      }
    }
  }

  if (checkWin(next)) next.status = "won";
  return next;
}

export function toggleFlag(board: Board, x: number, y: number): Board {
  if (board.status !== "playing" || !inBounds(board, x, y)) return board;
  const cell = board.cells[y]![x]!;
  if (cell.revealed) return board;
  const next = cloneBoard(board);
  next.cells[y]![x]!.flagged = !cell.flagged;
  return next;
}
