import Link from "next/link";
import { notFound } from "next/navigation";
import { getModule } from "@/content/registry";
import { ModuleCover } from "@/components/home/ModuleCover";
import styles from "./ModuleIntro.module.css";

interface ModuleIntroPageProps {
  params: Promise<{ moduleId: string }>;
}

export default async function ModuleIntroPage({ params }: ModuleIntroPageProps) {
  const { moduleId } = await params;
  const meta = getModule(moduleId);
  if (!meta) notFound();

  const isPlayable = meta.status === "playable";

  return (
    <main className={styles.page}>
      <div className={styles.atmosphere} aria-hidden />
      <Link href="/" className={styles.back}>
        ← 返回一局
      </Link>
      <article className={styles.panel}>
        <div className={styles.coverWrap} data-module={meta.id}>
          <ModuleCover className={styles.cover} src={meta.coverSrc} width={960} height={600} />
        </div>
        <p className={styles.status}>{isPlayable ? "可开始" : "即将开发"}</p>
        <h1 className={styles.title}>{meta.title}</h1>
        <p className={styles.tagline}>{meta.tagline}</p>
        <section className={styles.block}>
          <h2>故事背景</h2>
          <p>{meta.storyBackground}</p>
        </section>
        <section className={styles.block}>
          <h2>玩法介绍</h2>
          <p>{meta.howToPlay}</p>
        </section>
        <p className={styles.eta}>预计时长约 {meta.estimatedMinutes} 分钟</p>
        {isPlayable ? (
          <Link href={`/play/${meta.id}`} className={styles.primary}>
            开始这一局
          </Link>
        ) : (
          <p className={styles.soon}>此模组正在开发中,完成后会在主页开放开玩入口。</p>
        )}
      </article>
    </main>
  );
}
