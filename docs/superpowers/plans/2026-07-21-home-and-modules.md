# P2 主页 + 四模组扩展 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为「一局」做平台主页,用封面与路由把《找猫》+ 候选池另外 4 个模组收进同一壳;按序做可玩内容,并用生图补封面与局内关键插图。

**Architecture:** 保留 `engine/` 与 `content/` 分离;`content/registry.ts` 注册模组元数据(封面/卖点/可玩状态);`/` 为选关主页,`/play/[moduleId]` 挂载通用 `GameScreen`;生图资产进 `public/modules/{id}/`,内容层只引用路径不塞 base64。

**Tech Stack:** Next.js App Router · CSS Modules + tokens · Vitest/Playwright · Dofun `gpt-image-2` 生图(封面/插图) · DeepSeek 叙述沿用现有 `/api/narrate`(按模组 prompt 分发)

---

## 0. 背景与约束

### 0.1 现状

- 《找回走丢的猫》P0+P1 已闭环(引擎、内容、UI、DeepSeek 填词、呼叫补齐)。
- 当前 `src/app/page.tsx` **直接渲染** `GameScreen`,没有选关壳。
- 产品文档 §8.4 候选池另有 4 个模组:**相亲局翻车**、**电梯故障 60 分钟**、**春运抢票夜**、**照顾植物一周**。
- §8.4 原文约束:**不并行开发模组**——本计划改为「主页一次收齐展示,内容按序一个一个做」,与「不并行写 4 套完整事件卡」不冲突。

### 0.2 用户本次目标(已对齐)

1. 做主页,把另外 4 个模组也集成进来(共 5 个入口)。
2. 生图做封面;游戏内也可做资源图。
3. **先写开发计划,确认后再动手实现。**

### 0.3 方案对比(头脑风暴收敛)

| 方案 | 核心思路 | 优点 | 缺点 | 结论 |
| --- | --- | --- | --- | --- |
| A. 一次做满 5 个可玩模组 | 并行堆事件卡+插图 | 上线即「整站可玩」 | 工期长、质量不均、违背引擎验证节奏 | 不采用 |
| B. 主页壳 + 封面,其余灰显 | 只做选关与视觉 | 最快有作品集门面 | 点进去多数不能玩,体感空 | 仅作过渡,不作为终点 |
| **C. 主页壳 + 全封面 + 按序解锁可玩(推荐)** | 先壳与资源,再按难度逐个模组可玩 | 每步可验收;尽早验证引擎复用;封面先到位 | 中期会有「能看不能玩」卡片 | **采用** |

### 0.4 模组交付顺序(推荐)

按「引擎改动量从小到大」排序,避免一上来改多日制:

| 顺序 | 模组 ID | 名称 | 理由 |
| --- | --- | --- | --- |
| 0(已有) | `lost-cat` | 找回走丢的猫 | 首发已完成 |
| 1 | `elevator` | 电梯故障 60 分钟 | 单地点、状态少,最适合验证「换模组不改引擎」 |
| 2 | `blind-date` | 相亲局翻车 | 对话密集,主要吃内容与角色口吻 |
| 3 | `chunyun` | 春运抢票夜 | 可复用「天色/时限」压力机制 |
| 4 | `plant-week` | 照顾植物一周 | 需引擎支持「日/阶段」分段,放最后 |

---

## 1. 目标文件结构

