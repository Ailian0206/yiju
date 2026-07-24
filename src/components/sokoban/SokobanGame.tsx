"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import {
  getBestServerSnapshot,
  getBestSnapshot,
  recordIfBetter,
  subscribeBest,
} from "@/challenges/bestStore";
import {
  LEVEL_PACK,
  createSession,
  move,
  undo,
  tierLabel,
  type Dir,
  type Session,
} from "@/games/sokoban/rules";
import styles from "./SokobanGame.module.css";

const BEST_KEY = "yiju-sokoban-best";

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

const DELTA: Record<Dir, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

type Pos = { x: number; y: number };

/** 一步位移的演出:人物/箱子从旧格滑到新格。 */
type SlideFx = {
  facing: Dir;
  kind: "walk" | "push";
  playerFrom: Pos;
  playerTo: Pos;
  boxFrom?: Pos;
  boxTo?: Pos;
};

function posKey(p: Pos) {
  return `${p.x},${p.y}`;
}

/** 仓库工人:朝向翻转;推箱时手臂前伸。 */
function Worker({
  facing,
  pushing,
  bumping,
}: {
  facing: Dir;
  pushing: boolean;
  bumping: boolean;
}) {
  const flip = facing === "left" ? -1 : 1;
  return (
    <span
      className={styles.workerWrap}
      data-pushing={pushing ? "1" : undefined}
      data-bump={bumping ? "1" : undefined}
      style={{ transform: `scaleX(${flip})` }}
    >
      <svg className={styles.worker} viewBox="0 0 40 48" aria-hidden>
        <ellipse cx="20" cy="44" rx="10" ry="3" fill="oklch(40% 0.04 70 / 0.35)" />
        <rect x="12" y="22" width="16" height="16" rx="4" fill="#3d7ea6" />
        <rect
          x={pushing ? "26" : "8"}
          y="24"
          width="6"
          height="10"
          rx="3"
          fill="#f0c9a0"
        />
        <rect
          x={pushing ? "28" : "26"}
          y="24"
          width="6"
          height="10"
          rx="3"
          fill="#e8b890"
        />
        <circle cx="20" cy="14" r="9" fill="#f0c9a0" />
        <ellipse cx="20" cy="8" rx="9" ry="5" fill="#2c4a6e" />
        <circle cx="17" cy="14" r="1.4" fill="#2a2a2a" />
        <circle cx="23" cy="14" r="1.4" fill="#2a2a2a" />
        <path
          d="M16 18 Q20 20 24 18"
          fill="none"
          stroke="#c47a5a"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <rect x="13" y="36" width="6" height="8" rx="2" fill="#2a3a4a" />
        <rect x="21" y="36" width="6" height="8" rx="2" fill="#2a3a4a" />
      </svg>
    </span>
  );
}

/** 木箱:木纹 + 金属边;压在目标上变绿。 */
function Crate({ onGoal }: { onGoal: boolean }) {
  const gid = useId().replace(/:/g, "");
  return (
    <svg className={styles.crate} viewBox="0 0 48 48" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={onGoal ? "#6a9a4a" : "#c48a3a"} />
          <stop offset="100%" stopColor={onGoal ? "#4a7a32" : "#8a5a22"} />
        </linearGradient>
      </defs>
      <rect
        x="4"
        y="6"
        width="40"
        height="36"
        rx="4"
        fill={`url(#${gid})`}
        stroke="#5a3a18"
        strokeWidth="2"
      />
      <line x1="4" y1="18" x2="44" y2="18" stroke="#5a3a18" strokeWidth="1.5" />
      <line x1="4" y1="30" x2="44" y2="30" stroke="#5a3a18" strokeWidth="1.5" />
      <line x1="24" y1="6" x2="24" y2="42" stroke="#5a3a18" strokeWidth="1.5" />
      <rect
        x="20"
        y="20"
        width="8"
        height="8"
        rx="1"
        fill={onGoal ? "#d4f0a8" : "#e8c878"}
        stroke="#5a3a18"
        strokeWidth="1"
      />
    </svg>
  );
}

