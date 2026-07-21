import { describe, expect, it } from "vitest";
import { resolveSceneImage } from "./scene-art";

describe("resolveSceneImage", () => {
  const art = {
    opening: "/o.webp",
    byEventId: { "ask-guard": "/g.webp", finish: "/f.webp" },
    byLocationId: { greenbelt: "/gb.webp" },
  };

  it("triggered 事件命中 byEventId", () => {
    expect(resolveSceneImage(art, { kind: "triggered", eventId: "ask-guard" })).toBe("/g.webp");
  });

  it("moved 命中 byLocationId", () => {
    expect(resolveSceneImage(art, { kind: "moved", locationId: "greenbelt" })).toBe("/gb.webp");
  });

  it("无配置返回 undefined", () => {
    expect(resolveSceneImage(undefined, { kind: "triggered", eventId: "ask-guard" })).toBeUndefined();
    expect(resolveSceneImage(art, { kind: "noop" })).toBeUndefined();
  });
});
