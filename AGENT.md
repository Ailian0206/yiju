# Yiju Agent 工作流

## 产品边界

「一局(Yiju)」是一个轻量中文网页文字游戏平台,借鉴 AI Dungeon 的自由输入交互,但每局有限回合、可见状态、明确通关条件——不是无限世界的纯聊天。首发模组《找回走丢的猫》,验证通过后才按 `docs/product-plan.md` §8.4 候选池启动第二个模组,**不并行开发多个模组**。

作品集中的姊妹项目(**本 agent 不负责改这些仓,除非用户点名**):

- `evidence-graph`
- `mcp-guardian`
- `ai-photo-studio-cn`

MVP 不做:账号 / 支付 / 模组市场、语音、3D、多人对战、无限续写、跨周长线云存档。详见 `docs/product-plan.md` §1.4。

## 工程优先级

1. 引擎(`engine/`)与内容(`content/`)严格分离——引擎不 import 具体模组的名字或数据。
2. 玩法节奏可回归验证(最短通关序列、必失败序列有自动化测试锁定)。
3. 成本有界:P0 全 mock、零 API 调用;P1 接入真模型后每局/每日调用有上限。
4. 移动端与桌面端界面质量一致,不因为是"练习项目"而降低视觉标准。
5. 本地和 CI 验证可复现。

## 开发流程(本仓无 Codex 协作,由 Claude Code 独立驱动)

evidence-graph / mcp-guardian 的双 Agent(Codex 实现 + Claude 独立审核)流程在本仓不适用——这里只有 Claude Code 一个执行者。为保留"合并前必须有一次独立审核"的原则(见全局 `code-review.md`),用**同进程内的 code-reviewer 子代理**代替外部独立审核:

1. 开始前检查 `git status -sb` 和 `PROJECT_STATUS.md` 当前里程碑。
2. 每个里程碑开独立分支(`feat/m0-scaffold`、`feat/m1-engine` …),不直接在 `main` 上开发。
3. 行为改动先写失败测试(RED),再写最小实现让测试通过(GREEN),再重构。
4. 每次提交前跑聚焦测试;里程碑完成前跑完整门禁(见下)。
5. 中文 Conventional Commits,一次提交一个逻辑改动。
6. 里程碑门禁全绿后:推送分支 → 用 `code-reviewer` 子代理审查本次 diff → CRITICAL/HIGH 问题当场按 TDD 修复并重新跑门禁 → 开 PR(标题写明里程碑)→ 门禁 + 审查都过后用 `gh pr merge --merge --delete-branch` 合并。
7. 不开多个并行 PR;当前里程碑闭环(合并完成、`PROJECT_STATUS.md` 更新)前不开始下一个里程碑分支。
8. `PROJECT_STATUS.md` 在每个里程碑合并后必须更新。

## 里程碑与决策文档

- 产品定稿:`docs/product-plan.md`
- 开发计划(M0–M5):`docs/development-plan.md`
- 当前状态:`PROJECT_STATUS.md`

M0–M4(找猫模组 P0)由 Claude Code 自主完成,**不逐里程碑找用户确认**;仅在真正阻塞(如需要用户提供密钥、GitHub 权限失败、产品文档存在矛盾无法自行判断)时停下来说明卡点。P1(接入真实 LLM)开始前需要用户确认 provider 与密钥来源。

## 成本与外部写入门禁

下列操作仍需用户明确授权,不因"充分决定权"而跳过:

- 添加真实 LLM(如 DeepSeek)密钥、执行付费调用冒烟测试。
- 购买或变更域名、开通付费部署资源。
- 修改仓库可见性(public/private)或删除仓库。
- 触碰本仓库之外的其它项目。

用户已授权本项目创建 GitHub 仓库、里程碑分支、推送、PR 创建与合并,不需要逐项确认。

## 验证门禁

```bash
npm run lint
npm run typecheck
npm run test          # Vitest,引擎模块覆盖率 ≥90%,全局 ≥80%
npm run build
npm run test:e2e      # Playwright,端口 3219
```

界面改动需包含 320×568、768×1024、1440×900 三档 Playwright 截图验证,确认无横向溢出、文字裁切、异常重叠。

## LLM Provider(P1 起生效)

`engine/intent.ts` 的 `IntentResolver` 和 `engine/narrator.ts` 的 `Narrator` 均为接口,P0 用 mock 实现。P1 若接入 DeepSeek:走 OpenAI 兼容 API,密钥经环境变量注入,绝不提交到仓库;Prompt 需约束模型"只润色叙述/辅助意图理解,不得发明线索或修改状态"——状态变更永远由规则引擎决定。
