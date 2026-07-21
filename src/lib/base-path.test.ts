import { describe, expect, it, afterEach } from "vitest";
import { publicUrl } from "./base-path";

describe("publicUrl", () => {
  const original = process.env.NEXT_PUBLIC_BASE_PATH;

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
    else process.env.NEXT_PUBLIC_BASE_PATH = original;
  });

  it("无 basePath 时原样返回绝对路径", () => {
    delete process.env.NEXT_PUBLIC_BASE_PATH;
    expect(publicUrl("/modules/lost-cat/cover.webp")).toBe("/modules/lost-cat/cover.webp");
  });

  it("有 basePath 时加前缀", () => {
    process.env.NEXT_PUBLIC_BASE_PATH = "/yiju";
    expect(publicUrl("/modules/lost-cat/cover.webp")).toBe("/yiju/modules/lost-cat/cover.webp");
    expect(publicUrl("modules/x.webp")).toBe("/yiju/modules/x.webp");
  });
});
