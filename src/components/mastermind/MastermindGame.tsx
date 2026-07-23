"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { PEG_COLORS } from "@/games/mastermind/colors";
import {
  createSecret,
  DIFFICULTIES,
  evaluateGuess,
  isWin,
  rateClearance,
  type DifficultyId,
  type PegFeedback,
} from "@/games/mastermind/rules";
import styles from "./MastermindGame.module.css";

type HistoryRow = {
  guess: number[];
  feedback: PegFeedback;
};

type Phase = "idle" | "playing" | "won" | "lost";

const DIFF_BLURB: Record<DifficultyId, string> = {
  easy: "三段色码,颜色不重复——适合先摸清位准/色准。",
  normal: "经典四位六色。排除法与记忆同样重要。",
  hard: "五位八色且允许重复,信息更糊,更吃推理。",
};

const BEST_KEY = "yiju-mastermind-best";

type BestMap = Partial<Record<DifficultyId, number>>;

let bestCache: BestMap | null = null;
const bestListeners = new Set<() => void>();

function readBest(): BestMap {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) ?? "{}") as BestMap;
  } catch {
    return {};
  }
}

function getBestSnapshot(): BestMap {
  if (bestCache === null) bestCache = readBest();
  return bestCache;
}

function getBestServerSnapshot(): BestMap {
  return {};
}

function subscribeBest(onStoreChange: () => void) {
  bestListeners.add(onStoreChange);
  return () => bestListeners.delete(onStoreChange);
}

function persistBest(map: BestMap) {
  bestCache = map;
  localStorage.setItem(BEST_KEY, JSON.stringify(map));
  bestListeners.forEach((listener) => listener());
}

/** 位准/色准钉:固定单行不换行,并附文字计数防看不清。 */
function FeedbackKeys({
  exact,
  color,
  slots,
}: {
  exact: number;
  color: number;
  slots: number;
}) {
  const keys: Array<"exact" | "color" | "empty"> = [];
  for (let i = 0; i < exact; i++) keys.push("exact");
  for (let i = 0; i < color; i++) keys.push("color");
  while (keys.length < slots) keys.push("empty");

  return (
    <div
      className={styles.feedback}
      aria-label={`位准 ${exact},色准 ${color}`}
    >
      <div className={styles.feedbackKeys}>
        {keys.map((kind, i) => (
          <span
            key={i}
            className={
              kind === "exact"
                ? styles.exact
                : kind === "color"
                  ? styles.colorOnly
                  : styles.keyEmpty
            }
            title={
              kind === "exact" ? "位准" : kind === "color" ? "色准" : undefined
            }
          />
        ))}
      </div>
      <span className={styles.feedbackText}>
        <em className={styles.exactLabel}>{exact}</em>位准
        <span className={styles.feedbackSep}>·</span>
        <em className={styles.colorLabel}>{color}</em>色准
      </span>
    </div>
  );
}

