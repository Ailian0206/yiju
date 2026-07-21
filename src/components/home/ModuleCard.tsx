"use client";

import Link from "next/link";
import type { ModuleMeta } from "@/content/types";
import { ModuleCover } from "@/components/home/ModuleCover";
import styles from "./ModuleCard.module.css";

interface ModuleCardProps {
  module: ModuleMeta;
}

export function ModuleCard({ module }: ModuleCardProps) {
  // 一律先到介绍页:故事背景 + 玩法,可玩模组再点「开始这一局」
  const href = `/modules/${module.id}`;
  const cta = module.status === "playable" ? "了解并开始" : "即将开发";

  return (
    <article className={styles.card} data-status={module.status}>
      <Link href={href} className={styles.link}>
        <div className={styles.coverWrap} data-module={module.id}>
          <ModuleCover className={styles.cover} src={module.coverSrc} />
          {module.status === "preview" && <span className={styles.badge}>即将开发</span>}
        </div>
        <div className={styles.body}>
          <h2 className={styles.title}>{module.title}</h2>
          <p className={styles.tagline}>{module.tagline}</p>
          <p className={styles.story}>{module.storyBackground}</p>
          <p className={styles.how}>
            <span className={styles.howLabel}>玩法</span>
            {module.howToPlay}
          </p>
          <div className={styles.footer}>
            <span className={styles.eta}>约 {module.estimatedMinutes} 分钟</span>
            <span className={styles.cta}>{cta}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
