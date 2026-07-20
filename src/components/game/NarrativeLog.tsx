"use client";

import { useEffect, useRef } from "react";
import type { LogEntry } from "@/engine/types";
import styles from "./NarrativeLog.module.css";

interface NarrativeLogProps {
  log: LogEntry[];
  /** 日志为空时显示的开局叙述,由内容层提供(见 module.ts OPENING_NARRATION)。 */
  openingText: string;
}

export function NarrativeLog({ log, openingText }: NarrativeLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [log.length]);

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
      <div ref={bottomRef} />
    </div>
  );
}
