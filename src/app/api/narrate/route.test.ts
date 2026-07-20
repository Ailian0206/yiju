import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const callDeepSeekChatMock = vi.fn();
vi.mock("@/lib/deepseek-client", () => ({
  callDeepSeekChat: (...args: unknown[]) => callDeepSeekChatMock(...args),
}));

// route.ts 在模块顶层读取 process.env.DEEPSEEK_API_KEY 是在每次请求时读取
// (在 POST 函数体内),不是 import 时读取,所以可以在每个用例里按需改 env。
const { POST } = await import("./route");

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/narrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  outcome: { kind: "unknown" },
  state: { currentLocationId: "unit-entrance", sky: "傍晚", clues: 0, closeness: "远" },
  rawText: "这是一句系统听不懂的话",
};

describe("POST /api/narrate", () => {
  beforeEach(() => {
    callDeepSeekChatMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("没有配置 DEEPSEEK_API_KEY 时返回 503,不会去调用 DeepSeek", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "");

    const response = await POST(makeRequest(validBody));

    expect(response.status).toBe(503);
    expect(callDeepSeekChatMock).not.toHaveBeenCalled();
  });

  it("请求体缺少必填字段时返回 400", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");

    const response = await POST(makeRequest({ outcome: { kind: "unknown" } }));

    expect(response.status).toBe(400);
    expect(callDeepSeekChatMock).not.toHaveBeenCalled();
  });

  it("请求体不是合法 JSON 时返回 400", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");
    const badRequest = new Request("http://localhost/api/narrate", {
      method: "POST",
      body: "not json",
    });

    const response = await POST(badRequest);

    expect(response.status).toBe(400);
  });

  it("配置齐全且请求合法时,调用 DeepSeek 并把生成文本原样返回", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");
    callDeepSeekChatMock.mockResolvedValueOnce("这是一句生成的叙述。");

    const response = await POST(makeRequest(validBody));
    const data = (await response.json()) as { text?: string };

    expect(response.status).toBe(200);
    expect(data.text).toBe("这是一句生成的叙述。");
    expect(callDeepSeekChatMock).toHaveBeenCalledWith(
      "sk-test",
      expect.arrayContaining([
        expect.objectContaining({ role: "system" }),
        expect.objectContaining({ role: "user", content: expect.stringContaining("这是一句系统听不懂的话") }),
      ]),
    );
  });

  it("DeepSeek 调用失败时返回 502 并带上错误信息,不抛未捕获异常", async () => {
    vi.stubEnv("DEEPSEEK_API_KEY", "sk-test");
    callDeepSeekChatMock.mockRejectedValueOnce(new Error("DeepSeek API 请求失败:500"));

    const response = await POST(makeRequest(validBody));
    const data = (await response.json()) as { error?: string };

    expect(response.status).toBe(502);
    expect(data.error).toContain("DeepSeek API 请求失败");
  });
});
