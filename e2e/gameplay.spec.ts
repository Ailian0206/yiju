import { test, expect, type Page } from "@playwright/test";

async function submitAction(page: Page, text: string): Promise<void> {
  const input = page.getByRole("textbox", { name: "输入你想做的事" });
  // 等上一拍叙述结束(含可能的 LLM),避免填入 disabled 输入框
  await expect(input).toBeEnabled({ timeout: 30_000 });
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

async function gotoLostCat(page: Page): Promise<void> {
  await page.goto("/play/lost-cat");
  await expect(page.getByRole("heading", { name: "找回走丢的猫" })).toBeVisible();
}

test.describe("找猫 — 通关流程", () => {
  test("按最优路径操作能触发通关结局,显示回顾并可再来一局", async ({ page }) => {
    await gotoLostCat(page);

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
    await gotoLostCat(page);

    // 与 content.test 一致:纯呼喊约 9 次即天黑失败;多打会撞上终局后的 disabled 输入框
    for (let i = 0; i < 9; i += 1) {
      await submitAction(page, "喊年糕");
    }

    const ending = page.getByRole("dialog", { name: "天黑了" });
    await expect(ending).toBeVisible();
    await expect(ending.getByText("你在家门口放了猫粮")).toBeVisible();
  });
});

test.describe("找猫 — 新手引导", () => {
  test("开局给出问门卫的建议按钮,点击后能像手打一样正常推进", async ({ page }) => {
    await gotoLostCat(page);

    await expect(page.getByText("你想起门卫老周一直在楼下")).toBeVisible();
    const suggestion = page.getByRole("button", { name: "问问门卫" });
    await expect(suggestion).toBeVisible();

    await suggestion.click();

    await expect(page.getByText("门卫老周想了想").or(page.getByText("老周搓着手"))).toBeVisible();
    // 成功推进后收起芯片,避免一路点提示通关
    await expect(page.getByRole("button", { name: "问问门卫" })).not.toBeVisible();
    await expect(page.getByRole("button", { name: "去绿化带" })).not.toBeVisible();

    // 卡住(无法解析)时再给出上下文下一步;unknown 可能走 LLM,先等输入恢复
    await submitAction(page, "今天天气不错");
    await expect(page.getByRole("textbox", { name: "输入你想做的事" })).toBeEnabled({
      timeout: 30_000,
    });
    await expect(page.getByRole("button", { name: "去绿化带" })).toBeVisible();
  });
});

test.describe("找猫 — 存档", () => {
  test("刷新页面后能恢复上一次的进度", async ({ page }) => {
    await gotoLostCat(page);
    await submitAction(page, "问问门卫");
    await expect(page.getByText("门卫老周想了想").or(page.getByText("老周搓着手"))).toBeVisible();

    await page.reload();

    await expect(page.getByText("门卫老周想了想").or(page.getByText("老周搓着手"))).toBeVisible();
    await expect(page.getByText("线索")).toBeVisible();
  });
});
