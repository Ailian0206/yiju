# PROJECT_STATUS:Yiju(一局)

更新时间:2026-07-21
当前阶段:**P2:《春运抢票夜》已合并;下一局《照顾植物一周》**
决策文档:[`docs/product-plan.md`](docs/product-plan.md) · [`docs/development-plan.md`](docs/development-plan.md) · [`docs/superpowers/plans/2026-07-21-home-and-modules.md`](docs/superpowers/plans/2026-07-21-home-and-modules.md)

## 里程碑(找猫模组)

| 里程碑 | 内容 | 状态 | PR |
| --- | --- | --- | --- |
| M0 | 项目骨架(Next.js + TS + Vitest + Playwright + CI 脚本) | 已完成 | [#1](https://github.com/Ailian0206/yiju/pull/1) |
| M1 | 引擎核心(状态机、意图解析、防刷规则,TDD) | 已完成 | [#2](https://github.com/Ailian0206/yiju/pull/2) |
| M2 | 找猫模组内容(事件卡、模板、通关/失败序列测试) | 已完成 | [#3](https://github.com/Ailian0206/yiju/pull/3) |
| M3 | 界面(叙事区、状态面板、输入区、结局页) | 已完成 | [#4](https://github.com/Ailian0206/yiju/pull/4) |
| M4 | P0 收尾自测、README、状态归档 | 已完成 | [#5](https://github.com/Ailian0206/yiju/pull/5) |
| 试玩反馈修复 | 新手引导(开局叙述提示 + 建议行动按钮) | 已完成 | [#6](https://github.com/Ailian0206/yiju/pull/6) |
| M5(P1) | 接入 DeepSeek:`Narrator` 改异步、混合路由(填词区走 LLM,主线仍用模板)、`/api/narrate` 代理、每局调用上限 | 已完成(真实冒烟通过) | [#7](https://github.com/Ailian0206/yiju/pull/7) |
| 呼叫补齐 | `call` 事件卡 + `requiresCloseness`(远时首次喊名提档) | 已完成 | [#8](https://github.com/Ailian0206/yiju/pull/8) |

## P2 里程碑(主页与多模组)

| 里程碑 | 内容 | 状态 | PR |
| --- | --- | --- | --- |
| 计划 | 主页 + 五模组路线图与确认决策 | 已完成 | [#10](https://github.com/Ailian0206/yiju/pull/10) |
| M6 | 模组注册表、主页选关、`/modules/[id]` 介绍页、`/play/[id]` 可玩路由;未完成标「即将开发」 | 已完成 | [#11](https://github.com/Ailian0206/yiju/pull/11) |
| M7 | Dofun 封面 + `docs/art-briefs.md` | 已完成(与 M6 同批) | [#11](https://github.com/Ailian0206/yiju/pull/11) |
| 审核流程 | 里程碑 PR 改用 Claude `/codex-independent-pr-review` | 已完成 | [#12](https://github.com/Ailian0206/yiju/pull/12) |
| M8 | 《电梯故障 60 分钟》完整可玩 + 模组 UI 文案槽 | 已完成 | [#13](https://github.com/Ailian0206/yiju/pull/13) |
| M9 | 《相亲局翻车》完整可玩 | 已完成 | [#14](https://github.com/Ailian0206/yiju/pull/14) |
| M10 | 《春运抢票夜》完整可玩 | 已完成 | [#15](https://github.com/Ailian0206/yiju/pull/15) |
| M11 | 引擎日/阶段 + 《照顾植物一周》 | 进行中 | — |

### P2 已确认产品决策

- 主页展示全部 5 个模组;实现按序推进,未完成只展示不伪装可玩。
- 未完成状态文案:**即将开发**。
- 每局入口先到介绍页(故事背景 + 玩法),可玩模组再点「开始这一局」。
- 封面用公司 Dofun `gpt-image-2`,落盘 `public/modules/{id}/cover.webp`。

## P0 自测(对照产品文档 §9 成功标准)

| # | 标准 | 结果 | 依据 |
| --- | --- | --- | --- |
| 1 | 不看说明也能明白「要找猫、要赶在天黑前」 | 通过(经用户实测反馈修正过一次) | 标题 + 副标题点出目标;开局叙述把第一条线索缝进故事(「你想起门卫老周一直在楼下」)+ 建议行动按钮兜底,不再是容易踩空的空白输入框 |
| 2 | 用自然语言玩,不需要背指令(含模糊指代) | 通过 | `intent.test.ts` 40+ 条口语用例(含「问问那个穿红衣服的阿姨」等模糊指代);浏览器实测全程用日常表达完整通关 |
| 3 | 能稳定打出一次通关、一次失败 | 通过 | `e2e/gameplay.spec.ts` 自动化覆盖两条路径;并用 Playwright MCP 手动过了一遍通关(重逢)和失败(天黑了)两个结局页,文案与产品文档一致 |
| 4 | 体感是「在玩游戏」,不是「在跟 ChatGPT 闲聊」 | 通过 | 有明确数值状态(天色/线索/亲近感/剩余行动)、有限行动预算、天色背景随进度真实变暗、明确的通关/失败判定——不是无限续聊 |
| 5 | 一局不超过 40 分钟 | 合理推定 | 最优路径 8 次交互动作(+4 次免费移动)即可通关,12 次行动预算留出容错;真人打字节奏下远低于 40 分钟。此项依赖真人计时,自动化测试无法直接验证 |

标准 1–4 已验证通过,标准 5 是基于设计参数的合理推定——**建议用户自己实际玩一局计时确认**,这也是产品文档要求的下一步("邀请 1–2 人试玩收集反馈")。

标准 1 的初版自测(仅靠 Claude Code 自己/Playwright 手测)过于乐观:真实用户第一次玩时反馈"没有引导,很难玩",暴露了自测没覆盖到的问题——新手不知道该打什么字,容易在错误地点/时机试出静默无效的动作。已在 PR #6 修复,详见上表。

## 已知的范围内取舍(非 bug,记录以防误判)

- `call`(呼叫)已用确定性事件卡补齐:亲近感为「远」时首次呼喊提到「有动静」,之后走 repeat 文案(产品文档 §6 的「概率性」用确定性代替,避免引擎引入 RNG)。
- 字体用系统中文字体栈(PingFang SC / Songti SC / Microsoft YaHei),没有用 `next/font/google` 拉 Noto Serif/Sans SC——本地网络环境下拉不动完整字重文件,详见 `feat/m3-ui` PR 说明。
- `engine/intent.ts` 仍是纯关键词解析,没有接 LLM——产品文档 §9 标准 2(自然语言、不用背指令)已经用 40+ 用例和真实试玩验证通过,暂时没有接的必要;`development-plan.md` 里本来就把它标注为"仅当关键词命中率实测不足时才做"。
- 每局 LLM 调用预算(默认 15 次)只在内存里,不写进 localStorage 存档——刷新页面会让预算重新计满,不是精确的"整局最多 N 次"。个人练习项目场景下影响可以忽略,真要做持久化预算需要把计数也序列化进存档。

## 外部依赖

- LLM Provider:DeepSeek(OpenAI 兼容 API),密钥经 `DEEPSEEK_API_KEY` 环境变量注入(本地放 `.env.local`,勿写入 `.env.example`),不提交到仓库。未配置时全程 mock、零成本;配置后只在"填词区"场景调用,每局上限 15 次,超限或失败静默回落模板。自动化测试全程 mock `fetch`。2026-07-20 已对 `/api/narrate` 做真实冒烟:需在请求体里显式 `thinking: { type: "disabled" }`,否则 V4-flash 默认推理会吃光 `max_tokens`,返回空 content。
- 封面生图:Dofun `gpt-image-2`(见 `docs/art-briefs.md`),产物为本地静态资源。
- 部署:本地运行;线上部署视效果再定。公开部署前须补服务端速率限制(安全审查 HIGH,本地可接受)。

## 备注

- 本仓由 Claude Code / Cursor Agent 驱动开发;PR 合并前做独立审查(见 `AGENT.md`)。
- M0–M5 已完成;M5 安全审查无 CRITICAL,HIGH(服务端限流)记为公开部署前置条件。
- 本地试玩:`npm run dev -- --hostname 127.0.0.1 --port 3219` → http://127.0.0.1:3219/
