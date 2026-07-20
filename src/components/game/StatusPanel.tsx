"use client";

import { useEffect, useRef, useState } from "react";
import type { GameState } from "@/engine/types";
import { LOCATION_NAMES } from "@/content/lost-cat/module";
import styles from "./StatusPanel.module.css";

const PULSE_DURATION_MS = 320;

/** 值变化时短暂返回 true,用于给数字一个"刚刚更新了"的轻微强调。 */
function useChangePulse(value: string | number): boolean {
  const previous = useRef(value);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (previous.current !== value) {
      previous.current = value;
      setPulsing(true);
      const timer = setTimeout(() => setPulsing(false), PULSE_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return pulsing;
}

interface StatusPanelProps {
  state: GameState;
  onRestart: () => void;
}

export function StatusPanel({ state, onRestart }: StatusPanelProps) {
  const cluesPulse = useChangePulse(state.clues);
  const closenessPulse = useChangePulse(state.closeness);
  const actionsPulse = useChangePulse(state.actionsRemaining);
  const skyPulse = useChangePulse(state.sky);

  return (
    <aside className={styles.panel} aria-label="当前局面状态">
      <p className={styles.location}>{LOCATION_NAMES[state.currentLocationId] ?? state.currentLocationId}</p>
      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>天色</dt>
          <dd className={styles.statValue} data-pulse={skyPulse}>
            {state.sky}
          </dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>线索</dt>
          <dd className={styles.statValue} data-pulse={cluesPulse}>
            {state.clues}
          </dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>亲近感</dt>
          <dd className={styles.statValue} data-pulse={closenessPulse}>
            {state.closeness}
          </dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>剩余行动</dt>
          <dd className={styles.statValue} data-pulse={actionsPulse}>
            {state.actionsRemaining}
          </dd>
        </div>
      </dl>
      <button type="button" className={styles.restartButton} onClick={onRestart}>
        再来一局
      </button>
    </aside>
  );
}