```text
src/
├── app/
│   ├── page.tsx                    # 主页:模组网格
│   ├── play/[moduleId]/page.tsx   # 游玩页
│   ├── api/narrate/route.ts        # 扩展:按 moduleId 选 SYSTEM_PROMPT
│   └── layout.tsx
├── content/
│   ├── registry.ts                 # ModuleMeta[] 唯一注册表
│   ├── types.ts                    # ModuleMeta / ModuleBundle 类型
│   ├── lost-cat/                   # 已有,补 cover + 可选插图引用
│   ├── elevator/                   # 新
│   ├── blind-date/                 # 新
│   ├── chunyun/                    # 新
│   └── plant-week/                 # 新(偏后)
├── components/
│   ├── home/                       # HomeHero、ModuleCard、ModuleGrid
│   └── game/                       # GameScreen 改为接收 module bundle
├── hooks/
│   └── useGameSession.ts           # 改为按 moduleId 装配 resolver/events/narrator
public/
└── modules/
    ├── lost-cat/cover.png
    ├── elevator/cover.png
    ├── ...
    └── {id}/scenes/*.png           # 局内关键插图(可选挂事件)
scripts/
└── generate-module-art.mjs         # 批量生图脚本(调 Dofun),输出到 public/modules/
docs/
├── art-briefs.md                   # 统一画风与每张图的 prompt 简报
└── superpowers/plans/2026-07-21-home-and-modules.md  # 本文
```

### 1.1 关键类型(拟)

```ts
// content/types.ts
export interface ModuleMeta {
  id: string;
  title: string;
  tagline: string;          // 一句话卖点
  coverSrc: string;         // /modules/{id}/cover.png
  status: "playable" | "preview"; // preview = 主页可见但进不去或进占位页
  estimatedMinutes: number;
}

export interface ModuleBundle {
  meta: ModuleMeta;
  createInitialState: () => GameState;
  vocabulary: VocabularyConfig;
  events: readonly EventCard[];
  createNarrator: (opts?: LostCatNarratorOptions) => Narrator; // 或通用 NarratorOptions
  openingNarration: string;
  getSuggestedActions?: (state: GameState) => string[];
  statusLabels?: Record<string, string>; // 状态面板文案定制(可选)
}
```

---

## 2. 视觉与生图规范

### 2.1 统一画风(所有封面/插图共用)

- 气质:暖调黄昏「故事本」插画,与现有 CSS tokens(`--color-paper` / accent 橙赭)一致。
- 避免:赛博紫、扁平 emoji 贴纸风、照片级写实、英文水印、文字塞进图里(标题用 HTML)。
- 构图:封面竖/方构图皆可,默认 `1024x1024` 或 `1536x1024` 横版封面;局内插图优先横版氛围图。
- 工具:Dofun `gpt-image-2`(`~/.codex/skills/dofun-image`),脚本写入 `public/modules/...`,**不把 key 写进仓库**。

### 2.2 资产清单(最小集)

| 资产 | 数量 | 用途 |
| --- | --- | --- |
| 平台主视觉(可选) | 1 | 主页 hero 背景氛围 |
| 每模组封面 | 5 | ModuleCard |
| 找猫补强插图 | 3–4 | 开局/绿化带/车库/重逢(可选挂日志旁) |
| 每新模组开局+结局插图 | 各 2 | 开局氛围 + 通关/失败各一(可第二轮再加中段) |

第一期生图优先级:**5 张封面必须先有** → 主页才能不空;局内插图随该模组内容里程碑一起做。

### 2.3 `docs/art-briefs.md`(实现前先落盘)

为每张图写固定字段:`id` / `path` / `size` / `prompt(中文+画风后缀)` / `negative`。实现时脚本只读 brief,禁止临时瞎改风格。

---

## 3. 里程碑拆分

| 里程碑 | 内容 | 预估 | 完成定义 |
| --- | --- | --- | --- |
| **M6** | 模组注册表 + 主页 + `/play/[moduleId]` 路由;找猫迁入新路由;4 新模组 `preview` 卡片+封面 | 2–3 天 | 主页可见 5 卡;点找猫可玩;点其它进「即将开放」或灰态;E2E 覆盖主页→开玩 |
| **M7** | 生图流水线脚本 + art-briefs;5 封面入库;找猫 2–3 张局内图可选接入 | 1–2 天 | `public/modules/**` 有图;README 说明如何重生图 |
| **M8** | 《电梯故障》完整可玩(内容+测试+开局引导策略沿用「仅开局一次」) | 3–4 天 | 通关/失败序列单测;E2E 一条最短通关 |
| **M9** | 《相亲局翻车》完整可玩 | 4–5 天 | 同上 + 对话向词表命中率用例 |
| **M10** | 《春运抢票夜》完整可玩 | 3–4 天 | 复用时限机制;序列测试 |
| **M11** | 引擎「日/阶段」扩展 + 《照顾植物一周》 | 4–6 天 | 新规则有单测;植物模组可玩 |
| **M12** | 局内插图挂载(事件触发展示) + 主页打磨 + 状态归档 | 2 天 | 至少 2 个模组有局内图;PROJECT_STATUS 更新 |

