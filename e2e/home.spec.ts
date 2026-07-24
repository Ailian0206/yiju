import { test, expect } from "@playwright/test";

async function openModuleFromHome(page: import("@playwright/test").Page, href: string) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  const link = page.locator(`a[href="${href}"]`);
  await link.scrollIntoViewIfNeeded();
  await Promise.all([
    page.waitForURL(new RegExp(href.replace(/\//g, "\\/") + "/?$")),
    link.click(),
  ]);
}

test.describe("主页选关", () => {
  test("展示品牌与五张模组卡,找猫可开玩", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());

    await expect(page.getByRole("heading", { name: "一局", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "挑战局" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "故事局" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "密码破译" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "找回走丢的猫" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "电梯故障 60 分钟" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "照顾植物一周" })).toBeVisible();
    await expect(page.getByText("即将开发")).toHaveCount(0);

    await openModuleFromHome(page, "/modules/lost-cat");
    await expect(page.getByText("故事背景")).toBeVisible();
    await expect(page.getByText("玩法介绍")).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/play\/lost-cat/),
      page.getByRole("link", { name: "开始这一局" }).click(),
    ]);
    await expect(page.getByRole("textbox", { name: "输入你想做的事" })).toBeVisible();
  });

  test("电梯可从介绍页开玩", async ({ page }) => {
    await openModuleFromHome(page, "/modules/elevator");
    await expect(page.getByText("故事背景")).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/play\/elevator/),
      page.getByRole("link", { name: "开始这一局" }).click(),
    ]);
    await expect(page.getByRole("heading", { name: "电梯故障 60 分钟" })).toBeVisible();
  });

  test("植物可从介绍页开玩", async ({ page }) => {
    await openModuleFromHome(page, "/modules/plant-week");
    await expect(page.getByText("故事背景")).toBeVisible();
    await Promise.all([
      page.waitForURL(/\/play\/plant-week/),
      page.getByRole("link", { name: "开始这一局" }).click(),
    ]);
    await expect(page.getByRole("heading", { name: "照顾植物一周" })).toBeVisible();
  });
});
