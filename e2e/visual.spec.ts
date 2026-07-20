import { test, expect } from "@playwright/test";

const BREAKPOINTS = [
  { name: "mobile-320", width: 320, height: 568 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

test.describe("找猫 — 响应式视觉验证", () => {
  for (const { name, width, height } of BREAKPOINTS) {
    test(`${name}:无横向溢出,关键元素可见`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto("/");

      await expect(page.getByRole("heading", { name: "一局 · 找回走丢的猫" })).toBeVisible();
      await expect(page.getByRole("textbox", { name: "输入你想做的事" })).toBeVisible();
      await expect(page.getByText("再来一局")).toBeVisible();

      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

      await page.screenshot({ path: `test-results/screenshots/${name}.png` });
    });
  }

  for (const { name, width, height } of BREAKPOINTS) {
    test(`${name}:叙事日志变长后,整页不会被撑高——只有日志内部滚动`, async ({ page }) => {
      // 回归用例:.screen 曾经用 min-height 而不是 height,导致日志变长时
      // 整个页面跟着变高、状态面板被顶出视口,320/768 的"状态栏折叠到
      // 顶部"设计因此形同虚设。上面几条只测空状态,测不出这个问题。
      await page.setViewportSize({ width, height });
      await page.goto("/");

      const input = page.getByRole("textbox", { name: "输入你想做的事" });
      for (const text of ["喊年糕", "喊年糕", "喊年糕", "喊年糕", "喊年糕"]) {
        await input.fill(text);
        await input.press("Enter");
      }

      const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
      expect(documentHeight).toBeLessThanOrEqual(height);
      await expect(page.getByText("再来一局").first()).toBeInViewport();
    });
  }
});
