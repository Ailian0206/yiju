# 一局(Yiju)

轻量中文网页游戏平台:故事局用自然语言推进(有限回合、可见状态、明确结局);另有益智**挑战局**《密码破译》(Mastermind)。

- 产品文档:[`docs/product-plan.md`](docs/product-plan.md)
- 开发计划:[`docs/development-plan.md`](docs/development-plan.md)
- 当前进度:[`PROJECT_STATUS.md`](PROJECT_STATUS.md)
- 在线试玩:[https://ailian0206.github.io/yiju/](https://ailian0206.github.io/yiju/)(GitHub Pages 静态站;**无真实 LLM**,填词区回落模板)

## 挑战局 · 密码破译

- 介绍页:`/challenges/mastermind`(设定、玩法、难度一览)
- 游玩页:`/challenges/mastermind/play`(浅色暖纸 UI;简单/普通/困难)
- 与文字引擎解耦,规则在 `src/games/mastermind/`,注册表在 `src/challenges/`

## 本地开发

```bash
npm install
npm run dev            # http://localhost:3000
npm run lint            # ESLint
npm run typecheck       # tsc --noEmit
npm run test            # Vitest 单元测试
npm run test:coverage   # 单元测试 + 覆盖率(engine/content ≥80% 门禁)
npm run test:e2e        # Playwright E2E(端口 3219)
npm run test:ci         # 上面全部串起来,PR 合并前的完整门禁
npm run build            # 生产构建(含 /api/narrate,可用 next start)
npm run build:pages      # GitHub Pages 静态导出 → out/(不含 API)
```

## 部署(GitHub Pages)

公开仓库推送到 `main` 后由 [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) 自动发布静态站。Pages **没有** Node 服务端,因此线上不会调用 DeepSeek;本地配置 `DEEPSEEK_API_KEY` 后 `npm run dev` 仍可走 `/api/narrate`。

## 架构

```text
玩家输入(自然语言)
      │
      ▼
engine/intent.ts ─ createKeywordIntentResolver(vocabulary)
      │  Intent { type, targetId }
      ▼
engine/reducer.ts ─ reduce(state, intent, eventCards)
      │  ReduceResult { nextState, outcome }
      ▼
engine/narrator.ts ─ createTemplatePoolNarrator(config)
      │  叙述文本(unknown/noop/无专属文案的 rejected 会先尝试真实 LLM,
      │  见下面"接入 DeepSeek";没配置或调用失败就用这条模板池路径)
      ▼
hooks/useGameSession.ts(唯一知道怎么把三者拼起来的地方)
      │  + localStorage 存档
      ▼
components/game/*(GameScreen / NarrativeLog / StatusPanel / ActionInput / EndingScreen)
```

- `engine/`:纯函数,不 import React,也不 import `content/` 下任何具体模组数据。天色推进、行动扣除、胜负判定、意图解析——这些"规则"全在这里,不交给模型自由发挥。
- `content/lost-cat/`:找猫模组的全部数据(地点、角色、事件卡、叙述模板、词表),以及把这些数据接进 LLM 的 `llm-narrator.ts` / `narrator-config.ts`。换一个模组只加这一层的文件,不改 `engine/`。
- `hooks/useGameSession.ts`:编排层,`engine/` 和 `content/` 互相都不知道对方,靠这里拼接。
- `components/game/`:纯展示 + 交互,不含游戏规则。
- `app/api/narrate/route.ts`:唯一持有 `DEEPSEEK_API_KEY` 的地方,客户端只知道 POST 这个路由,密钥不进浏览器 bundle。

## 设计原则

- **模型写故事,规则改分数**:天色推进、行动扣除、胜负判定全部由规则引擎决定,不交给模型自由发挥。
- **引擎与内容分离**:`engine/` 是纯函数,`content/lost-cat/` 是纯数据;换模组不改引擎。
- **成本有界**:不配置 `DEEPSEEK_API_KEY` 时全程 mock、零 API 成本;配置了也只在"填词区"场景(玩家输入没命中具体内容,以前只能返回统一兜底文案的地方)调用真实模型,每局有调用次数上限,超限或调用失败都静默回落模板,不报错、不阻塞。

## 接入 DeepSeek(可选)

```bash
cp .env.example .env.local
# 编辑 .env.local,填入 DEEPSEEK_API_KEY
npm run dev
```

不配置就是纯 P0 mock 体验,配置了才会在"系统没听懂/这里没这回事/条件不满足且没有专属文案"这几种此前统一返回同一句兜底文案的场景,换成真实模型按玩家原话生成的反应——主线的搜证/对话/使用文案仍然是人工写好的模板,不路由给模型(省调用次数,也保住内容质量和一致性)。

## 找猫模组玩法

- **目标**:天黑前(剩余行动次数或天色到「天黑」之前)找到走丢的猫「年糕」并带它回家。
- **怎么玩**:在输入框用自然语言描述你想做的事,比如「去绿化带」「问问门卫」「用手电照照」「带年糕回家」。系统会把它理解成移动/搜证/对话/使用/呼叫/结束六类意图之一;看不懂的输入会温和引导重来,不扣行动次数。
- **移动免费**:切换地点不消耗行动次数,只有搜证、对话、使用、呼叫、结束这些交互动作才消耗。
- **状态**:天色、线索、亲近感、剩余行动会实时显示;天色档位还会让整个页面背景真的变暗。
