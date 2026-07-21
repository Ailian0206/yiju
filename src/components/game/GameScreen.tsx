"use client";

import Link from "next/link";
import { useGameSession } from "@/hooks/useGameSession";
import { ActionInput } from "./ActionInput";
import { EndingScreen } from "./EndingScreen";
import { NarrativeLog } from "./NarrativeLog";
import { SkyVeil } from "./SkyVeil";
import { StatusPanel } from "./StatusPanel";
import { SuggestionChips } from "./SuggestionChips";
import styles from "./GameScreen.module.css";

interface GameScreenProps {
  moduleId: string;
}

export function GameScreen({ moduleId }: GameScreenProps) {
  // key=moduleId:切换模组时整树重挂,会话 hook 重新读档/装配
  return <GameScreenInner key={moduleId} moduleId={moduleId} />;
}

function GameScreenInner({ moduleId }: GameScreenProps) {
  const { state, submit, restart, isThinking, meta, openingNarration, openingImageSrc, getSuggestedActions, ui } =
    useGameSession(moduleId);
  const isOver = state.status !== "playing";
  const suggestions = getSuggestedActions(state);
  const inputDisabled = isOver || isThinking;

  return (
    <div className={styles.screen}>
      <SkyVeil sky={state.sky} />
      <header className={styles.header}>
        <div className={styles.headingBlock}>
          <Link href="/" className={styles.backLink}>
            ← 一局
          </Link>
          <h1 className={styles.title}>{meta.title}</h1>
          <p className={styles.subtitle}>{meta.tagline}</p>
        </div>
      </header>
      <div className={styles.layout}>
        <section className={styles.narrativeColumn}>
          <NarrativeLog
            log={state.log}
            openingText={openingNarration}
            openingImageSrc={openingImageSrc}
            isThinking={isThinking}
          />
          <SuggestionChips suggestions={suggestions} disabled={inputDisabled} onPick={submit} />
          <ActionInput disabled={inputDisabled} onSubmit={submit} />
        </section>
        <StatusPanel state={state} ui={ui} onRestart={restart} />
      </div>
      {isOver && <EndingScreen state={state} ui={ui} onRestart={restart} />}
    </div>
  );
}
