"use client";

import Link from "next/link";
import { useState, type MouseEvent } from "react";
import {
  DIFFICULTIES,
  countFlags,
  createBoard,
  reveal,
  toggleFlag,
  type Board,
  type DifficultyId,
} from "@/games/minesweeper/rules";
import styles from "./MinesweeperGame.module.css";

/** 扫雷试玩:左键翻开,右键插旗;首击安全。 */
export function MinesweeperGame() {
  const [diff, setDiff] = useState<DifficultyId>("easy");
  const [board, setBoard] = useState<Board | null>(null);
  const cfg = DIFFICULTIES[diff];

  function startFresh(nextDiff: DifficultyId = diff) {
    setDiff(nextDiff);
    setBoard(null);
  }

  function ensureBoard(x: number, y: number): Board {
    if (board) return board;
    return createBoard(DIFFICULTIES[diff], x, y);
  }

  function onReveal(x: number, y: number) {
    if (board?.status === "won" || board?.status === "lost") return;
    const base = ensureBoard(x, y);
    const next = reveal(base, x, y);
    setBoard(next);
  }

  function onFlag(e: MouseEvent, x: number, y: number) {
    e.preventDefault();
    if (!board || board.status !== "playing") return;
    setBoard(toggleFlag(board, x, y));
  }

  const flags = board ? countFlags(board) : 0;
  const statusText = !board
    ? "点任意格开始(首击安全)"
    : board.status === "won"
      ? "扫清！胜利"
      : board.status === "lost"
        ? "踩雷了…"
        : `剩余雷约 ${cfg.mines - flags}`;

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />
      <header className={styles.header}>
        <Link href="/challenges/minesweeper" className={styles.back}>
          ← 返回介绍
        </Link>
        <p className={styles.eyebrow}>试玩 Demo · 扫雷</p>
        <h1 className={styles.title}>扫雷</h1>
        <p className={styles.lead}>
          左键翻开,右键插旗。数字表示周围八格有几颗雷。清完所有安全格即胜。
        </p>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.diffs} role="group" aria-label="难度">
          {(Object.keys(DIFFICULTIES) as DifficultyId[]).map((id) => (
            <button
              key={id}
              type="button"
              className={styles.diffBtn}
              data-active={diff === id ? "1" : undefined}
              onClick={() => startFresh(id)}
            >
              {DIFFICULTIES[id].label}
            </button>
          ))}
        </div>
        <p className={styles.status} data-phase={board?.status ?? "idle"}>
          {statusText}
        </p>
        <button type="button" className={styles.restart} onClick={() => startFresh()}>
          重新开局
        </button>
      </div>

      <div
        className={styles.board}
        style={{
          gridTemplateColumns: `repeat(${cfg.cols}, minmax(0, 1fr))`,
        }}
        role="grid"
        aria-label="扫雷盘面"
      >
        {Array.from({ length: cfg.rows }, (_, y) =>
          Array.from({ length: cfg.cols }, (_, x) => {
            const cell = board?.cells[y]?.[x];
            const revealed = cell?.revealed ?? false;
            const flagged = cell?.flagged ?? false;
            const mine = cell?.mine ?? false;
            const adj = cell?.adjacent ?? 0;
            let label = "";
            if (revealed && mine) label = "雷";
            else if (revealed && adj > 0) label = String(adj);
            else if (flagged) label = "旗";

            return (
              <button
                key={`${x},${y}`}
                type="button"
                role="gridcell"
                className={styles.cell}
                data-revealed={revealed ? "1" : "0"}
                data-flagged={flagged ? "1" : "0"}
                data-mine={revealed && mine ? "1" : "0"}
                data-adj={revealed && !mine ? adj : undefined}
                disabled={board?.status === "won" || board?.status === "lost"}
                aria-label={`${x + 1},${y + 1}${label ? ` ${label}` : ""}`}
                onClick={() => onReveal(x, y)}
                onContextMenu={(e) => onFlag(e, x, y)}
              >
                {revealed && mine
                  ? "●"
                  : revealed && adj > 0
                    ? adj
                    : flagged
                      ? "▲"
                      : ""}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