**合计粗估:** 约 3–4 周(单人 Agent 节奏,含测试与 PR 审查)。可按你时间砍到「只做到 M8」先收一波。

---

## 4. 分任务清单(M6–M7 先做;后序模组同构)

### Task 1: ModuleMeta 类型与注册表(空壳)

**Files:**
- Create: `src/content/types.ts`
- Create: `src/content/registry.ts`
- Create: `src/content/registry.test.ts`

- [ ] **Step 1:** 写失败测试:`listModules()` 返回 ≥1 项且含 `lost-cat`;`getModule("lost-cat")` 非空
- [ ] **Step 2:** 跑测确认 RED
- [ ] **Step 3:** 最小实现注册表(暂只注册找猫 meta,`status: "playable"`)
- [ ] **Step 4:** 绿测后提交 `feat: 增加模组注册表`

### Task 2: 路由拆分 — 主页与游玩页

**Files:**
- Modify: `src/app/page.tsx` → 主页
- Create: `src/app/play/[moduleId]/page.tsx`
- Create: `src/components/home/ModuleGrid.tsx` 等
- Modify: `src/components/game/GameScreen.tsx` / `useGameSession.ts` 接收 `moduleId`
- Test: `e2e/home.spec.ts`

- [ ] **Step 1:** E2E RED:访问 `/` 看到「一局」与找猫卡片;点进可玩
- [ ] **Step 2:** 实现主页网格 + `/play/lost-cat` 迁入现有 GameScreen
- [ ] **Step 3:** 未知 `moduleId` → notFound 或友好页
- [ ] **Step 4:** 门禁 + 提交 `feat: 主页选关与 play 路由`

### Task 3: 四模组 preview 元数据(尚无玩法)

**Files:**
- Modify: `src/content/registry.ts`
- Create: 各模组 `content/{id}/meta.ts`(仅 meta)

- [ ] **Step 1:** 注册 4 个 `status: "preview"` 条目(标题/卖点来自产品文档 §8.4)
- [ ] **Step 2:** ModuleCard 对 preview 显示「即将开放」,不可进入完整局(或进占位说明页)
- [ ] **Step 3:** 单测:registry 长度为 5;preview 不可被 `getPlayableModule` 返回
- [ ] **Step 4:** 提交 `feat: 注册四候选模组预览卡`

### Task 4: 生图 brief + 脚本 + 5 封面

**Files:**
- Create: `docs/art-briefs.md`
- Create: `scripts/generate-module-art.mjs`(或 `.py` 调 dofun skill 脚本)
- Create: `public/modules/*/cover.png`

- [ ] **Step 1:** 写齐 5 张封面的 prompt brief(统一画风后缀)
- [ ] **Step 2:** 脚本读取 brief → 调用 Dofun → 写入 `public/modules/{id}/cover.png`
- [ ] **Step 3:** 主页 ModuleCard 使用真实封面(无图时用色块 fallback,避免破图)
- [ ] **Step 4:** 提交 `feat: 模组封面资源与生图脚本`(注意:大图用 Git LFS 或压缩 WebP——实现时二选一写进 README)

### Task 5: narrate API 按模组分发 prompt

**Files:**
- Modify: `src/app/api/narrate/route.ts`
- Modify: `src/content/lost-cat/llm-narrator.ts`(请求体带 `moduleId`)
- Test: `route.test.ts`

