# AGENTS.md

本项目的 Agent 工作约定见 [`AGENT.md`](AGENT.md)。

说明:保留 `AGENTS.md` 是为了兼容 Codex / Claude / 其他 agent 对复数文件名的默认识别;实际规范以 `AGENT.md` 为准。

## Project Guidelines

1. Read `AGENT.md`, `PROJECT_STATUS.md`, and `docs/development-plan.md` before changing code.
2. Use test-driven development for behavior changes: verify RED, implement the minimum GREEN, then refactor.
3. Keep all code comments in Chinese (matches product docs). User-facing content is Chinese only for P0.
4. Keep provider calls disabled in routine tests. Real DeepSeek calls require a dedicated confirmation gate and cost cap.
5. Follow the minimum-change principle. Do not refactor unrelated modules.
6. `engine/` must never import React or `content/`-specific data; content modules must never be hardcoded into the engine.
7. Run the smallest relevant test after each change and the full milestone gate before a PR.
8. Update `PROJECT_STATUS.md` when a milestone branch, PR, CI state, or project status changes.
9. Use Chinese Conventional Commits. One logical change per commit.
10. Use milestone branches and PRs. Merge with a merge commit; do not squash, rebase, or force push.
11. Never commit secrets, personal access tokens, `.env` files, or paid-provider responses.
