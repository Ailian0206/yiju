import { test, expect } from "@playwright/test";

test.describe("挑战局 · 数织", () => {
  test("主页→介绍→游玩盘面可见", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /数织/ }).click();
    await expect(page).toHaveURL(/\/challenges\/nonogram\/?$/);
    await expect(page.getByRole("heading", { name: "数织" })).toBeVisible();
    await page.getByRole("link", { name: "开始数织" }).click();
    await expect(page).toHaveURL(/\/challenges\/nonogram\/play/);
    await expect(page.getByRole("heading", { name: "数织" })).toBeVisible();
    await expect(page.getByText("线索怎么读")).toBeVisible();
    await page.getByRole("button", { name: "1,1" }).click();
  });
});

test.describe("挑战局 · 数独", () => {
  test("主页→介绍→游玩可填一格", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /数独/ }).click();
    await expect(page).toHaveURL(/\/challenges\/sudoku\/?$/);
    await expect(page.getByRole("heading", { name: "数独" })).toBeVisible();
    await page.getByRole("link", { name: "开始数独" }).click();
    await expect(page).toHaveURL(/\/challenges\/sudoku\/play/);
    await expect(page.getByRole("grid", { name: "数独盘面" })).toBeVisible();
    // 点一个空格再填数字
    const empty = page.getByRole("gridcell").filter({ hasText: /^$/ }).first();
    await empty.click();
    await page.getByRole("button", { name: "5", exact: true }).click();
  });
});
