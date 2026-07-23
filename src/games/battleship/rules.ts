/** 海战棋规则:玩家对隐藏舰队开火,命中/击沉反馈。 */

export const BOARD_SIZE = 8;

export const FLEET = [
  { id: "carrier", name: "航母", length: 4 },
  { id: "cruiser", name: "巡洋舰", length: 3 },
  { id: "destroyer", name: "驱逐舰", length: 2 },
] as const;

export type Cell = { x: number; y: number };
export type ShotMark = "miss" | "hit";
export type FireResult = "miss" | "hit" | "sunk" | "already";

export type Ship = {
  id: string;
  name: string;
  cells: Cell[];
  sunk: boolean;
};

export type BattleshipGame = {
  size: number;
  ships: Ship[];
  shots: Map<string, ShotMark>;
  status: "playing" | "won";
  shotCount: number;
};

function key(x: number, y: number): string {
  return `${x},${y}`;
}

function cellsOverlap(a: Cell[], occupied: Set<string>): boolean {
  return a.some((c) => occupied.has(key(c.x, c.y)));
}

/** 枚举全部合法落点后按 rng 挑选,避免退化随机卡死。 */
function placeShip(
  length: number,
  size: number,
  occupied: Set<string>,
  rng: () => number,
): Cell[] {
  const candidates: Cell[][] = [];
  for (const horizontal of [true, false]) {
    const maxX = horizontal ? size - length : size - 1;
    const maxY = horizontal ? size - 1 : size - length;
    for (let x0 = 0; x0 <= maxX; x0++) {
      for (let y0 = 0; y0 <= maxY; y0++) {
        const cells: Cell[] = [];
        for (let i = 0; i < length; i++) {
          cells.push(horizontal ? { x: x0 + i, y: y0 } : { x: x0, y: y0 + i });
        }
        if (!cellsOverlap(cells, occupied)) candidates.push(cells);
      }
    }
  }
  if (candidates.length === 0) throw new Error("无法放置舰船");
  const pick = Math.floor(rng() * candidates.length) % candidates.length;
  return candidates[pick]!;
}

/** 开局随机布阵。 */
export function createGame(rng: () => number = Math.random): BattleshipGame {
  const occupied = new Set<string>();
  const ships: Ship[] = [];
  for (const def of FLEET) {
    const cells = placeShip(def.length, BOARD_SIZE, occupied, rng);
    for (const c of cells) occupied.add(key(c.x, c.y));
    ships.push({ id: def.id, name: def.name, cells, sunk: false });
  }
  return {
    size: BOARD_SIZE,
    ships,
    shots: new Map(),
    status: "playing",
    shotCount: 0,
  };
}

export function remainingShipCells(game: BattleshipGame): number {
  let n = 0;
  for (const ship of game.ships) {
    if (ship.sunk) continue;
    for (const c of ship.cells) {
      if (game.shots.get(key(c.x, c.y)) !== "hit") n += 1;
    }
  }
  return n;
}

/** 对 (x,y) 开火;已开火格返回 already。 */
export function fire(
  game: BattleshipGame,
  x: number,
  y: number,
): { game: BattleshipGame; result: FireResult } {
  if (game.status !== "playing") {
    return { game, result: "already" };
  }
  const k = key(x, y);
  if (game.shots.has(k)) {
    return { game, result: "already" };
  }

  const shots = new Map(game.shots);
  const ship = game.ships.find((s) =>
    s.cells.some((c) => c.x === x && c.y === y),
  );

  if (!ship) {
    shots.set(k, "miss");
    return {
      game: { ...game, shots, shotCount: game.shotCount + 1 },
      result: "miss",
    };
  }

  shots.set(k, "hit");
  const allHit = ship.cells.every((c) => shots.get(key(c.x, c.y)) === "hit");
  const ships = game.ships.map((s) =>
    s.id === ship.id ? { ...s, sunk: allHit } : s,
  );
  const won = ships.every((s) => s.sunk);
  return {
    game: {
      ...game,
      ships,
      shots,
      shotCount: game.shotCount + 1,
      status: won ? "won" : "playing",
    },
    result: allHit ? "sunk" : "hit",
  };
}
