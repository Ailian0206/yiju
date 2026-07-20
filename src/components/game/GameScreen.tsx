"use client";

import { useGameSession } from "@/hooks/useGameSession";
import { OPENING_NARRATION } from "@/content/lost-cat/module";
import { getSuggestedActions } from "@/content/lost-cat/suggestions";
import { ActionInput } from "./ActionInput";
import { EndingScreen } from "./EndingScreen";
import { NarrativeLog } from "./NarrativeLog";
import { SkyVeil } from "./SkyVeil";
import { StatusPanel } from "./StatusPanel";
import { SuggestionChips } from "./SuggestionChips";
import styles from "./GameScreen.module.css";

export function GameScreen() {
  const { state, submit, restart, isThinking } = useGameSession();
  const isOver = state.status !== "playing";
  const suggestions = getSuggestedActions(state);
  const inputDisabled = isOver || isThinking;

  return (
    <div className={styles.screen}>
      <SkyVeil sky={state.sky} />
      <header className={styles.header}>
        <h1 className={styles.title}>一局 · 找回走丢的猫</h1>
        <p className={styles.subtitle}>天黑前找到年糕</p>
      </header>
      <div className={styles.layout}>
        <section className={styles.narrativeColumn}>
          <NarrativeLog log={state.log} openingText={OPENING_NARRATION} isThinking={isThinking} />
          <SuggestionChips suggestions={suggestions} disabled={inputDisabled} onPick={submit} />
          <ActionInput disabled={inputDisabled} onSubmit={submit} />
        </section>
        <StatusPanel state={state} onRestart={restart} />
      </div>
      {isOver && <EndingScreen state={state} onRestart={restart} />}
    </div>
  );
}
