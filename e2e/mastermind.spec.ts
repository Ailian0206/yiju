import { test, expect } from "@playwright/test";

test.describe("挑战局 · 密码破译", () => {
  test("主页→介绍→游玩→提交一条反馈", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "挑战局" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "故事局" })).toBeVisible();
    await page.locator('a[href="/challenges/mastermind"]').click();
    await expect(page).toHaveURL(/\/challenges\/mastermind\/?$/);
    await expect(page.getByRole("heading", { name: "密码破译" })).toBeVisible();
    await expect(page.getByText("设定")).toBeVisible();
    await expect(page.getByText("玩法")).toBeVisible();

    await page.getByRole("link", { name: "开始破译" }).click();
    await expect(page).toHaveURL(/\/challenges\/mastermind\/play/);
    await page.getByRole("button", { name: /开始破译/ }).click();

    // 普通档 4 色互异
    for (const name of ["朱红", "琥珀", "麦金", "翠青"]) {
      await page.getByRole("button", { name }).click();
    }
    await page.getByRole("button", { name: "提交本行" }).click();
    await expect(page.getByText(/位准/)).toBeVisible();
    await expect(page.getByText(/色准/)).toBeVisible();
  });
});
