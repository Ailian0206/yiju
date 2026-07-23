"use client";

import Link from "next/link";
import type { ChallengeMeta } from "@/challenges/types";
import { ModuleCover } from "@/components/home/ModuleCover";
import styles from "./ChallengeCard.module.css";

interface ChallengeCardProps {
  challenge: ChallengeMeta;
}

/** 主页挑战局卡片:先进介绍页再开玩。 */
export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const href = `/challenges/${challenge.id}`;
  const cta = challenge.status === "playable" ? "了解并开始" : "即将开发";

  return (
    <article className={styles.card} data-status={challenge.status}>
      <Link href={href} className={styles.link}>
        <div className={styles.coverWrap} data-challenge={challenge.id}>
          <ModuleCover className={styles.cover} src={challenge.coverSrc} />
          {challenge.status === "preview" && (
            <span className={styles.badge}>即将开发</span>
          )}
        </div>
        <div className={styles.body}>
          <p className={styles.kind}>挑战局</p>
          <h2 className={styles.title}>{challenge.title}</h2>
          <p className={styles.tagline}>{challenge.tagline}</p>
          <p className={styles.story}>{challenge.storyBackground}</p>
          <div className={styles.footer}>
            <span className={styles.eta}>约 {challenge.estimatedMinutes} 分钟</span>
            <span className={styles.cta}>{cta}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
