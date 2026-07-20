import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLLMNarrator } from "./llm-narrator";
import { LOCATIONS } from "./module";
import type { GameState } from "@/engine/types";

const baseState: GameState = {
  status: "playing",
  sky: "傍晚",
  clues: 0,
  closeness: "远",
  actionsRemaining: 12,
  actionsTaken: 0,
  currentLocationId: LOCATIONS.UNIT_ENTRANCE,
  flags: {},
  triggeredEventIds: [],
  log: [],
};

describe("createLLMNarrator", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("请求成功时返回 API 给的文本,只带精简过的 state 字段(不泄漏完整存档)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ text: "生成的叙述" }), { status: 200 }));

    const narrator = createLLMNarrator();
    const text = await narrator.narrate({ kind: "unknown" }, baseState, "乱打的话");

    expect(text).toBe("生成的叙述");
    const [, requestInit] = vi.mocked(fetch).mock.calls[0];
    const sentBody = JSON.parse((requestInit as RequestInit).body as string);
    expect(sentBody.state).toEqual({
      currentLocationId: LOCATIONS.UNIT_ENTRANCE,
      sky: "傍晚",
      clues: 0,
      closeness: "远",
    });
    expect(sentBody.state.log).toBeUndefined(); // 不需要把整个日志历史发给服务端
  });

  it("HTTP 状态非 2xx 时抛出异常(交给上层的 createLostCatNarrator 接住)", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 503 }));

    const narrator = createLLMNarrator();
    await expect(narrator.narrate({ kind: "noop" }, baseState, "")).rejects.toThrow();
  });

  it("响应体没有 text 字段时抛出异常", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));

    const narrator = createLLMNarrator();
    await expect(narrator.narrate({ kind: "noop" }, baseState, "")).rejects.toThrow();
  });
});
