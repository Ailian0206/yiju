import { describe, expect, it } from "vitest";
import { getModule, getModuleBundle, listModules, listPlayableModules } from "./registry";

describe("content/registry", () => {
  it("列出全部 5 个模组,且含找猫", () => {
    const modules = listModules();
    expect(modules).toHaveLength(5);
    expect(modules.map((m) => m.id)).toContain("lost-cat");
  });

  it("每个模组都有故事背景与玩法介绍", () => {
    for (const meta of listModules()) {
      expect(meta.storyBackground.trim().length).toBeGreaterThan(10);
      expect(meta.howToPlay.trim().length).toBeGreaterThan(10);
      expect(meta.coverSrc).toMatch(/^\/modules\//);
    }
  });

  it("目前只有找猫可玩,其余为即将开发(preview)", () => {
    const playable = listPlayableModules();
    expect(playable.map((m) => m.id)).toEqual(["lost-cat"]);
    const preview = listModules().filter((m) => m.status === "preview");
    expect(preview).toHaveLength(4);
  });

  it("getModule 能取到找猫;未知 id 返回 undefined", () => {
    expect(getModule("lost-cat")?.title).toContain("猫");
    expect(getModule("no-such-module")).toBeUndefined();
  });

  it("只有可玩模组能拿到 bundle;preview 拿不到", () => {
    expect(getModuleBundle("lost-cat")?.meta.id).toBe("lost-cat");
    expect(getModuleBundle("elevator")).toBeUndefined();
  });
});
