# 一局(Yiju)

轻量中文网页文字游戏:借鉴 AI Dungeon 的自由输入交互,但每局有限回合、可见状态、明确通关条件。首发模组《找回走丢的猫》——天黑前用自然语言找回走丢的猫「年糕」。

- 产品文档:[`docs/product-plan.md`](docs/product-plan.md)
- 开发计划:[`docs/development-plan.md`](docs/development-plan.md)
- 当前进度:[`PROJECT_STATUS.md`](PROJECT_STATUS.md)

## 本地开发

> 项目骨架搭建中,以下命令在 M0 完成后生效。

```bash
npm install
npm run dev            # http://localhost:3000
npm run test           # Vitest 单元测试
npm run test:e2e       # Playwright E2E(端口 3219)
```

## 设计原则

- **模型写故事,规则改分数**:天色推进、行动扣除、胜负判定全部由规则引擎决定,不交给模型自由发挥。
- **引擎与内容分离**:`engine/` 是纯函数,`content/lost-cat/` 是纯数据;换模组不改引擎。
- **成本有界**:P0 全 mock、零 API 成本;P1 接入真实 LLM 后每局调用有上限,超限静默回落模板。
