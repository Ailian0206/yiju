"use client";

import { useEffect, useRef, useState } from "react";
import type { GameState } from "@/engine/types";
import type { ModuleUi } from "@/content/types";
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
  ui: ModuleUi;
  onRestart: () => void;
}

export function StatusPanel({ state, ui, onRestart }: StatusPanelProps) {
  // 日制模组优先展示「第 N 天 · 早晚」,经典模组仍用天色文案。
  const skyText =
    state.day !== undefined
      ? `第${state.day}天 · ${state.phase ?? "早"}`
      : (ui.skyDisplay?.[state.sky] ?? state.sky);
  const closenessText = ui.closenessDisplay?.[state.closeness] ?? state.closeness;
  const cluesPulse = useChangePulse(state.clues);
  const closenessPulse = useChangePulse(closenessText);
  const actionsPulse = useChangePulse(state.actionsRemaining);
  const skyPulse = useChangePulse(skyText);

  return (
    <aside className={styles.panel} aria-label="当前局面状态">
      <p className={styles.location}>
        {ui.locationNames[state.currentLocationId] ?? state.currentLocationId}
      </p>
      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>{ui.labels.sky}</dt>
          <dd className={styles.statValue} data-pulse={skyPulse}>
            {skyText}
          </dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>{ui.labels.clues}</dt>
          <dd className={styles.statValue} data-pulse={cluesPulse}>
            {state.clues}
          </dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>{ui.labels.closeness}</dt>
          <dd className={styles.statValue} data-pulse={closenessPulse}>
            {closenessText}
          </dd>
        </div>
        <div className={styles.stat}>
          <dt className={styles.statLabel}>{ui.labels.actions}</dt>
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
