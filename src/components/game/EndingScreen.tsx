import type { GameState } from "@/engine/types";
import styles from "./EndingScreen.module.css";

interface EndingScreenProps {
  state: GameState;
  onRestart: () => void;
}

/** 产品文档 §3.4:通关给重逢叙述 + 回顾;失败走温和收尾,不写惨。 */
export function EndingScreen({ state, onRestart }: EndingScreenProps) {
  const won = state.status === "won";

  return (
    <div className={styles.overlay}>
      <div className={styles.card} role="dialog" aria-modal="true" aria-labelledby="ending-title">
        <h2 id="ending-title" className={styles.title}>
          {won ? "重逢" : "天黑了"}
        </h2>
        <p className={styles.body}>
          {won
            ? "你抱起年糕往家走,它在怀里蹭了蹭,像是在说这一路它也不容易。"
            : "天黑了,你在家门口放了猫粮和年糕的毯子。明天一早再找。"}
        </p>
        <div className={styles.stats}>
          <div>
            <span className={styles.statValue}>{state.actionsTaken}</span>
            <span className={styles.statLabel}>行动次数</span>
          </div>
          <div>
            <span className={styles.statValue}>{state.clues}</span>
            <span className={styles.statLabel}>收集线索</span>
          </div>
        </div>
        <button type="button" className={styles.restartButton} onClick={onRestart}>
          再来一局
        </button>
      </div>
    </div>
  );
}
