import { test, expect, type Page } from "@playwright/test";

async function submitAction(page: Page, text: string): Promise<void> {
  const input = page.getByRole("textbox", { name: "输入你想做的事" });
  await expect(input).toBeEnabled({ timeout: 30_000 });
  await input.fill(text);
  await input.press("Enter");
}

const WIN_SEQUENCE = [
  "跟对方打招呼",
  "敬酒",
  "聊聊工作话题",
  "请介绍人少催",
  "体面收场",
];

test.describe("相亲 — 通关流程", () => {
  test("最短路径能体面收场", async ({ page }) => {
    await page.goto("/play/blind-date");
    await expect(page.getByRole("heading", { name: "相亲局翻车" })).toBeVisible();

    for (const text of WIN_SEQUENCE) {
      await submitAction(page, text);
    }

    const ending = page.getByRole("dialog", { name: "体面收场" });
    await expect(ending).toBeVisible();
    await expect(ending.getByText("交换了联系方式")).toBeVisible();
  });
});
