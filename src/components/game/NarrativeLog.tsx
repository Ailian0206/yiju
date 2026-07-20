"use client";

import { useEffect, useRef } from "react";
import type { LogEntry } from "@/engine/types";
import styles from "./NarrativeLog.module.css";

interface NarrativeLogProps {
  log: LogEntry[];
}

export function NarrativeLog({ log }: NarrativeLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [log.length]);

  return (
    <div className={styles.log} role="log" aria-live="polite">
      {log.length === 0 && (
        <p className={styles.empty}>天快黑了,你想好第一步要做什么了吗?</p>
      )}
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
