"use client";

import { useEffect, useRef } from "react";
import type { LogEntry } from "@/engine/types";
import { publicUrl } from "@/lib/base-path";
import styles from "./NarrativeLog.module.css";

interface NarrativeLogProps {
  log: LogEntry[];
  /** 日志为空时显示的开局叙述,由内容层提供(见 module.ts OPENING_NARRATION)。 */
  openingText: string;
  /** 开局氛围图,可选。 */
  openingImageSrc?: string;
  /** P1 等待 LLM 响应期间为 true;模板池实现是同步的,不会触发这个状态。 */
  isThinking?: boolean;
}

export function NarrativeLog({
  log,
  openingText,
  openingImageSrc,
  isThinking = false,
}: NarrativeLogProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [log.length, isThinking]);

  return (
    <div className={styles.log} role="log" aria-live="polite">
      {log.length === 0 && (
        <div className={styles.opening}>
          {openingImageSrc && (
            // 静态本地插图;失败时仅留文字开场
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.scene}
              src={publicUrl(openingImageSrc)}
              alt=""
              width={720}
              height={405}
            />
          )}
          <p className={styles.empty}>{openingText}</p>
        </div>
      )}
      {log.map((entry) =>
        entry.kind === "player" ? (
          <p key={entry.id} className={`${styles.entry} ${styles.player}`}>
            {entry.text}
          </p>
        ) : (
          <div key={entry.id} className={`${styles.entry} ${styles.narrationBlock}`}>
            {entry.imageSrc && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.scene}
                src={publicUrl(entry.imageSrc)}
                alt=""
                width={720}
                height={405}
              />
            )}
            <p className={styles.narration}>{entry.text}</p>
          </div>
        ),
      )}
      {isThinking && (
        <p className={`${styles.entry} ${styles.thinking}`} aria-label="正在生成叙述">
          ……
        </p>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
