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

## 开发流程

实现可由 Cursor / Claude Code 主进程完成;合并前的**独立审核**对齐姊妹项目(`ai-photo-studio-cn` / `evidence-graph`):用独立 Claude Code 进程跑 `/codex-independent-pr-review`,**禁止**用同进程 `code-reviewer` 子代理代替。

1. 开始前检查 `git status -sb` 和 `PROJECT_STATUS.md` 当前里程碑。
2. 每个里程碑开独立分支(`feat/m0-scaffold`、`feat/m8-elevator` …),不直接在 `main` 上开发里程碑能力。
3. 行为改动先写失败测试(RED),再写最小实现让测试通过(GREEN),再重构。
4. 每次提交前跑聚焦测试;里程碑完成前跑完整门禁(见下)。
5. 中文 Conventional Commits,一次提交一个逻辑改动。
6. 里程碑门禁全绿后按固定顺序发布到 GitHub:
   1. 推送功能分支。
   2. 创建里程碑 PR(标题写明里程碑;描述含变更摘要、验证命令、风险)。
   3. **立即**由主进程主动跑一次独立审核(每个 PR 只成功调用一次):
      ```bash
      claude --permission-mode auto --model sonnet -p "/codex-independent-pr-review <PR编号>"
      ```
      Claude 只在当前 PR 发评论,不改代码、不提交、不推送、不合并、不新增审核 Action。
   4. 主进程读取完整评论并技术核验;成立的 Blocking finding 按 TDD 在**原 PR 分支**最小修复;Non-blocking 由主进程判断是否同批处理,不盲目迎合审查结论。
   5. 修复后跑聚焦测试与完整门禁,直接 commit + push 到原 PR;**不**开 follow-up PR,**不**再次调用 Claude 审核。
   6. 首次 Claude 评论已处理、本地门禁通过、且修复后 GitHub Actions(若有)通过后,用 **merge commit** 合并:`gh pr merge <PR编号> --merge --delete-branch`(禁止 squash / rebase / force push)。
7. 不开多个并行里程碑 PR;当前 PR 闭环(合并完成、`PROJECT_STATUS.md` 更新)前不开始下一个里程碑分支。
8. `PROJECT_STATUS.md` 在每个里程碑合并后必须更新。

### 审核边界

- Claude 首次命令失败或没有发布评论时**只重试一次**;第二次仍失败则保持 PR 未审核并向用户报告外部阻塞。
- 审核成功后不再调用 Claude;修复正确性由主进程复现、测试与 CI 负责。
- Cursor Bugbot / Autofix **不是**本仓合并门禁;其评论仅作普通外部反馈,不能替代上述一次独立审核。
- 小型维护(局部 bugfix、样式/文案、测试修复、少量文档,且不新增独立产品能力、不改引擎契约/安全边界)可直接在 `main` 验证提交推送,不创建 PR、不调用独立审核。
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

## LLM Provider(P1,已接入 DeepSeek)

`engine/intent.ts` 的 `IntentResolver` 仍是纯关键词实现,未接 LLM(命中率暂无问题,不需要)。

`engine/narrator.ts` 的 `Narrator` 接口已支持 P1:`content/lost-cat/llm-narrator.ts` 通过 `app/api/narrate/route.ts`(唯一持有 `DEEPSEEK_API_KEY` 的地方,密钥经环境变量 `DEEPSEEK_API_KEY` 注入,绝不提交到仓库)调用 DeepSeek(OpenAI 兼容 API)。`content/lost-cat/narrator-config.ts` 的 `createLostCatNarrator` 只把"填词区"场景(unknown/noop/无专属文案的 rejected)路由给 LLM,主线内容仍用人工模板,且有每局调用上限(默认 15 次)——超限或调用失败一律静默回落模板,不报错、不阻塞。Prompt(`route.ts` 里的 `SYSTEM_PROMPT`)约束模型"只描述场景反应,不得发明线索/道具/地点,不得暗示状态变化"——状态变更永远由规则引擎决定,模型只负责最后一层文字。

自动化测试(`vitest`)全程 mock `fetch`,不发起真实网络请求;真实调用只在开发环境手动配置 `DEEPSEEK_API_KEY` 后触发,属于付费 Provider 冒烟测试,按"成本与外部写入门禁"需要用户明确授权(已在启动 P1 时获得)。
