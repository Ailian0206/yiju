/** 推箱子:经典符号地图 → 可走/推箱/撤销/通关。 */

export type LevelTier = "easy" | "normal" | "hard";
export type Dir = "up" | "down" | "left" | "right";

export type Level = {
  id: string;
  index: number;
  label: string;
  tier: LevelTier;
  rows: string[];
  /** 已用 BFS 校验的最短通关步数(难度曲线依据) */
  minMoves: number;
};

export type Session = {
  levelId: string;
  levelIndex: number;
  tier: LevelTier;
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

const DIRS: Dir[] = ["up", "down", "left", "right"];

function key(x: number, y: number) {
  return `${x},${y}`;
}

/**
 * 关卡包:最短通关步数约每关翻倍(4→9→19→35→60)。
 * 符号: #墙 @人 $箱 .目标 +人在目标 *箱在目标
 */
export const LEVEL_PACK: Level[] = [
  {
    id: "1",
    index: 0,
    label: "第 1 关",
    tier: "easy",
    minMoves: 4,
    rows: [
      "#######",
      "#     #",
      "# @ $ #",
      "#   . #",
      "#     #",
      "#######",
    ],
  },
  {
    id: "2",
    index: 1,
    label: "第 2 关",
    tier: "easy",
    minMoves: 9,
    rows: [
      "########",
      "#      #",
      "# @ $  #",
      "#  ##  #",
      "#   .  #",
      "#      #",
      "########",
    ],
  },
  {
    id: "3",
    index: 2,
    label: "第 3 关",
    tier: "normal",
    minMoves: 19,
    rows: [
      "#########",
      "#       #",
      "# @ $ $ #",
      "#  ###  #",
      "#   . . #",
      "#       #",
      "#########",
    ],
  },
  {
    id: "4",
    index: 3,
    label: "第 4 关",
    tier: "normal",
    minMoves: 35,
    rows: [
      "#########",
      "#       #",
      "# $$@$$.#",
      "#  ###  #",
      "# ...   #",
      "#       #",
      "#########",
    ],
  },
  {
    id: "5",
    index: 4,
    label: "第 5 关",
    tier: "hard",
    minMoves: 60,
    rows: [
      "#############",
      "#           #",
      "# @ $ $ $   #",
      "#  #######  #",
      "#           #",
      "#         . #",
      "#        . .#",
      "#           #",
      "#############",
    ],
  },
];

const TIER_LABEL: Record<LevelTier, string> = {
  easy: "简单",
  normal: "普通",
  hard: "困难",
};

export function tierLabel(tier: LevelTier): string {
  return TIER_LABEL[tier];
}

export function createSession(level: Level = LEVEL_PACK[0]!): Session {
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
    levelId: level.id,
    levelIndex: level.index,
    tier: level.tier,
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
export function move(
  session: Session,
  dir: Dir,
): { session: Session; kind: "walk" | "push" | "blocked" } {
  if (session.status === "won") {
    return { session, kind: "blocked" };
  }
  const d = DELTA[dir];
  const nx = session.player.x + d.x;
  const ny = session.player.y + d.y;
  const nk = key(nx, ny);
  if (session.walls.has(nk)) {
    return { session, kind: "blocked" };
  }

  const history = [...session.history, snapshot(session)];

  if (!session.boxes.has(nk)) {
    const next: Session = {
      ...session,
      player: { x: nx, y: ny },
      moves: session.moves + 1,
      history,
    };
    return {
      session: isWon(next) ? { ...next, status: "won" } : next,
      kind: "walk",
    };
  }

  const bx = nx + d.x;
  const by = ny + d.y;
  const bk = key(bx, by);
  if (session.walls.has(bk) || session.boxes.has(bk)) {
    return { session, kind: "blocked" };
  }

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
  return {
    session: isWon(next)
      ? { ...next, status: "won" }
      : { ...next, status: "playing" },
    kind: "push",
  };
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

/** 状态指纹:箱子集合 + 人物位置。 */
function stateKey(boxes: Set<string>, player: { x: number; y: number }) {
  return `${[...boxes].sort().join(";")}|${player.x},${player.y}`;
}

type SearchNode = {
  boxes: Set<string>;
  player: { x: number; y: number };
  dist: number;
};

/** 最短通关步数(BFS);无解或超限返回 null。 */
export function shortestSolutionMoves(
  level: Level,
  maxStates = 2_500_000,
): number | null {
  const start = createSession(level);
  if (isWon(start)) return 0;

  const seen = new Set<string>();
  const queue: SearchNode[] = [
    { boxes: start.boxes, player: start.player, dist: 0 },
  ];
  seen.add(stateKey(start.boxes, start.player));
  let head = 0;

  while (head < queue.length) {
    if (seen.size > maxStates) return null;
    const cur = queue[head++]!;
    const base: Session = {
      ...start,
      boxes: cur.boxes,
      player: cur.player,
      moves: cur.dist,
      history: [],
      status: "playing",
    };
    for (const dir of DIRS) {
      const { session: next, kind } = move(base, dir);
      if (kind === "blocked") continue;
      if (isWon(next)) return cur.dist + 1;
      const sk = stateKey(next.boxes, next.player);
      if (seen.has(sk)) continue;
      seen.add(sk);
      queue.push({
        boxes: next.boxes,
        player: next.player,
        dist: cur.dist + 1,
      });
    }
  }
  return null;
}

/** BFS 判定关卡是否可解。 */
export function isLevelSolvable(level: Level, maxStates = 2_500_000): boolean {
  return shortestSolutionMoves(level, maxStates) !== null;
}
