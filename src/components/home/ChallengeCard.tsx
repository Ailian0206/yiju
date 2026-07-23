import Link from "next/link";
import type { ChallengeMeta } from "@/challenges/types";
import { ModuleCover } from "@/components/home/ModuleCover";
import styles from "./ChallengeCard.module.css";

interface ChallengeCardProps {
  challenge: ChallengeMeta;
}

/** 主页挑战局卡片:结构与故事局 ModuleCard 对齐,先进介绍页。 */
export function ChallengeCard({ challenge }: ChallengeCardProps) {
  const href = `/challenges/${challenge.id}`;
  const cta =
    challenge.status === "playable"
      ? "了解并开始"
      : challenge.status === "demo"
        ? "试玩 Demo"
        : "即将开发";

  return (
    <article className={styles.card} data-status={challenge.status}>
      <Link href={href} className={styles.link}>
        <div className={styles.coverWrap} data-challenge={challenge.id}>
          <ModuleCover className={styles.cover} src={challenge.coverSrc} />
          {challenge.status === "preview" && (
            <span className={styles.badge}>即将开发</span>
          )}
          {challenge.status === "demo" && (
            <span className={styles.badge}>试玩</span>
          )}
        </div>
        <div className={styles.body}>
          <h2 className={styles.title}>{challenge.title}</h2>
          <p className={styles.tagline}>{challenge.tagline}</p>
          <p className={styles.story}>{challenge.storyBackground}</p>
          <p className={styles.how}>
            <span className={styles.howLabel}>玩法</span>
            {challenge.howToPlay}
          </p>
          <div className={styles.footer}>
            <span className={styles.eta}>约 {challenge.estimatedMinutes} 分钟</span>
            <span className={styles.cta}>{cta}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
