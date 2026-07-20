# PROJECT_STATUS:Yiju(一局)

更新时间:2026-07-20
当前阶段:**M2 找猫模组内容开发中**
决策文档:[`docs/product-plan.md`](docs/product-plan.md) · [`docs/development-plan.md`](docs/development-plan.md)

## 里程碑(找猫模组 P0)

| 里程碑 | 内容 | 状态 | PR |
| --- | --- | --- | --- |
| M0 | 项目骨架(Next.js + TS + Vitest + Playwright + CI 脚本) | 已完成 | [#1](https://github.com/Ailian0206/yiju/pull/1) |
| M1 | 引擎核心(状态机、意图解析、防刷规则,TDD) | 已完成 | [#2](https://github.com/Ailian0206/yiju/pull/2) |
| M2 | 找猫模组内容(事件卡、模板、通关/失败序列测试) | 进行中 | — |
| M3 | 界面(叙事区、状态面板、输入区、结局页) | 待开始 | — |
| M4 | P0 收尾自测、README、状态归档 | 待开始 | — |
| M5(P1) | 接入真实 LLM(DeepSeek),待用户确认密钥后启动 | 未启动 | — |

## 外部依赖

- LLM Provider:P0 不需要;P1 计划用 DeepSeek(OpenAI 兼容 API),密钥由用户提供,启动前需明确授权。
- 部署:P0 本地运行;P1 视效果再定。

## 备注

- 本仓由 Claude Code 独立驱动开发,无 Codex 协作;PR 合并前用同进程 `code-reviewer` 子代理做独立审查(见 `AGENT.md`)。
- M0–M4 由 Claude Code 自主推进,仅在真正阻塞时向用户报告。
