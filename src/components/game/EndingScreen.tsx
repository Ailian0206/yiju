import type { GameState } from "@/engine/types";
import type { ModuleUi } from "@/content/types";
import styles from "./EndingScreen.module.css";

interface EndingScreenProps {
  state: GameState;
  ui: ModuleUi;
  onRestart: () => void;
}

/** 通关/失败结局文案由模组 ui.ending 提供,避免所有局都写找猫。 */
export function EndingScreen({ state, ui, onRestart }: EndingScreenProps) {
  const won = state.status === "won";
  const ending = ui.ending;

  return (
    <div className={styles.overlay}>
      <div className={styles.card} role="dialog" aria-modal="true" aria-labelledby="ending-title">
        <h2 id="ending-title" className={styles.title}>
          {won ? ending.wonTitle : ending.lostTitle}
        </h2>
        <p className={styles.body}>{won ? ending.wonBody : ending.lostBody}</p>
        <div className={styles.stats}>
          <div>
            <span className={styles.statValue}>{state.actionsTaken}</span>
            <span className={styles.statLabel}>行动次数</span>
          </div>
          <div>
            <span className={styles.statValue}>{state.clues}</span>
            <span className={styles.statLabel}>{ending.cluesLabel}</span>
          </div>
        </div>
        <button type="button" className={styles.restartButton} onClick={onRestart}>
          再来一局
        </button>
      </div>
    </div>
  );
}
