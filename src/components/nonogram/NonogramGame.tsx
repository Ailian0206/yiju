"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  getBestServerSnapshot,
  getBestSnapshot,
  recordIfBetter,
  subscribeBest,
} from "@/challenges/bestStore";
import {
  LEVELS,
  checkBoard,
  createSession,
  cycleCell,
  type DifficultyId,
  type Session,
} from "@/games/nonogram/rules";
import styles from "./NonogramGame.module.css";

const BEST_KEY = "yiju-nonogram-best";

/** 数织:行列线索推理填格;单击循环 空/黑/叉;本机最短用时。 */
export function NonogramGame() {
  const [diff, setDiff] = useState<DifficultyId>("easy");
  const [session, setSession] = useState<Session>(() => createSession("easy"));
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [checked, setChecked] = useState(false);
  const [wroteNewBest, setWroteNewBest] = useState(false);
  const startedAt = useRef(Date.now());

  const best = useSyncExternalStore(
    (cb) => subscribeBest(BEST_KEY, cb),
    () => getBestSnapshot(BEST_KEY),
    () => getBestServerSnapshot(BEST_KEY),
  );

  function switchDiff(id: DifficultyId) {
    setDiff(id);
    setSession(createSession(id));
    setErrors(new Set());
    setChecked(false);
    setWroteNewBest(false);
    startedAt.current = Date.now();
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

  useEffect(() => {
    if (session.status !== "won") return;
    const secs = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    setWroteNewBest(recordIfBetter(BEST_KEY, diff, secs));
  }, [session.status, diff]);

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

  // 小盘面放大格宽,大盘面按视口收缩,避免 5×5 看起来像玩具格
  const cellCss =
    session.size <= 5
      ? "clamp(3.2rem, 14vw, 4.4rem)"
      : session.size <= 10
        ? "clamp(1.9rem, 6.5vw, 2.6rem)"
        : "clamp(1.35rem, 4.2vw, 1.85rem)";

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />
      <header className={styles.header}>
        <Link href="/challenges/nonogram" className={styles.back}>
          ← 返回介绍
        </Link>
        <p className={styles.eyebrow}>挑战局 · 数织</p>
        <h1 className={styles.title}>数织</h1>
        <p className={styles.lead}>
          上方/左侧的数字 = 这一行或这一列里「连续黑格」的长度。单击格子循环:空→黑→叉→空。
        </p>
      </header>

      <aside className={styles.legend} aria-label="线索怎么读">
        <p className={styles.legendTitle}>线索怎么读</p>
        <ul className={styles.legendList}>
          <li>
            <strong>3</strong>
            <span>只有一段连续 3 格黑,中间不能断。例如第一行应是:白黑黑黑白</span>
          </li>
          <li>
            <strong>1 1 1</strong>
            <span>三段各 1 格黑,段与段之间至少隔 1 格白。例如第二行:黑白黑白黑</span>
          </li>
          <li>
            <strong>2 2</strong>
            <span>两段各 2 格黑,中间至少隔 1 格白。例如第三行:黑黑白黑黑</span>
          </li>
        </ul>
        <p className={styles.legendTip}>
          行线索管横着看,列线索管竖着看;两边都要对上才算对。不确定是白的格子可以先打叉。
        </p>
      </aside>

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
              {best[id] !== undefined ? ` · 最佳 ${best[id]}s` : ""}
            </button>
          ))}
        </div>
        <p className={styles.status} data-phase={session.status}>
          {session.status === "won"
            ? wroteNewBest
              ? "图案完成！本难度新纪录已写入本机"
              : "图案完成！"
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
            ["--cell" as string]: cellCss,
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
