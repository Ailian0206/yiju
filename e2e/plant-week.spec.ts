import { test, expect, type Page } from "@playwright/test";

async function submitAction(page: Page, text: string): Promise<void> {
  const input = page.getByRole("textbox", { name: "输入你想做的事" });
  await expect(input).toBeEnabled({ timeout: 30_000 });
  await input.fill(text);
  await input.press("Enter");
}

test.describe("植物 — 通关流程", () => {
  test("最短路径能交还健康绿植", async ({ page }) => {
    await page.goto("/play/plant-week");
    await expect(page.getByRole("heading", { name: "照顾植物一周" })).toBeVisible();
    for (const text of [
      "浇水",
      "去阳台",
      "晒太阳",
      "施肥",
      "回客厅",
      "浇水",
      "观察植物",
      "交还给朋友",
    ]) {
      await submitAction(page, text);
    }
    const ending = page.getByRole("dialog", { name: "交还成功" });
    await expect(ending).toBeVisible();
    await expect(ending.getByText("朋友推门进来")).toBeVisible();
  });
});
