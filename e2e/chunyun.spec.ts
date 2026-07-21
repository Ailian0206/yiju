import { test, expect, type Page } from "@playwright/test";

async function submitAction(page: Page, text: string): Promise<void> {
  const input = page.getByRole("textbox", { name: "输入你想做的事" });
  await expect(input).toBeEnabled({ timeout: 30_000 });
  await input.fill(text);
  await input.press("Enter");
}

test.describe("春运 — 通关流程", () => {
  test("最短路径能抢到票", async ({ page }) => {
    await page.goto("/play/chunyun");
    await expect(page.getByRole("heading", { name: "春运抢票夜" })).toBeVisible();
    for (const text of ["刷新购票页", "问问家人", "换个车次", "候补抢票", "确认购票"]) {
      await submitAction(page, text);
    }
    const ending = page.getByRole("dialog", { name: "抢到了" });
    await expect(ending).toBeVisible();
    await expect(ending.getByText("支付成功")).toBeVisible();
  });
});
