# PROJECT_STATUS:Yiju(一局)

更新时间:2026-07-20
当前阶段:**找猫模组 P0 完成,等待用户试玩确认后再启动 P1**
决策文档:[`docs/product-plan.md`](docs/product-plan.md) · [`docs/development-plan.md`](docs/development-plan.md)

## 里程碑(找猫模组 P0)

| 里程碑 | 内容 | 状态 | PR |
| --- | --- | --- | --- |
| M0 | 项目骨架(Next.js + TS + Vitest + Playwright + CI 脚本) | 已完成 | [#1](https://github.com/Ailian0206/yiju/pull/1) |
| M1 | 引擎核心(状态机、意图解析、防刷规则,TDD) | 已完成 | [#2](https://github.com/Ailian0206/yiju/pull/2) |
| M2 | 找猫模组内容(事件卡、模板、通关/失败序列测试) | 已完成 | [#3](https://github.com/Ailian0206/yiju/pull/3) |
| M3 | 界面(叙事区、状态面板、输入区、结局页) | 已完成 | [#4](https://github.com/Ailian0206/yiju/pull/4) |
| M4 | P0 收尾自测、README、状态归档 | 已完成 | [#5](https://github.com/Ailian0206/yiju/pull/5) |
| M5(P1) | 接入真实 LLM(DeepSeek),待用户确认密钥后启动 | 未启动 | — |

## P0 自测(对照产品文档 §9 成功标准)

| # | 标准 | 结果 | 依据 |
| --- | --- | --- | --- |
| 1 | 不看说明也能明白「要找猫、要赶在天黑前」 | 通过 | 标题「一局 · 找回走丢的猫」+ 副标题「天黑前找到年糕」+ 空日志占位文案直接点出目标,无需额外说明 |
| 2 | 用自然语言玩,不需要背指令(含模糊指代) | 通过 | `intent.test.ts` 40+ 条口语用例(含「问问那个穿红衣服的阿姨」等模糊指代);浏览器实测全程用日常表达完整通关 |
| 3 | 能稳定打出一次通关、一次失败 | 通过 | `e2e/gameplay.spec.ts` 自动化覆盖两条路径;并用 Playwright MCP 手动过了一遍通关(重逢)和失败(天黑了)两个结局页,文案与产品文档一致 |
| 4 | 体感是「在玩游戏」,不是「在跟 ChatGPT 闲聊」 | 通过 | 有明确数值状态(天色/线索/亲近感/剩余行动)、有限行动预算、天色背景随进度真实变暗、明确的通关/失败判定——不是无限续聊 |
| 5 | 一局不超过 40 分钟 | 合理推定 | 最优路径 8 次交互动作(+4 次免费移动)即可通关,12 次行动预算留出容错;真人打字节奏下远低于 40 分钟。此项依赖真人计时,自动化测试无法直接验证 |

标准 1–4 已验证通过,标准 5 是基于设计参数的合理推定——**建议用户自己实际玩一局计时确认**,这也是产品文档要求的下一步("邀请 1–2 人试玩收集反馈")。

## 已知的 P0 范围内取舍(非 bug,记录以防误判)

- `call`(呼叫)意图目前没有任何事件卡,始终落到通用兜底文案,不会像产品文档 §6 描述的那样"概率性提升亲近感"——P0 引擎是确定性纯函数,概率效果留到 P1 或后续再做,详见 `content/lost-cat/events.ts` 头部注释。
- 字体用系统中文字体栈(PingFang SC / Songti SC / Microsoft YaHei),没有用 `next/font/google` 拉 Noto Serif/Sans SC——本地网络环境下拉不动完整字重文件,详见 `feat/m3-ui` PR 说明。

## 外部依赖

- LLM Provider:P0 不需要;P1 计划用 DeepSeek(OpenAI 兼容 API),密钥由用户提供,启动前需明确授权。
- 部署:P0 本地运行;P1 视效果再定。

## 备注

- 本仓由 Claude Code 独立驱动开发,无 Codex 协作;PR 合并前用同进程 `code-reviewer` 子代理做独立审查(见 `AGENT.md`)。
- M0–M4 由 Claude Code 自主推进,已完成;每个里程碑均经过 `code-reviewer` 独立审查并修复其发现的问题后再合并。
