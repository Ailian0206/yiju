<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Guidelines

本项目的完整 Agent 工作约定见 [`AGENT.md`](AGENT.md)。以下是要点(与 `AGENT.md` 冲突时以 `AGENT.md` 为准):

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
11. Milestone PRs must run independent Claude Code review once after creation: `claude --permission-mode auto --model sonnet -p "/codex-independent-pr-review <PR>"`. Do not substitute same-process code-reviewer. Do not re-invoke Claude after the first successful review.
12. Never commit secrets, personal access tokens, `.env` files, or paid-provider responses.