export function MastermindGame() {
  const [difficulty, setDifficulty] = useState<DifficultyId>("normal");
  const [phase, setPhase] = useState<Phase>("idle");
  const [secret, setSecret] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [draft, setDraft] = useState<(number | null)[]>([]);
  const [activeSlot, setActiveSlot] = useState(0);
  const best = useSyncExternalStore(
    subscribeBest,
    getBestSnapshot,
    getBestServerSnapshot,
  );

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
    if (!config.allowDuplicates && new Set(guess).size !== guess.length) {
      return;
    }

    const feedback = evaluateGuess(secret, guess);
    const nextHistory = [...history, { guess: [...guess], feedback }];
    setHistory(nextHistory);

    if (isWin(feedback, config.codeLength)) {
      const used = nextHistory.length;
      const current = best[difficulty];
      if (current === undefined || used < current) {
        persistBest({ ...best, [difficulty]: used });
      }
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
  const emptyRows = Math.max(0, attemptsLeft - (phase === "playing" ? 1 : 0));
  const draftReady =
    draft.every((p) => p !== null) &&
    (config.allowDuplicates || new Set(draft).size === draft.length);
  const clearance =
    phase === "won" ? rateClearance(history.length, config.maxAttempts) : null;
  const isNewBest = phase === "won" && best[difficulty] === history.length;

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />
      <header className={styles.header}>
        <Link href="/" className={styles.back}>
          ← 回主页
        </Link>
        <p className={styles.eyebrow}>挑战局 · 色码终端</p>
        <h1 className={styles.title}>密码破译</h1>
        <p className={styles.lead}>
          系统藏了一串颜色密码。每次提交后给你反馈:
          <strong className={styles.exactLabel}> 位准</strong>
          =颜色和位置都对;
          <strong className={styles.colorLabel}> 色准</strong>
          =颜色对但位置错。钉点只排一行,不换行。
        </p>
      </header>

      {phase === "idle" ? (
        <section className={styles.setup} aria-label="选择难度">
          <div className={styles.legend} aria-hidden>
            <div className={styles.legendItem}>
              <span className={styles.exact} />
              <span>位准(黑钉)</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.colorOnly} />
              <span>色准(白钉)</span>
            </div>
          </div>
          <div className={styles.diffGrid}>
            {(Object.keys(DIFFICULTIES) as DifficultyId[]).map((id) => {
              const d = DIFFICULTIES[id];
              const record = best[id];
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
                    {d.codeLength} 位 · {d.colorCount} 色 · {d.maxAttempts} 次
                    {d.allowDuplicates ? " · 可重复" : " · 无重复"}
                  </span>
                  <span className={styles.diffBlurb}>{DIFF_BLURB[id]}</span>
                  {record !== undefined && (
                    <span className={styles.record}>本机最佳 {record} 次</span>
                  )}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            className={styles.primary}
            onClick={() => startGame(difficulty)}
          >
            接入终端 · 开始破译
          </button>
        </section>
      ) : (
        <div className={styles.board}>
          <div className={styles.meta}>
            <span className={styles.metaChip}>{config.label}</span>
            <span className={styles.metaChip}>剩余 {attemptsLeft} 次</span>
            {best[difficulty] !== undefined && (
              <span className={styles.metaChip}>
                最佳 {best[difficulty]} 次
              </span>
            )}
            <button
              type="button"
              className={styles.ghost}
              onClick={() => startGame(difficulty)}
            >
              重开本局
            </button>
          </div>

          <ol className={styles.history} aria-label="破译棋盘">
            {history.map((row, i) => (
              <li key={`h-${i}`} className={styles.row}>
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
                <FeedbackKeys
                  exact={row.feedback.exact}
                  color={row.feedback.color}
                  slots={config.codeLength}
                />
              </li>
            ))}

            {phase === "playing" && (
              <li className={`${styles.row} ${styles.rowActive}`}>
                <span className={styles.rowIndex}>{history.length + 1}</span>
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
                <div className={styles.feedbackPlaceholder} aria-hidden>
                  待提交
                </div>
              </li>
            )}

            {Array.from({ length: emptyRows }).map((_, i) => (
              <li
                key={`e-${i}`}
                className={`${styles.row} ${styles.rowEmpty}`}
                aria-hidden
              >
                <span className={styles.rowIndex}>
                  {history.length + (phase === "playing" ? 2 : 1) + i}
                </span>
                <div className={styles.pegs}>
                  {Array.from({ length: config.codeLength }).map((__, j) => (
                    <span key={j} className={styles.slotGhost} />
                  ))}
                </div>
                <FeedbackKeys exact={0} color={0} slots={config.codeLength} />
              </li>
            ))}
          </ol>

          {phase === "playing" && (
            <section className={styles.compose} aria-label="选色面板">
              <p className={styles.composeHint}>
                点颜色填入高亮槽位;再点槽位可清空。
                {!config.allowDuplicates && "本难度猜测不可重复色。"}
              </p>
              <div className={styles.palette} role="listbox" aria-label="选色">
                {palette.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={styles.swatchBtn}
                    onClick={() => placeColor(p.id)}
                    aria-label={p.name}
                  >
                    <span
                      className={styles.swatch}
                      style={{ background: p.css }}
                    />
                    <span className={styles.swatchName}>{p.name}</span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                className={styles.primary}
                disabled={!draftReady}
                onClick={submitGuess}
              >
                提交本行
              </button>
              {!config.allowDuplicates &&
                draft.every((p) => p !== null) &&
                new Set(draft).size !== draft.length && (
                  <p className={styles.hint}>有重复颜色,请先改掉再提交。</p>
                )}
            </section>
          )}

          {(phase === "won" || phase === "lost") && (
            <section
              className={phase === "won" ? styles.resultWin : styles.resultLose}
              aria-live="polite"
            >
              <h2>
                {phase === "won"
                  ? (clearance?.label ?? "破译成功")
                  : "终端锁定失败"}
              </h2>
              <p>
                {phase === "won"
                  ? `${clearance?.blurb ?? ""} 共用 ${history.length} 次。`
                  : "次数耗尽。正确色码是:"}
              </p>
              {isNewBest && (
                <p className={styles.newBest}>本难度新纪录已写入本机。</p>
              )}
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
