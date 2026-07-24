"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LEVELS,
  conflictsAt,
  createSession,
  setCell,
  type DifficultyId,
  type Session,
} from "@/games/sudoku/rules";
import styles from "./SudokuGame.module.css";

/** 数独:选格后点数字填入;冲突高亮;三档难度。 */
export function SudokuGame() {
  const [diff, setDiff] = useState<DifficultyId>("easy");
  const [session, setSession] = useState<Session>(() => createSession("easy"));
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(
    null,
  );

  function switchDiff(id: DifficultyId) {
    setDiff(id);
    setSession(createSession(id));
    setSelected(null);
  }

  function pick(r: number, c: number) {
    if (session.status === "won") return;
    if (session.givenMask[r]![c]) {
      setSelected({ r, c });
      return;
    }
    setSelected({ r, c });
  }

  function enter(value: number) {
    if (!selected || session.status === "won") return;
    if (session.givenMask[selected.r]![selected.c]) return;
    setSession(setCell(session, selected.c, selected.r, value));
  }

  const conflictKeys = useMemo(() => {
    const keys = new Set<string>();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (session.grid[r]![c] === 0) continue;
        for (const k of conflictsAt(session.grid, r, c)) keys.add(k);
        if (conflictsAt(session.grid, r, c).length) keys.add(`${c},${r}`);
      }
    }
    return keys;
  }, [session.grid]);

  const emptyLeft = useMemo(() => {
    let n = 0;
    for (const row of session.grid) for (const v of row) if (v === 0) n += 1;
    return n;
  }, [session.grid]);

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />
      <header className={styles.header}>
        <Link href="/challenges/sudoku" className={styles.back}>
          ← 返回介绍
        </Link>
        <p className={styles.eyebrow}>挑战局 · 数独</p>
        <h1 className={styles.title}>数独</h1>
        <p className={styles.lead}>
          每行、每列、每个 3×3 宫都要填入 1–9 且不重复。先点空格,再点下方数字。冲突格会标红。困难档空格更多,需要候选与排除。
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
            ? "全部填对,通关！"
            : `剩余 ${emptyLeft} 格${conflictKeys.size ? ` · ${conflictKeys.size} 处冲突` : ""}`}
        </p>
        <button
          type="button"
          className={styles.restart}
          onClick={() => switchDiff(diff)}
        >
          重开
        </button>
      </div>

      <div className={styles.board} role="grid" aria-label="数独盘面">
        {session.grid.map((row, r) =>
          row.map((value, c) => {
            const thickR = r % 3 === 0;
            const thickC = c % 3 === 0;
            const key = `${c},${r}`;
            return (
              <button
                key={key}
                type="button"
                role="gridcell"
                className={styles.cell}
                data-given={session.givenMask[r]![c] ? "1" : "0"}
                data-selected={
                  selected?.r === r && selected?.c === c ? "1" : undefined
                }
                data-conflict={conflictKeys.has(key) ? "1" : undefined}
                data-edge-r={thickR ? "1" : undefined}
                data-edge-c={thickC ? "1" : undefined}
                onClick={() => pick(r, c)}
              >
                {value || ""}
              </button>
            );
          }),
        )}
      </div>

      <div className={styles.pad} role="group" aria-label="数字键盘">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            type="button"
            className={styles.padBtn}
            onClick={() => enter(n)}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className={styles.padBtn}
          onClick={() => enter(0)}
        >
          清除
        </button>
      </div>
    </div>
  );
}
