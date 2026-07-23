import { listModules } from "@/content/registry";
import { listChallenges } from "@/challenges/registry";
import { ModuleCard } from "@/components/home/ModuleCard";
import { ChallengeCard } from "@/components/home/ChallengeCard";
import styles from "./HomePage.module.css";

export function HomePage() {
  const modules = listModules();
  const challenges = listChallenges();

  return (
    <div className={styles.page}>
      <div className={styles.atmosphere} aria-hidden />
      <header className={styles.hero}>
        <p className={styles.eyebrow}>轻量中文文字局 · 益智挑战</p>
        <h1 className={styles.brand}>一局</h1>
        <p className={styles.lead}>
          每一局都有限时、可见状态和明确结局。故事局用自然语言推进;挑战局可试玩数织与数独
          等推理向 Demo。
        </p>
      </header>
      <section className={styles.section} aria-labelledby="challenge-heading">
        <h2 id="challenge-heading" className={styles.sectionTitle}>
          挑战局
        </h2>
        <div className={styles.challengeGrid}>
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </section>
      <section className={styles.section} aria-labelledby="module-heading">
        <h2 id="module-heading" className={styles.sectionTitle}>
          故事局
        </h2>
        <div className={styles.grid}>
          {modules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>
    </div>
  );
}
