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
    },
  },
});
