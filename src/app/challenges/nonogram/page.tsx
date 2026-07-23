import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getChallenge } from "@/challenges/registry";
import { LEVELS } from "@/games/nonogram/rules";
import { ModuleCover } from "@/components/home/ModuleCover";
import styles from "../mastermind/ChallengeIntro.module.css";

export const metadata: Metadata = {
  title: "数织试玩 · 一局",
  description: "Nonogram 数织试玩:行列线索交叉推理。",
};

export default function NonogramIntroPage() {
  const meta = getChallenge("nonogram");
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
            height={540}
          />
        </div>
        <div className={styles.content}>
          <p className={styles.status}>挑战局 · 试玩 Demo</p>
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
              {(Object.keys(LEVELS) as Array<keyof typeof LEVELS>).map((id) => (
                <li key={id}>
                  <strong>{LEVELS[id].label}</strong>
                  {LEVELS[id].size}×{LEVELS[id].size} 线索交叉推理
                </li>
              ))}
            </ul>
          </section>
          <p className={styles.eta}>预计时长约 {meta.estimatedMinutes} 分钟</p>
          <Link href="/challenges/nonogram/play" className={styles.primary}>
            开始试玩
          </Link>
        </div>
      </article>
    </main>
  );
}
