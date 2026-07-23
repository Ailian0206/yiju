"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { PEG_COLORS } from "@/games/mastermind/colors";
import {
  createSecret,
  DIFFICULTIES,
  evaluateGuess,
  isWin,
  type DifficultyId,
  type PegFeedback,
} from "@/games/mastermind/rules";
import styles from "./MastermindGame.module.css";

type HistoryRow = {
  guess: number[];
  feedback: PegFeedback;
};

type Phase = "idle" | "playing" | "won" | "lost";

export function MastermindGame() {
  const [difficulty, setDifficulty] = useState<DifficultyId>("normal");
  const [phase, setPhase] = useState<Phase>("idle");
  const [secret, setSecret] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [draft, setDraft] = useState<(number | null)[]>([]);
  const [activeSlot, setActiveSlot] = useState(0);

  const config = DIFFICULTIES[difficulty];
  const palette = useMemo(
    () => PEG_COLORS.slice(0, config.colorCount),
    [config.colorCount],
  );

  const startGame = useCallback(
    (id: DifficultyId = difficulty) => {
      const cfg = DIFFICULTIES[id];
      setDifficulty(id);
      setSecret(createSecret(cfg));
      setHistory([]);
      setDraft(Array.from({ length: cfg.codeLength }, () => null));
      setActiveSlot(0);
      setPhase("playing");
    },
    [difficulty],
  );

  const placeColor = (color: number) => {
    if (phase !== "playing") return;
    const next = [...draft];
    next[activeSlot] = color;
    setDraft(next);
    // 填完当前位后跳到下一个空位,方便连续点色
    for (let i = 1; i < config.codeLength; i++) {
      const j = (activeSlot + i) % config.codeLength;
      if (next[j] === null) {
        setActiveSlot(j);
        return;
      }
    }
  };

  const clearSlot = (index: number) => {
    if (phase !== "playing") return;
    setDraft((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setActiveSlot(index);
  };

  const submitGuess = () => {
    if (phase !== "playing") return;
    if (draft.some((p) => p === null)) return;

    const guess = draft as number[];
    // 普通/简单不允许猜测内重复(与秘密码规则一致,降低误操作)
    if (!config.allowDuplicates && new Set(guess).size !== guess.length) {
      return;
    }

    const feedback = evaluateGuess(secret, guess);
    const nextHistory = [...history, { guess: [...guess], feedback }];
    setHistory(nextHistory);

    if (isWin(feedback, config.codeLength)) {
      setPhase("won");
      return;
    }
    if (nextHistory.length >= config.maxAttempts) {
      setPhase("lost");
      return;
    }

    setDraft(Array.from({ length: config.codeLength }, () => null));
    setActiveSlot(0);
  };

  const attemptsLeft = config.maxAttempts - history.length;
  const draftReady =
    draft.every((p) => p !== null) &&
    (config.allowDuplicates || new Set(draft).size === draft.length);

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← 回主页
        </Link>
        <p className={styles.eyebrow}>挑战局 · 试玩</p>
        <h1 className={styles.title}>密码破译</h1>
        <p className={styles.lead}>
          猜出隐藏的颜色序列。黑点=位准(颜色和位置都对),白点=色准(颜色对但位置错)。
        </p>
      </header>

      {phase === "idle" ? (
        <section className={styles.setup} aria-label="选择难度">
          <div className={styles.diffGrid}>
            {(Object.keys(DIFFICULTIES) as DifficultyId[]).map((id) => {
              const d = DIFFICULTIES[id];
              return (
                <button
                  key={id}
                  type="button"
                  className={
                    difficulty === id ? styles.diffActive : styles.diffCard
                  }
                  onClick={() => setDifficulty(id)}
                >
                  <strong>{d.label}</strong>
                  <span>
                    {d.codeLength} 位 · {d.colorCount} 色 · {d.maxAttempts}{" "}
                    次
                    {d.allowDuplicates ? " · 可重复" : " · 无重复"}
                  </span>
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className={styles.primary}
            onClick={() => startGame(difficulty)}
          >
            开始破译
          </button>
        </section>
      ) : (
        <div className={styles.board}>
          <div className={styles.meta}>
            <span>{config.label}</span>
            <span>剩余 {attemptsLeft} 次</span>
            <button
              type="button"
              className={styles.ghost}
              onClick={() => startGame(difficulty)}
            >
              重开本局
            </button>
          </div>

          <ol className={styles.history} aria-label="已提交猜测">
            {history.map((row, i) => (
              <li key={i} className={styles.row}>
                <span className={styles.rowIndex}>{i + 1}</span>
                <div className={styles.pegs}>
                  {row.guess.map((c, j) => (
                    <span
                      key={j}
                      className={styles.peg}
                      style={{ background: PEG_COLORS[c]!.css }}
                      title={PEG_COLORS[c]!.name}
                    />
                  ))}
                </div>
                <div
                  className={styles.feedback}
                  aria-label={`位准 ${row.feedback.exact},色准 ${row.feedback.color}`}
                >
                  {Array.from({ length: row.feedback.exact }).map((_, k) => (
                    <span key={`e${k}`} className={styles.exact} />
                  ))}
                  {Array.from({ length: row.feedback.color }).map((_, k) => (
                    <span key={`c${k}`} className={styles.colorOnly} />
                  ))}
                </div>
              </li>
            ))}
          </ol>

          {phase === "playing" && (
            <section className={styles.compose} aria-label="当前猜测">
              <div className={styles.pegs}>
                {draft.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    className={
                      activeSlot === i ? styles.slotActive : styles.slot
                    }
                    style={
                      c !== null
                        ? { background: PEG_COLORS[c].css }
                        : undefined
                    }
                    onClick={() => clearSlot(i)}
                    aria-label={
                      c === null
                        ? `第 ${i + 1} 位,空`
                        : `第 ${i + 1} 位,${PEG_COLORS[c].name},点击清空`
                    }
                  />
                ))}
              </div>
              <div className={styles.palette} role="listbox" aria-label="选色">
                {palette.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.swatch}
                    style={{ background: p.css }}
                    onClick={() => placeColor(p.id)}
                    aria-label={p.name}
                    title={p.name}
                  />
                ))}
              </div>
              <button
                type="button"
                className={styles.primary}
                disabled={!draftReady}
                onClick={submitGuess}
              >
                提交猜测
              </button>
              {!config.allowDuplicates &&
                draft.every((p) => p !== null) &&
                new Set(draft).size !== draft.length && (
                  <p className={styles.hint}>本难度不允许猜测中出现重复颜色。</p>
                )}
            </section>
          )}

          {(phase === "won" || phase === "lost") && (
            <section
              className={phase === "won" ? styles.resultWin : styles.resultLose}
              aria-live="polite"
            >
              <h2>{phase === "won" ? "破译成功" : "次数用尽"}</h2>
              <p>
                {phase === "won"
                  ? `用了 ${history.length} 次猜中。`
                  : "正确答案是:"}
              </p>
              <div className={styles.pegs}>
                {secret.map((c, i) => (
                  <span
                    key={i}
                    className={styles.peg}
                    style={{ background: PEG_COLORS[c]!.css }}
                    title={PEG_COLORS[c]!.name}
                  />
                ))}
              </div>
              <div className={styles.resultActions}>
                <button
                  type="button"
                  className={styles.primary}
                  onClick={() => startGame(difficulty)}
                >
                  再来一局
                </button>
                <button
                  type="button"
                  className={styles.ghost}
                  onClick={() => setPhase("idle")}
                >
                  换难度
                </button>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
