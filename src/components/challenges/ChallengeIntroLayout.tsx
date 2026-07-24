import Link from "next/link";
import type { ChallengeMeta } from "@/challenges/types";
import { difficultyLines, playCtaLabel } from "@/challenges/introCopy";
import { ModuleCover } from "@/components/home/ModuleCover";
import styles from "./ChallengeIntro.module.css";

type Props = {
  meta: ChallengeMeta;
};

/** 挑战局介绍页共用布局:封面 + 设定/玩法/难度 + 开始。 */
export function ChallengeIntroLayout({ meta }: Props) {
  const lines = difficultyLines(meta.id);
  const playable = meta.status === "playable" || meta.status === "demo";
  const statusLabel =
    meta.status === "playable"
      ? "挑战局 · 可开始"
      : meta.status === "demo"
        ? "挑战局 · 试玩 Demo"
        : "挑战局 · 即将开发";

  return (
    <main className={styles.page}>
      <div className={styles.atmosphere} aria-hidden />
      <Link href="/" className={styles.back}>
        ← 返回一局
      </Link>
      <article className={styles.panel}>
        <div className={styles.coverWrap}>
          <ModuleCover
            className={styles.cover}
            src={meta.coverSrc}
            width={960}
            height={600}
          />
        </div>
        <div className={styles.content}>
          <p className={styles.status}>{statusLabel}</p>
          <h1 className={styles.title}>{meta.title}</h1>
          <p className={styles.tagline}>{meta.tagline}</p>
          <section className={styles.block}>
            <h2>设定</h2>
            <p>{meta.storyBackground}</p>
          </section>
          <section className={styles.block}>
            <h2>玩法</h2>
            <p>{meta.howToPlay}</p>
          </section>
          {lines.length > 0 && (
            <section className={styles.block}>
              <h2>难度一览</h2>
              <ul className={styles.diffList}>
                {lines.map((line) => (
                  <li key={line.label}>
                    <strong>{line.label}</strong>
                    {line.detail}
                  </li>
                ))}
              </ul>
            </section>
          )}
          <p className={styles.eta}>预计时长约 {meta.estimatedMinutes} 分钟</p>
          {playable ? (
            <Link
              href={`/challenges/${meta.id}/play`}
              className={styles.primary}
            >
              {playCtaLabel(meta.id)}
            </Link>
          ) : (
            <span className={styles.primary} aria-disabled>
              即将开发
            </span>
          )}
        </div>
      </article>
    </main>
  );
}
