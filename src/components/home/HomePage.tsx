import { listModules } from "@/content/registry";
import { ModuleCard } from "@/components/home/ModuleCard";
import styles from "./HomePage.module.css";

export function HomePage() {
  const modules = listModules();

  return (
    <div className={styles.page}>
      <div className={styles.atmosphere} aria-hidden />
      <header className={styles.hero}>
        <p className={styles.eyebrow}>轻量中文文字局</p>
        <h1 className={styles.brand}>一局</h1>
        <p className={styles.lead}>
          每一局都有限时、可见状态和明确结局。用自然语言玩,不是无限闲聊。
        </p>
      </header>
      <section className={styles.section} aria-labelledby="module-heading">
        <h2 id="module-heading" className={styles.sectionTitle}>
          选择一局
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
