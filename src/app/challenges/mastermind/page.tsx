import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChallenge } from "@/challenges/registry";
import { DIFFICULTIES } from "@/games/mastermind/rules";
import { ModuleCover } from "@/components/home/ModuleCover";
import styles from "./ChallengeIntro.module.css";

export const metadata: Metadata = {
  title: "密码破译 · 一局",
  description: "Mastermind 风格色码破译挑战:三档难度,位准与色准反馈。",
};

export default function MastermindIntroPage() {
  const meta = getChallenge("mastermind");
  if (!meta) notFound();

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
          <p className={styles.status}>挑战局 · 可开始</p>
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
          <section className={styles.block}>
            <h2>难度一览</h2>
            <ul className={styles.diffList}>
              {(Object.keys(DIFFICULTIES) as Array<keyof typeof DIFFICULTIES>).map(
                (id) => {
                  const d = DIFFICULTIES[id];
                  return (
                    <li key={id}>
                      <strong>{d.label}</strong>
                      {d.codeLength} 位 · {d.colorCount} 色 · {d.maxAttempts}{" "}
                      次
                      {d.allowDuplicates ? " · 可重复" : " · 无重复"}
                    </li>
                  );
                },
              )}
            </ul>
          </section>
          <p className={styles.eta}>预计时长约 {meta.estimatedMinutes} 分钟</p>
          <Link href="/challenges/mastermind/play" className={styles.primary}>
            开始破译
          </Link>
        </div>
      </article>
    </main>
  );
}
