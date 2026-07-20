import { test, expect } from "@playwright/test";

// M0 冒烟测试:证明 Playwright 管线可跑通。真正的通关流/失败流 E2E 在 M3 补齐。
test("占位页可打开并显示产品标题", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "一局 · 找回走丢的猫" })).toBeVisible();
});
