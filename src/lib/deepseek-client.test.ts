import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callDeepSeekChat } from "./deepseek-client";

describe("callDeepSeekChat", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("请求成功时返回模型输出的文本,并带上正确的鉴权头和端点", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ choices: [{ message: { content: "  一段叙述文本  " } }] }), {
        status: 200,
      }),
    );

    const text = await callDeepSeekChat("sk-test-key", [{ role: "user", content: "hi" }]);

    expect(text).toBe("一段叙述文本"); // 确认会 trim 首尾空白
    expect(fetch).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer sk-test-key",
          "Content-Type": "application/json",
        }),
      }),
    );
  });

  // V4-flash 默认开 thinking;max_tokens 小时推理会吃光额度,content 变空。
  // 填词旁白不需要推理链,必须显式关掉。
  it("请求体关闭 thinking,避免推理占满 max_tokens 导致 content 为空", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ choices: [{ message: { content: "场景反应" } }] }), {
        status: 200,
      }),
    );

    await callDeepSeekChat("sk-test-key", [{ role: "user", content: "hi" }]);

    const init = vi.mocked(fetch).mock.calls[0]?.[1] as RequestInit;
    const body = JSON.parse(String(init.body)) as {
      thinking?: { type?: string };
      max_tokens?: number;
    };
    expect(body.thinking).toEqual({ type: "disabled" });
    expect(body.max_tokens).toBe(120);
  });

  it("HTTP 状态非 2xx 时抛出异常", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("", { status: 401 }));

    await expect(callDeepSeekChat("bad-key", [{ role: "user", content: "hi" }])).rejects.toThrow();
  });

  it("响应体里没有可用文本时抛出异常,而不是静默返回空字符串", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({ choices: [] }), { status: 200 }));

    await expect(callDeepSeekChat("sk-test-key", [{ role: "user", content: "hi" }])).rejects.toThrow();
  });

  it("网络请求本身失败(fetch reject)时异常会向上传播,不吞掉", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("network down"));

    await expect(callDeepSeekChat("sk-test-key", [{ role: "user", content: "hi" }])).rejects.toThrow(
      "network down",
    );
  });
});
