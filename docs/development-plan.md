# 「一局(Yiju)」开发计划 — 首发模组《找回走丢的猫》

> 日期:2026-07-20
> 对应产品文档:[product-plan.md](product-plan.md)
> 原则:mock 优先、引擎与内容分离、每步有验证门禁——与 Photo Studio / Evidence Graph 同规格

---

## 1. 技术选型

| 层 | 选择 | 理由 |
| --- | --- | --- |
| 框架 | **Next.js 15 + TypeScript(App Router)** | 与 Photo Studio / Evidence Graph 同栈,复用经验;P1 接 LLM 时 API Route 现成 |
| 状态 | React 内置(useReducer)+ 纯函数引擎 | 游戏状态是单机单局,不需要 Zustand/服务端状态 |
| 样式 | CSS Modules + design tokens | 单页游戏,不引 Tailwind 也可;按 web 规则用 CSS 变量管理 token |
| 存档 | localStorage(单局快照,防误刷新) | P0 无账号无后端 |
| 单元测试 | Vitest | 引擎纯函数,天然易测 |
| E2E | Playwright(端口错开兄弟项目,建议 3219) | Evidence Graph 用 3217,避免冲突 |
| LLM(P1 才接) | API Route 后端代理;provider 可换,默认 mock | 密钥不进前端;沿用 Photo Studio 的"有界真实调用"策略 |

### 1.1 关键架构决策:引擎与内容分离

```text
src/
├── engine/                 # 纯函数,不依赖 React/DOM
│   ├── types.ts            # GameState、Intent、EventCard、Outcome
│   ├── intent.ts           # 输入 → Intent(P0 关键词表;P1 可换 LLM,接口不变)
│   ├── reducer.ts          # (state, intent) → { nextState, eventId }
│   ├── rules.ts            # 天色推进、行动扣除、胜负判定
│   └── narrator.ts         # (eventId, state) → 叙述文本(P0 模板池;P1 可换 LLM)
├── content/
│   └── lost-cat/           # 模组 = 纯数据,引擎不认识"猫"
│       ├── module.ts       # 初始状态、地点、角色、结局配置
│       ├── events.ts       # 事件卡:触发条件 + 状态效果 + 模板 key
│       ├── templates.ts    # 叙述模板池(每事件 ≥2 套)
│       └── lexicon.ts      # 意图关键词/同义词表(含模糊指代映射)
├── components/
│   ├── game/               # NarrativeLog、StatusPanel、ActionInput、EndingScreen
│   └── ui/
├── app/
│   ├── page.tsx            # 游戏主页
│   └── api/narrate/        # P1 才启用的 LLM 代理(P0 不建)
└── styles/
```

约束:

- `engine/` 与 `content/` **禁止 import React**;引擎只吃数据,换模组不改引擎(P2 验证点)
- `intent.ts` 和 `narrator.ts` 各留一个接口位(`IntentResolver` / `Narrator`),P0 mock 实现与 P1 LLM 实现同接口——**换真模型时 UI 与 reducer 一行不改**
- 状态更新全部走不可变模式(reducer 返回新对象)

### 1.2 意图解析(P0 mock 方案)

1. 输入归一化(去空白、全半角、常见错字不处理)
2. 依次匹配:`finish` 关键词(回家/带回)→ `move`(地点同义词表:草丛=绿化带)→ `talk`(人物同义词表:红衣服的阿姨=陈阿姨)→ `use` / `call` / `search`
3. 全部不中 → `unknown`,返回引导文案,**不扣行动**
4. 词表放 `content/lost-cat/lexicon.ts`,属于模组数据

验收:准备 ≥40 条真实口语输入的用例表(含模糊指代、错别字、废话),命中率 ≥85%,`unknown` 兜底不误伤。

---

## 2. 里程碑与验证门禁

采用 2 周 MVP 节奏,每个 PR 合并前跑 `lint + test`。

### M0:项目骨架(0.5 天)

- [ ] `create-next-app` + TypeScript + Vitest + Playwright 配置(端口 3219)
- [ ] `engine/types.ts` 全量类型定义
- [ ] CI 脚本:`npm run lint && npm run test:ci`
- 验证:空引擎单测通过,`npm run dev` 可打开占位页

### M1:引擎核心(2–3 天)——先写测试

TDD 顺序,每条先红后绿:

- [ ] `rules.ts`:天色推进(每 3 行动一档)、行动扣除、失败判定 → 单测覆盖边界(第 12 次行动、天黑瞬间)
- [ ] `reducer.ts`:六类意图的状态转移 → 单测覆盖每类意图 + 非法前置(无手电照车库)
- [ ] `intent.ts`:关键词解析 → 用 40 条用例表做表驱动测试
- [ ] 防刷:同线索不重复、重复对话给短句仍扣行动 → 单测
- 门禁:**引擎模块行覆盖 ≥90%**(纯函数没理由低);全局 ≥80%

