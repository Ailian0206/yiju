import { describe, expect, it } from "vitest";
import {
  BOARD_SIZE,
  FLEET,
  createGame,
  fire,
  remainingShipCells,
} from "./rules";

/** 固定序列伪随机:便于断言舰位。 */
function seqRng(values: number[]) {
  let i = 0;
  return () => {
    const v = values[i % values.length]!;
    i += 1;
    return v;
  };
}

describe("createGame(海战棋)", () => {
  it("生成 8×8 盘面并放下整支舰队", () => {
    const game = createGame(seqRng([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]));
    expect(game.size).toBe(BOARD_SIZE);
    expect(game.ships).toHaveLength(FLEET.length);
    expect(game.status).toBe("playing");
    expect(game.shots.size).toBe(0);

    const occupied = new Set<string>();
    for (const ship of game.ships) {
      const def = FLEET.find((f) => f.id === ship.id)!;
      expect(ship.cells).toHaveLength(def.length);
      expect(ship.sunk).toBe(false);
      for (const c of ship.cells) {
        expect(c.x).toBeGreaterThanOrEqual(0);
        expect(c.x).toBeLessThan(BOARD_SIZE);
        expect(c.y).toBeGreaterThanOrEqual(0);
        expect(c.y).toBeLessThan(BOARD_SIZE);
        const key = `${c.x},${c.y}`;
        expect(occupied.has(key)).toBe(false);
        occupied.add(key);
      }
    }
  });
});

describe("fire(海战棋)", () => {
  it("空格 miss;命中 hit;打完一艘 sunk;全灭 won", () => {
    // 人工摆盘:一艘长度 2 在 (0,0)-(1,0)
    const game = {
      size: 2,
      ships: [
        {
          id: "destroyer",
          name: "驱逐舰",
          cells: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
          ],
          sunk: false,
        },
      ],
      shots: new Map<string, "miss" | "hit">(),
      status: "playing" as const,
      shotCount: 0,
    };

    const miss = fire(game, 0, 1);
    expect(miss.result).toBe("miss");
    expect(miss.game.shots.get("0,1")).toBe("miss");
    expect(miss.game.shotCount).toBe(1);

    const hit = fire(miss.game, 0, 0);
    expect(hit.result).toBe("hit");
    expect(hit.game.ships[0]!.sunk).toBe(false);

    const sunk = fire(hit.game, 1, 0);
    expect(sunk.result).toBe("sunk");
    expect(sunk.game.ships[0]!.sunk).toBe(true);
    expect(sunk.game.status).toBe("won");
    expect(remainingShipCells(sunk.game)).toBe(0);
  });

  it("重复开火返回 already,不增加计数", () => {
    const game = createGame(seqRng([0.11, 0.22, 0.33, 0.44, 0.55]));
    const first = fire(game, 3, 3);
    const again = fire(first.game, 3, 3);
    expect(again.result).toBe("already");
    expect(again.game.shotCount).toBe(first.game.shotCount);
  });
});
