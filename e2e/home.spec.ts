import { test, expect } from "@playwright/test";

test.describe("主页选关", () => {
  test("展示品牌与五张模组卡,找猫可开玩", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "一局", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "找回走丢的猫" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "电梯故障 60 分钟" })).toBeVisible();
    await expect(page.getByText("即将开发").first()).toBeVisible();

    await page.locator('a[href="/modules/lost-cat"]').click();
    await expect(page).toHaveURL(/\/modules\/lost-cat/);
    await expect(page.getByText("故事背景")).toBeVisible();
    await expect(page.getByText("玩法介绍")).toBeVisible();
    await page.getByRole("link", { name: "开始这一局" }).click();
    await expect(page).toHaveURL(/\/play\/lost-cat/);
    await expect(page.getByRole("textbox", { name: "输入你想做的事" })).toBeVisible();
  });

  test("电梯可从介绍页开玩", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/modules/elevator"]').click();
    await expect(page).toHaveURL(/\/modules\/elevator/);
    await expect(page.getByText("故事背景")).toBeVisible();
    await page.getByRole("link", { name: "开始这一局" }).click();
    await expect(page).toHaveURL(/\/play\/elevator/);
    await expect(page.getByRole("heading", { name: "电梯故障 60 分钟" })).toBeVisible();
  });

  test("即将开发模组进入简介页,不能开玩", async ({ page }) => {
    await page.goto("/");
    await page.locator('a[href="/modules/blind-date"]').click();
    await expect(page).toHaveURL(/\/modules\/blind-date/);
    await expect(page.getByText("即将开发")).toBeVisible();
    await expect(page.getByText("故事背景")).toBeVisible();
    await expect(page.getByText("玩法介绍")).toBeVisible();
    await expect(page.getByRole("link", { name: "开始这一局" })).toHaveCount(0);
  });
});
