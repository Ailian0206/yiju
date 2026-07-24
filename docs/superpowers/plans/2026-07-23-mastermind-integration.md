# Mastermind 挑战局完整集成 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将「密码破译」从试玩原型升级为与故事模组同级的完整挑战局:首页插画入口 → 介绍页 → 浅色游玩页。

**Architecture:** 挑战局与文字 `engine/`/`content/` 解耦,新建 `src/challenges/` 注册表与元数据;路由对齐模组:`/challenges/mastermind`(介绍) → `/challenges/mastermind/play`(游玩)。封面用静态 SVG 插画(免付费生图)。游玩 UI 改用项目暖纸浅色 tokens。

**Tech Stack:** Next.js App Router · CSS Modules · Vitest · 现有 Mastermind 规则(`src/games/mastermind`)

---

## File Map

| 路径 | 职责 |
| --- | --- |
| `src/challenges/types.ts` | ChallengeMeta |
| `src/challenges/registry.ts` | list/get |
| `src/challenges/mastermind/meta.ts` | 文案与封面路径 |
| `public/challenges/mastermind/cover.svg` | 首页/介绍插画 |
| `src/components/home/ChallengeCard.tsx` | 首页卡片 |
| `src/app/challenges/mastermind/page.tsx` | 介绍页(原游玩页迁走) |
| `src/app/challenges/mastermind/play/page.tsx` | 浅色游玩页 |
| `MastermindGame.module.css` | 浅色主题重写 |
| `README.md` / `PROJECT_STATUS.md` | 文档同步 |

---

### Task 1: Challenge registry (TDD)

**Files:**
- Create: `src/challenges/types.ts`
- Create: `src/challenges/mastermind/meta.ts`
- Create: `src/challenges/registry.ts`
- Test: `src/challenges/registry.test.ts`

- [ ] **Step 1:** 写失败测试:`listChallenges` 含 mastermind;`getChallenge` 返回中文标题与 playable
- [ ] **Step 2:** 最小实现 types/meta/registry
- [ ] **Step 3:** 测试通过后 commit

### Task 2: Cover SVG + homepage card

**Files:**
- Create: `public/challenges/mastermind/cover.svg`
- Create: `src/components/home/ChallengeCard.tsx` (+ css)
- Modify: `HomePage.tsx` / `HomePage.module.css`

- [ ] **Step 1:** 绘制浅色暖调色钉/终端插画 SVG
- [ ] **Step 2:** ChallengeCard 对齐 ModuleCard 信息结构,链到介绍页
- [ ] **Step 3:** 首页「挑战局」区改用卡片
- [ ] **Step 4:** commit

### Task 3: Intro page

**Files:**
- Modify: `src/app/challenges/mastermind/page.tsx` → 介绍页
- Create: `ChallengeIntro.module.css`(或复用样式片段)

- [ ] **Step 1:** 介绍页展示封面、背景、玩法、难度说明、「开始破译」→ `/play`
- [ ] **Step 2:** commit

### Task 4: Light play theme

**Files:**
- Create: `src/app/challenges/mastermind/play/page.tsx`
- Modify: `MastermindGame.tsx` / `.module.css`

- [ ] **Step 1:** 游玩路由迁到 `/play`
- [ ] **Step 2:** 浅色纸面 + 墨色文字 + accent;保留左右布局与反馈右对齐
- [ ] **Step 3:** 视觉自检(Playwright 截图)
- [ ] **Step 4:** commit

### Task 5: Docs + gate

**Files:**
- Modify: `README.md`, `PROJECT_STATUS.md`

- [ ] **Step 1:** 写明挑战局路径与浅色游玩
- [ ] **Step 2:** `vitest` 聚焦 + lint + typecheck
- [ ] **Step 3:** commit

---

## Done when

- 主页有插画入口 → 介绍 → 浅色游玩全链路可点
- 深色游玩主题已移除
- registry 测试绿;文档已更新
