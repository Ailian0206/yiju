/** 推箱子:经典符号地图 → 可走/推箱/撤销/通关。 */

export type DifficultyId = "easy" | "normal" | "hard";
export type Dir = "up" | "down" | "left" | "right";

export type Level = {
  id: DifficultyId;
  label: string;
  rows: string[];
};

export type Session = {
  difficulty: DifficultyId;
  width: number;
  height: number;
  walls: Set<string>;
  goals: Set<string>;
  boxes: Set<string>;
  player: { x: number; y: number };
  status: "playing" | "won";
  moves: number;
  history: Array<{
    boxes: string[];
    player: { x: number; y: number };
    moves: number;
  }>;
};

const DELTA: Record<Dir, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

function key(x: number, y: number) {
  return `${x},${y}`;
}

/** 经典短关:先易后难,均需规划推序。 */
export const LEVELS: Record<DifficultyId, Level> = {
  easy: {
    id: "easy",
    label: "简单",
    // 两箱两目标,需绕行再推
    rows: ["######", "#@ $.#", "# $ .#", "#    #", "######"],
  },
  normal: {
    id: "normal",
    label: "普通",
    rows: [
      "########",
      "#      #",
      "# @$   #",
      "# $$  .#",
      "#  .  .#",
      "########",
    ],
  },
  hard: {
    id: "hard",
    label: "困难",
    rows: [
      "##########",
      "#   .    #",
      "# $$ $@$ #",
      "#   . .  #",
      "#  $$$   #",
      "#   . .  #",
      "##########",
    ],
  },
};

export function createSession(
  level: Level = LEVELS.easy,
): Session {
  const walls = new Set<string>();
  const goals = new Set<string>();
  const boxes = new Set<string>();
  let player = { x: 0, y: 0 };
  const height = level.rows.length;
  const width = Math.max(...level.rows.map((r) => r.length));

  for (let y = 0; y < height; y++) {
    const row = level.rows[y]!.padEnd(width, " ");
    for (let x = 0; x < width; x++) {
      const ch = row[x]!;
      const k = key(x, y);
      if (ch === "#") walls.add(k);
      if (ch === "." || ch === "+" || ch === "*") goals.add(k);
      if (ch === "$" || ch === "*") boxes.add(k);
      if (ch === "@" || ch === "+") player = { x, y };
    }
  }

  return {
    difficulty: level.id,
    width,
    height,
    walls,
    goals,
    boxes,
    player,
    status: "playing",
    moves: 0,
    history: [],
  };
}

export function isWon(session: Session): boolean {
  for (const g of session.goals) {
    if (!session.boxes.has(g)) return false;
  }
  return session.goals.size > 0;
}

function snapshot(session: Session) {
  return {
    boxes: [...session.boxes],
    player: { ...session.player },
    moves: session.moves,
  };
}

/** 朝向移动;推箱需前方第二格可入。 */
export function move(session: Session, dir: Dir): Session {
  if (session.status === "won") return session;
  const d = DELTA[dir];
  const nx = session.player.x + d.x;
  const ny = session.player.y + d.y;
  const nk = key(nx, ny);
  if (session.walls.has(nk)) return session;

  const history = [...session.history, snapshot(session)];

  if (!session.boxes.has(nk)) {
    const next: Session = {
      ...session,
      player: { x: nx, y: ny },
      moves: session.moves + 1,
      history,
    };
    return isWon(next) ? { ...next, status: "won" } : next;
  }

  const bx = nx + d.x;
  const by = ny + d.y;
  const bk = key(bx, by);
  if (session.walls.has(bk) || session.boxes.has(bk)) return session;

  const boxes = new Set(session.boxes);
  boxes.delete(nk);
  boxes.add(bk);
  const next: Session = {
    ...session,
    boxes,
    player: { x: nx, y: ny },
    moves: session.moves + 1,
    history,
  };
  return isWon(next) ? { ...next, status: "won" } : { ...next, status: "playing" };
}

export function undo(session: Session): Session {
  if (session.history.length === 0) return session;
  const prev = session.history[session.history.length - 1]!;
  return {
    ...session,
    boxes: new Set(prev.boxes),
    player: { ...prev.player },
    moves: prev.moves,
    history: session.history.slice(0, -1),
    status: "playing",
  };
}
