import type { SkyPhase } from "@/engine/types";
import styles from "./SkyVeil.module.css";

const PHASE_TO_LAYER: Record<SkyPhase, keyof typeof styles> = {
  傍晚: "dusk",
  黄昏: "evening",
  擦黑: "twilight",
  天黑: "night",
};

interface SkyVeilProps {
  sky: SkyPhase;
}

/** 背景天色层:天黑不是一句台词,是玩家能看见的视觉事实。 */
export function SkyVeil({ sky }: SkyVeilProps) {
  return (
    <div className={styles.veil} aria-hidden="true">
      {(Object.keys(PHASE_TO_LAYER) as SkyPhase[]).map((phase) => (
        <div
          key={phase}
          className={`${styles.layer} ${styles[PHASE_TO_LAYER[phase]]}`}
          data-active={phase === sky}
        />
      ))}
    </div>
  );
}
