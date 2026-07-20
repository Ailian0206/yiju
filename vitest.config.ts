import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

// engine/ 是无 DOM 依赖的纯函数模块,组件测试才需要 jsdom;
// 统一用 jsdom 环境简化配置,纯函数测试不受影响。
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["node_modules", ".next", "e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: ["src/engine/**", "src/content/**"],
      // 引擎/内容模块的覆盖率门禁,对应 AGENT.md 验证门禁"引擎模块覆盖率 ≥90%"。
      // M0 阶段 types.ts 是纯类型(编译期擦除),thresholds 暂不生效;
      // M1 开始有真实逻辑后这道门禁才会实际拦截覆盖率下滑。
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