- [ ] **Step 1:** RED:请求体 `moduleId: "lost-cat"` 走找猫 prompt;未知 id → 400
- [ ] **Step 2:** GREEN:prompt 表放 `content/{id}/narrate-prompt.ts`
- [ ] **Step 3:** 提交 `feat: narrate 按模组选择系统提示`

### Task 6+: 各模组内容(M8–M11 重复此模板)

对每一个新模组:

1. `module.ts` / `lexicon.ts` / `events.ts` / `templates.ts` / `suggestions.ts`
2. 通关序列 + 必败序列单测(照抄找猫 `content.test.ts` 结构)
3. registry 将该模组改为 `playable`
4. E2E 最短通关 1 条
5. 该模组开局+结局插图(可选同 PR 或紧随的 art PR)
6. 独立里程碑分支与 PR(遵守 AGENT:不同时开多个 PR)

《植物一周》额外 Task:先给 `engine/rules.ts` 增加 `phase`/`day` 字段与推进规则的 **失败测试 → 实现**,再写内容。

### Task N: 局内插图挂载(M12)

**Files:**
- Modify: `NarrativeLog` 或新建 `SceneArt`
- Modify: 事件 outcome → 可选 `imageSrc`

- [ ] **Step 1:** 约定 EventCard 或 template 侧可选 `imageKey`
- [ ] **Step 2:** 触发后在叙事区展示一张插图(不遮挡输入)
- [ ] **Step 3:** 找猫 + 电梯各至少 1 张验证
- [ ] **Step 4:** 提交 `feat: 叙事区事件插图`

---

## 5. 引擎改动边界(提前说清)

| 改动 | 何时需要 | 是否阻塞主页 |
| --- | --- | --- |
| 无 | M6–M7、电梯/相亲/春运(若状态模型能映射到现有 `sky/clues/closeness/actions`) | 否 |
| `GameState` 增加可选 `phase`/`day` | 植物一周 | 否(最后做) |
| 状态面板字段可配置 | 若某模组四状态语义完全不同 | 可延后,先复用四槽改文案 |

原则:**能用现有四状态表达的模组,不先扩引擎。**

---

## 6. 测试与门禁

每个里程碑 PR 合并前:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
```

新增最低要求:

- registry 单测
- 主页 E2E(选关 → 找猫开玩 → 返回)
- 每新可玩模组:内容序列测试 + 1 条 E2E 通关

生图:**不进 CI 真实调用**;只提交已生成的静态资源。

---

## 7. 风险与对策

| 风险 | 对策 |
| --- | --- |
| 一次承诺 4 个可玩导致烂尾 | 主页先收口;可玩按序;允许长期 preview |
| 生图风格不统一 | `art-briefs.md` 固定画风后缀;一批生成 |
| 大图撑爆仓库 | WebP/压缩;单封面 < 300KB 目标 |
| 找猫迁路由回归 | 先迁路由再加卡;E2E 锁通关/失败 |
| 植物一周拖垮引擎 | 明确放 M11;前面 3 个不依赖它 |
| DeepSeek 成本随模组增加 | 继续仅 filler 路由 + 每局上限;prompt 分模组 |

---

## 8. 建议的确认点(你拍板后再开写代码)

请确认以下默认选择(不同意直接改):

1. **采用方案 C**:主页一次展示 5 模组;内容按 电梯 → 相亲 → 春运 → 植物 顺序做可玩。
2. **第一期交付切分**:先做完 **M6+M7**(主页+路由+5 封面+找猫可玩),再开 M8 电梯。
3. **生图**:用公司 Dofun `gpt-image-2`;图进 `public/modules/`。
4. **preview 模组**:卡片可点进「故事简介 + 即将开放」,不假装可玩。

确认后从 **Task 1(注册表)** 起按 TDD 开 `feat/m6-home-registry` 分支。

---

## 9. 文档同步(实现时)

- 更新 `docs/product-plan.md` §8:P2 描述与「主页壳」对齐
- 更新 `docs/development-plan.md` 或另存本文件为权威 P2 计划
- 每个里程碑合并后更新 `PROJECT_STATUS.md`
