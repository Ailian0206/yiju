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
});
