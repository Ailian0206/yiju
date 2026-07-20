"use client";

import { useEffect, useRef } from "react";
import type { LogEntry } from "@/engine/types";
import styles from "./NarrativeLog.module.css";

interface NarrativeLogProps {
  log: LogEntry[];
  /** 日志为空时显示的开局叙述,由内容层提供(见 module.ts OPENING_NARRATION)。 */
  openingText: string;
  /** P1 等待 LLM 响应期间为 true;模板池实现是同步的,不会触发这个状态。 */
  isThinking?: boolean;
}

export function NarrativeLog({ log, openingText, isThinking = false }: NarrativeLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [log.length, isThinking]);

  return (
    <div className={styles.log} role="log" aria-live="polite">
      {log.length === 0 && <p className={styles.empty}>{openingText}</p>}
      {log.map((entry) => (
        <p
          key={entry.id}
          className={`${styles.entry} ${entry.kind === "player" ? styles.player : styles.narration}`}
        >
          {entry.text}
        </p>
      ))}
      {isThinking && (
        <p className={`${styles.entry} ${styles.thinking}`} aria-label="正在生成叙述">
          ……
        </p>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
