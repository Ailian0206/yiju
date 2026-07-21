import { describe, expect, it } from "vitest";
import { getModule, getModuleBundle, listModules, listPlayableModules } from "./registry";

describe("content/registry", () => {
  it("列出全部 5 个模组,且含找猫与电梯", () => {
    const modules = listModules();
    expect(modules).toHaveLength(5);
    expect(modules.map((m) => m.id)).toEqual(
      expect.arrayContaining(["lost-cat", "elevator", "blind-date", "chunyun", "plant-week"]),
    );
  });

  it("每个模组都有故事背景与玩法介绍", () => {
    for (const meta of listModules()) {
      expect(meta.storyBackground.trim().length).toBeGreaterThan(10);
      expect(meta.howToPlay.trim().length).toBeGreaterThan(10);
      expect(meta.coverSrc).toMatch(/^\/modules\//);
    }
  });

  it("四个模组可玩,仅植物为即将开发", () => {
    const playable = listPlayableModules().map((m) => m.id);
    expect(playable).toEqual(["lost-cat", "elevator", "blind-date", "chunyun"]);
    const preview = listModules().filter((m) => m.status === "preview");
    expect(preview.map((m) => m.id)).toEqual(["plant-week"]);
  });

  it("getModule 能取到找猫;未知 id 返回 undefined", () => {
    expect(getModule("lost-cat")?.title).toContain("猫");
    expect(getModule("no-such-module")).toBeUndefined();
  });

  it("可玩模组能拿到 bundle;preview 拿不到", () => {
    expect(getModuleBundle("lost-cat")?.meta.id).toBe("lost-cat");
    expect(getModuleBundle("elevator")?.meta.id).toBe("elevator");
    expect(getModuleBundle("blind-date")?.meta.id).toBe("blind-date");
    expect(getModuleBundle("chunyun")?.meta.id).toBe("chunyun");
    expect(getModuleBundle("plant-week")).toBeUndefined();
  });
});
