"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  LEVELS,
  checkBoard,
  createSession,
  cycleCell,
  type DifficultyId,
  type Session,
} from "@/games/nonogram/rules";
import styles from "./NonogramGame.module.css";

/** 数织试玩:行列线索推理填格;单击循环 空/黑/叉。 */
export function NonogramGame() {
  const [diff, setDiff] = useState<DifficultyId>("easy");
  const [session, setSession] = useState<Session>(() => createSession("easy"));
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);

  function switchDiff(id: DifficultyId) {
    setDiff(id);
    setSession(createSession(id));
    setErrors(new Set());
    setChecked(false);
  }

  function onCell(x: number, y: number) {
    if (session.status === "won") return;
    setSession(cycleCell(session, x, y));
    setErrors(new Set());
    setChecked(false);
  }

  function onCheck() {
    const result = checkBoard(session);
    setErrors(new Set(result.errors));
    setChecked(true);
  }

  const filled = useMemo(() => {
    let n = 0;
    for (const row of session.cells) {
      for (const c of row) if (c === "fill") n += 1;
    }
    return n;
  }, [session.cells]);

  const target = useMemo(() => {
    let n = 0;
    for (const row of session.solution) {
      for (const v of row) if (v === 1) n += 1;
    }
    return n;
  }, [session.solution]);

  const cellPx = session.size <= 5 ? 2.1 : session.size <= 10 ? 1.55 : 1.15;

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />
      <header className={styles.header}>
        <Link href="/challenges/nonogram" className={styles.back}>
          ← 返回介绍
        </Link>
        <p className={styles.eyebrow}>试玩 Demo · 数织</p>
        <h1 className={styles.title}>数织</h1>
        <p className={styles.lead}>
          根据上方与左侧数字线索填黑格。连续黑段长度必须与线索一致。单击循环:空→黑→叉→空。先推理再用「核对」查多填。
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
            ? "图案完成！"
            : checked && errors.size > 0
              ? `有 ${errors.size} 格多填了`
              : checked
                ? "暂无多填,继续推线索"
                : `已填 ${filled}/${target}`}
        </p>
        <button type="button" className={styles.secondary} onClick={onCheck}>
          核对
        </button>
        <button
          type="button"
          className={styles.restart}
          onClick={() => switchDiff(diff)}
        >
          重开
        </button>
      </div>

      <div className={styles.boardWrap}>
        <div
          className={styles.grid}
          style={{
            ["--size" as string]: session.size,
            ["--cell" as string]: `${cellPx}rem`,
          }}
        >
          <div className={styles.corner} />
          {session.colClues.map((clue, x) => (
            <div key={`c${x}`} className={styles.clueCol}>
              {clue.map((n, i) => (
                <span key={i}>{n}</span>
              ))}
            </div>
          ))}
          {session.rowClues.map((clue, y) => (
            // fragment 需要稳定 key:用行号包裹
            <div key={`r${y}`} className={styles.rowContents}>
              <div className={styles.clueRow}>
                {clue.map((n, i) => (
                  <span key={i}>{n}</span>
                ))}
              </div>
              {session.cells[y]!.map((cell, x) => (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  className={styles.cell}
                  data-state={cell}
                  data-error={errors.has(`${x},${y}`) ? "1" : undefined}
                  aria-label={`${x + 1},${y + 1}`}
                  onClick={() => onCell(x, y)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
