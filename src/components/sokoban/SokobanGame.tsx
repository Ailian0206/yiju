"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LEVELS,
  createSession,
  move,
  undo,
  type DifficultyId,
  type Dir,
  type Session,
} from "@/games/sokoban/rules";
import styles from "./SokobanGame.module.css";

const KEY_DIR: Record<string, Dir> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

/** 推箱子试玩:方向键/WASD 推动,可撤销。 */
export function SokobanGame() {
  const [diff, setDiff] = useState<DifficultyId>("easy");
  const [session, setSession] = useState<Session>(() =>
    createSession(LEVELS.easy),
  );

  function switchDiff(id: DifficultyId) {
    setDiff(id);
    setSession(createSession(LEVELS[id]));
  }

  function go(dir: Dir) {
    setSession((s) => move(s, dir));
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const dir = KEY_DIR[e.key] ?? KEY_DIR[e.key.toLowerCase()];
      if (!dir) return;
      e.preventDefault();
      setSession((s) => move(s, dir));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />
      <header className={styles.header}>
        <Link href="/challenges/sokoban" className={styles.back}>
          ← 返回介绍
        </Link>
        <p className={styles.eyebrow}>试玩 Demo · 推箱子</p>
        <h1 className={styles.title}>推箱子</h1>
        <p className={styles.lead}>
          把所有箱子推到圆点目标上。只能推、不能拉。方向键或 WASD
          移动;想岔了就撤销。先规划推序,卡住往往是推错了角。
        </p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.diffs} role="group" aria-label="难度">
          {(Object.keys(LEVELS) as DifficultyId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={styles.diffBtn}
              data-active={diff === id ? "1" : undefined}
              onClick={() => switchDiff(id)}
            >
              {LEVELS[id].label}
            </button>
          ))}
        </div>
        <p className={styles.status} data-phase={session.status}>
          {session.status === "won"
            ? `通关！共 ${session.moves} 步`
            : `${session.moves} 步`}
        </p>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => setSession((s) => undo(s))}
        >
          撤销
        </button>
        <button
          type="button"
          className={styles.restart}
          onClick={() => switchDiff(diff)}
        >
          重开
        </button>
      </div>

      <div
        className={styles.board}
        style={{
          gridTemplateColumns: `repeat(${session.width}, minmax(0, 2.4rem))`,
        }}
        role="grid"
        aria-label="推箱子盘面"
      >
        {Array.from({ length: session.height }, (_, y) =>
          Array.from({ length: session.width }, (_, x) => {
            const k = `${x},${y}`;
            const wall = session.walls.has(k);
            const goal = session.goals.has(k);
            const box = session.boxes.has(k);
            const player =
              session.player.x === x && session.player.y === y;
            return (
              <div
                key={k}
                role="gridcell"
                className={styles.cell}
                data-wall={wall ? "1" : undefined}
                data-goal={goal ? "1" : undefined}
                data-box={box ? "1" : undefined}
                data-player={player ? "1" : undefined}
              />
            );
          }),
        )}
      </div>

      <div className={styles.pad} aria-label="方向键">
        <span />
        <button type="button" onClick={() => go("up")}>
          ↑
        </button>
        <span />
        <button type="button" onClick={() => go("left")}>
          ←
        </button>
        <button type="button" onClick={() => go("down")}>
          ↓
        </button>
        <button type="button" onClick={() => go("right")}>
          →
        </button>
      </div>
    </div>
  );
}
