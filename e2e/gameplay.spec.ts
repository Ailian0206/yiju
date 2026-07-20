import { test, expect, type Page } from "@playwright/test";

async function submitAction(page: Page, text: string): Promise<void> {
  const input = page.getByRole("textbox", { name: "输入你想做的事" });
  await input.fill(text);
  await input.press("Enter");
}

const WIN_SEQUENCE = [
  "问问门卫",
  "去绿化带",
  "仔细找找",
  "问问陈阿姨",
  "去物业",
  "找找看",
  "去车库",
  "仔细找找",
  "去快递柜",
  "打开纸箱",
  "带年糕回家",
];

test.describe("找猫 — 通关流程", () => {
  test("按最优路径操作能触发通关结局,显示回顾并可再来一局", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "一局 · 找回走丢的猫" })).toBeVisible();

    for (const text of WIN_SEQUENCE) {
      await submitAction(page, text);
    }

    const ending = page.getByRole("dialog", { name: "重逢" });
    await expect(ending).toBeVisible();
    await expect(ending.getByText("你抱起年糕往家走")).toBeVisible();

    await ending.getByRole("button", { name: "再来一局" }).click();
    await expect(ending).not.toBeVisible();
    await expect(page.getByRole("textbox", { name: "输入你想做的事" })).toBeEnabled();
  });
});

test.describe("找猫 — 失败流程", () => {
  test("反复无效行动到天黑,触发失败结局与温和收尾文案", async ({ page }) => {
    await page.goto("/");

    for (let i = 0; i < 9; i += 1) {
      await submitAction(page, "喊年糕");
    }

    const ending = page.getByRole("dialog", { name: "天黑了" });
    await expect(ending).toBeVisible();
    await expect(ending.getByText("天黑了,你在家门口放了猫粮和年糕的毯子")).toBeVisible();
    await expect(page.getByRole("textbox", { name: "输入你想做的事" })).toBeDisabled();
  });
});

test.describe("找猫 — 存档", () => {
  test("刷新页面后能恢复上一次的进度", async ({ page }) => {
    await page.goto("/");
    await submitAction(page, "问问门卫");
    await expect(page.getByText("门卫老周想了想").or(page.getByText("老周搓着手"))).toBeVisible();

    await page.reload();

    await expect(page.getByText("门卫老周想了想").or(page.getByText("老周搓着手"))).toBeVisible();
    await expect(page.getByText("线索")).toBeVisible();
  });
});