### M2:找猫模组内容(2 天)

- [ ] `module.ts` / `events.ts` / `templates.ts` / `lexicon.ts` 全量事件卡(§6 内容骨架)
- [ ] 每事件 ≥2 套叙述模板
- [ ] **通关路径快照测试**:脚本喂"最优 7 步输入序列" → 断言通关;喂"12 步无效行动" → 断言失败。这两条是回归主干,内容改动跑它防破
- 门禁:通关/失败两条自动化路径全绿

### M3:界面(2–3 天)

- [ ] 叙事区(滚动、玩家输入回显、事件叙述)
- [ ] 状态面板(四状态 + 当前地点;移动端折叠胶囊)
- [ ] 输入区(回车提交、行动中禁用、unknown 引导展示)
- [ ] 结局页(通关回顾 / 失败温和文案)+「再来一局」
- [ ] localStorage 快照:刷新恢复当前局
- [ ] 视觉:先走一次 frontend-design 流程定方向,不用默认模板脸
- 门禁:Playwright E2E 两条(通关流、失败流);320/768/1440 三档截图无溢出;键盘可完整操作

### M4:P0 收尾与自测(1 天)

- [ ] 按产品文档 §9 成功标准逐条自测并记录
- [ ] README(玩法一句话、本地运行、架构图、mock 策略说明)
- [ ] `PROJECT_STATUS.md` 建档(与兄弟项目同规格)
- 产出:可本地开玩的 P0,邀请 1–2 人试玩收集反馈

**P0 合计:约 8–10 个工作日。**

### M5(P1,P0 验收通过后再排):真模型接入

- [ ] `app/api/narrate` 代理路由;密钥走环境变量,启动校验
- [ ] `Narrator` 的 LLM 实现:输入 = 事件卡 + 状态摘要,输出受 prompt 约束「只润色,不发明线索/不改状态」
- [ ] 每局 LLM 调用上限(如 15 次),超限静默回落模板——UI 不感知
- [ ] `IntentResolver` 的 LLM 实现(仅当关键词命中率实测不足时才做)
- [ ] 自动化测试全部走 mock;真实调用只留一个有界 smoke(手动触发)
- [ ] 部署(Vercel 或同类;API Route 加基础速率限制)

---

## 3. 测试策略汇总

| 层 | 工具 | 重点 |
| --- | --- | --- |
| 引擎单测 | Vitest | 状态机边界、意图表驱动(40 例)、防刷规则;覆盖 ≥90% |
| 内容回归 | Vitest 快照/序列测试 | 最优通关序列、必失败序列 |
| E2E | Playwright(:3219) | 通关流、失败流、刷新恢复、再来一局 |
| 视觉/无障碍 | Playwright 截图 + 键盘走查 | 320/768/1440;输入框焦点管理;reduced-motion |
| LLM(P1) | mock 全覆盖 + 有界 smoke | 自动化零真实调用;prompt 约束用固定 fixture 验证 |

Flaky 防线:E2E 全部用确定性等待(等元素/等文本),禁止裸 timeout;mock 叙述模板随机性在测试模式下用固定 seed。

---

## 4. 成本控制

- P0:**零 API 成本**,无外部依赖
- P1:单局调用上限 + 全局日上限(环境变量配置);超限回落模板,不报错不阻塞
- 测试与 CI 永不真实调用(与 Photo Studio 策略一致)

---

## 5. 风险与对策

| 风险 | 对策 |
| --- | --- |
| 关键词意图解析命中率不够,体验像"猜口令" | 40 例用例表先行;`unknown` 不扣行动;词表持续补充;实在不行 P1 上 LLM 解析(接口已预留) |
| 模板叙述重复感强,"游戏"变"填空" | 每事件 ≥2 模板 + 状态化变体(天色/线索数影响措辞);P1 用 LLM 润色 |
| 内容与引擎耦合,P2 加模组要改引擎 | M1 起强制 `engine/` 不 import `content/`;M2 的模组纯数据化;P2 用第二模组验证 |
| 一局节奏失衡(太快通关/根本通不了) | M2 的两条序列测试锁死最短路径步数;试玩反馈调行动配额 |
| 范围膨胀(想同时做 5 个模组/加账号) | 产品文档 §1.4 明确不做;新想法进 backlog 不进 P0/P1 |

---

## 6. 目录与文档规格(对齐兄弟项目)

- `README.md`:定位、玩法一句话、本地命令、mock/成本策略
- `docs/product-plan.md`:产品定稿(已有)
- `docs/development-plan.md`:本文档
- `PROJECT_STATUS.md`:M0 时建立,每里程碑更新
- git:M0 即 `git init`,按 conventional commits;里程碑打 tag
