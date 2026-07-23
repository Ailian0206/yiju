import { test, expect } from "@playwright/test";

test.describe("挑战局 · 密码破译", () => {
  test("主页→介绍→游玩→提交一条反馈", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "挑战局" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "故事局" })).toBeVisible();
    await page.getByRole("link", { name: /密码破译/ }).click();
    await expect(page).toHaveURL(/\/challenges\/mastermind\/?$/);
    await expect(page.getByRole("heading", { name: "密码破译" })).toBeVisible();
    await expect(page.getByText("设定")).toBeVisible();
    await expect(page.getByRole("heading", { name: "玩法" })).toBeVisible();

    await page.getByRole("link", { name: "开始破译" }).click();
    await expect(page).toHaveURL(/\/challenges\/mastermind\/play/);
    await page.getByRole("button", { name: /开始破译/ }).click();

    for (const name of ["朱红", "琥珀", "麦金", "翠青"]) {
      await page.getByRole("button", { name }).click();
    }
    await page.getByRole("button", { name: "提交本行" }).click();

    // 空行也渲染「0位准」,只看第一条已提交历史
    const firstGuess = page
      .getByRole("list", { name: "破译棋盘" })
      .locator("li")
      .first();
    await expect(firstGuess).toContainText("位准");
    await expect(firstGuess).toContainText("色准");
  });
});
