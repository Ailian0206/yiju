"use client";

import { useGameSession } from "@/hooks/useGameSession";
import { ActionInput } from "./ActionInput";
import { EndingScreen } from "./EndingScreen";
import { NarrativeLog } from "./NarrativeLog";
import { SkyVeil } from "./SkyVeil";
import { StatusPanel } from "./StatusPanel";
import styles from "./GameScreen.module.css";

export function GameScreen() {
  const { state, submit, restart } = useGameSession();
  const isOver = state.status !== "playing";

  return (
    <div className={styles.screen}>
      <SkyVeil sky={state.sky} />
      <header className={styles.header}>
        <h1 className={styles.title}>一局 · 找回走丢的猫</h1>
        <p className={styles.subtitle}>天黑前找到年糕</p>
      </header>
      <div className={styles.layout}>
        <section className={styles.narrativeColumn}>
          <NarrativeLog log={state.log} />
          <ActionInput disabled={isOver} onSubmit={submit} />
        </section>
        <StatusPanel state={state} onRestart={restart} />
      </div>
      {isOver && <EndingScreen state={state} onRestart={restart} />}
    </div>
  );
}
