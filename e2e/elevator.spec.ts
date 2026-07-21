import { test, expect, type Page } from "@playwright/test";

async function submitAction(page: Page, text: string): Promise<void> {
  const input = page.getByRole("textbox", { name: "输入你想做的事" });
  await expect(input).toBeEnabled({ timeout: 30_000 });
  await input.fill(text);
  await input.press("Enter");
}

const WIN_SEQUENCE = [
  "安抚老太太",
  "按报警铃",
  "问问白领",
  "检查面板",
  "用对讲机",
  "走出电梯",
];

test.describe("电梯 — 通关流程", () => {
  test("最短路径能安全出梯", async ({ page }) => {
    await page.goto("/play/elevator");
    await expect(page.getByRole("heading", { name: "电梯故障 60 分钟" })).toBeVisible();
    await expect(page.getByRole("button", { name: "安抚老太太" })).toBeVisible();

    for (const text of WIN_SEQUENCE) {
      await submitAction(page, text);
    }

    const ending = page.getByRole("dialog", { name: "安全出梯" });
    await expect(ending).toBeVisible();
    await expect(ending.getByText("门缝透进楼道的光")).toBeVisible();
  });
});