/** 推箱子:小人推箱动画 + 单层围墙 + 多关卡 + 本机最少步数。 */
export function SokobanGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [session, setSession] = useState<Session>(() =>
    createSession(LEVEL_PACK[0]!),
  );
  const [facing, setFacing] = useState<Dir>("right");
  const [fx, setFx] = useState<SlideFx | null>(null);
  const [bumping, setBumping] = useState(false);
  const [wroteNewBest, setWroteNewBest] = useState(false);
  const busyRef = useRef(false);
  const sessionRef = useRef(session);
  const fxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const level = LEVEL_PACK[levelIndex]!;
  const best = useSyncExternalStore(
    (cb) => subscribeBest(BEST_KEY, cb),
    () => getBestSnapshot(BEST_KEY),
    () => getBestServerSnapshot(BEST_KEY),
  );

  function loadLevel(index: number) {
    const next = LEVEL_PACK[index];
    if (!next) return;
    if (fxTimer.current) clearTimeout(fxTimer.current);
    busyRef.current = false;
    setFx(null);
    setBumping(false);
    setWroteNewBest(false);
    setLevelIndex(index);
    setSession(createSession(next));
    setFacing("right");
  }

  function go(dir: Dir) {
    if (busyRef.current || sessionRef.current.status === "won") return;
    const current = sessionRef.current;
    setFacing(dir);
    const result = move(current, dir);
    if (result.kind === "blocked") {
      setBumping(true);
      window.setTimeout(() => setBumping(false), 160);
      return;
    }

    const playerFrom = { ...current.player };
    const playerTo = { ...result.session.player };
    let boxFrom: Pos | undefined;
    let boxTo: Pos | undefined;
    if (result.kind === "push") {
      // 箱子原先在人物目标格,被推到再前一格
      boxFrom = { ...playerTo };
      const d = DELTA[dir];
      boxTo = { x: playerTo.x + d.x, y: playerTo.y + d.y };
    }

    busyRef.current = true;
    setFx({
      facing: dir,
      kind: result.kind,
      playerFrom,
      playerTo,
      boxFrom,
      boxTo,
    });
    setSession(result.session);
    if (result.session.status === "won") {
      setWroteNewBest(
        recordIfBetter(BEST_KEY, level.id, result.session.moves),
      );
    }

    if (fxTimer.current) clearTimeout(fxTimer.current);
    fxTimer.current = setTimeout(() => {
      setFx(null);
      busyRef.current = false;
    }, 220);
  }

  const goRef = useRef(go);
  useEffect(() => {
    goRef.current = go;
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const dir = KEY_DIR[e.key] ?? KEY_DIR[e.key.toLowerCase()];
      if (!dir) return;
      e.preventDefault();
      goRef.current(dir);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(
    () => () => {
      if (fxTimer.current) clearTimeout(fxTimer.current);
    },
    [],
  );

  const cell = 48;
  const stageW = session.width * cell;
  const stageH = session.height * cell;

  // 演出中人物/箱子用起点,靠 CSS 过渡滑到终点
  const playerPos = fx ? fx.playerFrom : session.player;
  const playerTarget = fx ? fx.playerTo : session.player;

  const boxPositions: Pos[] = [];
  for (const k of session.boxes) {
    const [x, y] = k.split(",").map(Number) as [number, number];
    // 推箱动画:终点箱先不画,改画滑动中的箱子
    if (fx?.boxTo && fx.boxTo.x === x && fx.boxTo.y === y) continue;
    boxPositions.push({ x, y });
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow} aria-hidden />
      <header className={styles.header}>
        <Link href="/challenges/sokoban" className={styles.back}>
          ← 返回介绍
        </Link>
        <p className={styles.eyebrow}>挑战局 · 推箱子</p>
        <h1 className={styles.title}>推箱子</h1>
        <p className={styles.lead}>
          操控仓库工人把木箱推到绿色垫上。只能推、不能拉。共 {LEVEL_PACK.length}{" "}
          关,难度约每关翻倍;方向键或 WASD,推错了就撤销。
        </p>
      </header>

      <div className={styles.toolbar}>
        <p className={styles.levelMeta}>
          {level.label}
          <span className={styles.tier}>{tierLabel(level.tier)}</span>
        </p>
        <p className={styles.status} data-phase={session.status}>
          {session.status === "won"
            ? wroteNewBest
              ? `通关！新纪录 ${session.moves} 步`
              : `通关！共 ${session.moves} 步`
            : `${session.moves} 步`}
          {best[level.id] !== undefined ? (
            <span className={styles.bestHint}>
              {" "}
              · 本机最少 {best[level.id]} 步
            </span>
          ) : null}
        </p>
        <button
          type="button"
          className={styles.secondary}
          disabled={levelIndex <= 0}
          onClick={() => loadLevel(levelIndex - 1)}
        >
          上一关
        </button>
        <button
          type="button"
          className={styles.secondary}
          disabled={levelIndex >= LEVEL_PACK.length - 1}
          onClick={() => loadLevel(levelIndex + 1)}
        >
          下一关
        </button>
        <button
          type="button"
          className={styles.secondary}
          onClick={() => {
            if (busyRef.current) return;
            setSession((s) => undo(s));
            setFx(null);
          }}
        >
          撤销
        </button>
        <button
          type="button"
          className={styles.restart}
          onClick={() => loadLevel(levelIndex)}
        >
          重开
        </button>
      </div>

      <div className={styles.levelStrip} role="group" aria-label="选择关卡">
        {LEVEL_PACK.map((lv, i) => (
          <button
            key={lv.id}
            type="button"
            className={styles.levelBtn}
            data-active={i === levelIndex ? "1" : undefined}
            data-tier={lv.tier}
            onClick={() => loadLevel(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <div className={styles.stageWrap}>
        <div
          className={styles.stage}
          style={{ width: stageW, height: stageH }}
          role="grid"
          aria-label="推箱子盘面"
        >
          {/* 全图渲染:外围墙格 + 地板,单层无描边套娃 */}
          {Array.from({ length: session.height }, (_, y) =>
            Array.from({ length: session.width }, (_, x) => {
              const k = `${x},${y}`;
              const wall = session.walls.has(k);
              const goal = session.goals.has(k);
              return (
                <div
                  key={k}
                  className={styles.tile}
                  data-wall={wall ? "1" : undefined}
                  style={{
                    width: cell,
                    height: cell,
                    left: x * cell,
                    top: y * cell,
                  }}
                >
                  {goal && !wall ? <span className={styles.pad} /> : null}
                </div>
              );
            }),
          )}

          {boxPositions.map((b) => (
            <div
              key={posKey(b)}
              className={styles.sprite}
              style={{
                width: cell,
                height: cell,
                left: b.x * cell,
                top: b.y * cell,
              }}
            >
              <Crate onGoal={session.goals.has(posKey(b))} />
            </div>
          ))}

          {fx?.boxFrom && fx.boxTo ? (
            <div
              className={`${styles.sprite} ${styles.sliding}`}
              style={
                {
                  width: cell,
                  height: cell,
                  "--from-x": `${fx.boxFrom.x * cell}px`,
                  "--from-y": `${fx.boxFrom.y * cell}px`,
                  "--to-x": `${fx.boxTo.x * cell}px`,
                  "--to-y": `${fx.boxTo.y * cell}px`,
                } as CSSProperties
              }
            >
              <Crate onGoal={session.goals.has(posKey(fx.boxTo))} />
            </div>
          ) : null}

          <div
            className={`${styles.sprite} ${styles.actor} ${fx ? styles.sliding : ""}`}
            style={
              {
                width: cell,
                height: cell,
                zIndex: 5,
                ...(fx
                  ? {
                      "--from-x": `${playerPos.x * cell}px`,
                      "--from-y": `${playerPos.y * cell}px`,
                      "--to-x": `${playerTarget.x * cell}px`,
                      "--to-y": `${playerTarget.y * cell}px`,
                    }
                  : {
                      left: playerPos.x * cell,
                      top: playerPos.y * cell,
                    }),
              } as CSSProperties
            }
          >
            <Worker
              facing={fx?.facing ?? facing}
              pushing={fx?.kind === "push"}
              bumping={bumping}
            />
          </div>
        </div>
      </div>

      {session.status === "won" && levelIndex < LEVEL_PACK.length - 1 ? (
        <div className={styles.nextBanner}>
          <button
            type="button"
            className={styles.nextCta}
            onClick={() => loadLevel(levelIndex + 1)}
          >
            进入下一关 →
          </button>
        </div>
      ) : null}

      <div className={styles.dpad} aria-label="方向键">
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
