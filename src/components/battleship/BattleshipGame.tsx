"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  createGame,
  fire,
  type BattleshipGame,
  type FireResult,
} from "@/games/battleship/rules";
import styles from "./BattleshipGame.module.css";

function cellKey(x: number, y: number) {
  return `${x},${y}`;
}

/** 海战棋试玩:点击开火,命中/击沉反馈。 */
export function BattleshipGame() {
  const [game, setGame] = useState<BattleshipGame>(() => createGame());
  const [last, setLast] = useState<FireResult | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const sunkCount = useMemo(
    () => game.ships.filter((s) => s.sunk).length,
    [game.ships],
  );

  function onFire(x: number, y: number) {
    if (game.status !== "playing") return;
    const { game: next, result } = fire(game, x, y);
    setGame(next);
    setLast(result);
    if (result !== "already") {
      setFlash(cellKey(x, y));
      window.setTimeout(() => setFlash(null), 280);
    }
  }

  function restart() {
    setGame(createGame());
    setLast(null);
    setFlash(null);
  }

  const lastLabel =
    last === "miss"
      ? "未命中"
      : last === "hit"
        ? "命中！"
        : last === "sunk"
          ? "击沉一艘！"
          : last === "already"
            ? "这里已经打过"
            : "点格子开火";

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />
      <header className={styles.header}>
        <Link href="/challenges/battleship" className={styles.back}>
          ← 返回介绍
        </Link>
        <p className={styles.eyebrow}>试玩 Demo · 海战棋</p>
        <h1 className={styles.title}>海战棋</h1>
        <p className={styles.lead}>
          敌方舰队已隐藏布阵。点格子开火——未命中 / 命中 / 击沉。打沉全部即胜。
        </p>
      </header>

      <div className={styles.toolbar}>
        <p className={styles.status} data-phase={game.status}>
          {game.status === "won"
            ? `胜利！共用 ${game.shotCount} 发`
            : `开火 ${game.shotCount} · 击沉 ${sunkCount}/${game.ships.length} · ${lastLabel}`}
        </p>
        <button type="button" className={styles.restart} onClick={restart}>
          重新开局
        </button>
      </div>

      <div
        className={styles.board}
        style={{ gridTemplateColumns: `repeat(${game.size}, minmax(0, 1fr))` }}
        role="grid"
        aria-label="海战棋盘"
      >
        {Array.from({ length: game.size }, (_, y) =>
          Array.from({ length: game.size }, (_, x) => {
            const mark = game.shots.get(cellKey(x, y));
            const ship = game.ships.find((s) =>
              s.cells.some((c) => c.x === x && c.y === y),
            );
            const showShip =
              game.status === "won" && ship
                ? ship.sunk
                  ? "sunk"
                  : "ship"
                : null;
            const k = cellKey(x, y);
            return (
              <button
                key={k}
                type="button"
                role="gridcell"
                className={styles.cell}
                data-mark={mark ?? showShip ?? "empty"}
                data-flash={flash === k ? "1" : undefined}
                disabled={game.status !== "playing" || Boolean(mark)}
                aria-label={`${x + 1},${y + 1}${mark ? ` ${mark}` : ""}`}
                onClick={() => onFire(x, y)}
              />
            );
          }),
        )}
      </div>

      <ul className={styles.fleet}>
        {game.ships.map((s) => (
          <li key={s.id} data-sunk={s.sunk ? "1" : "0"}>
            {s.name}
            <span>{s.cells.length} 格</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
