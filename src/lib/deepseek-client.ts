// 通用 DeepSeek(OpenAI 兼容)聊天补全客户端,不含任何游戏内容知识——
// prompt 由调用方(如 API route)构造。只应在服务端调用:密钥不能进
// 客户端 bundle。
const DEEPSEEK_ENDPOINT = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = "deepseek-v4-flash";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface DeepSeekChatOptions {
  maxTokens?: number;
  temperature?: number;
}

interface DeepSeekChatResponse {
  choices?: Array<{ message?: { content?: string } }>;
}

export async function callDeepSeekChat(
  apiKey: string,
  messages: ChatMessage[],
  options: DeepSeekChatOptions = {},
): Promise<string> {
  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages,
      max_tokens: options.maxTokens ?? 120,
      temperature: options.temperature ?? 0.9,
      // V4 默认开 thinking;短旁白不需要推理链,否则 max_tokens 易被
      // reasoning 吃光,content 变空 → /api/narrate 误报 502。
      thinking: { type: "disabled" },
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API 请求失败:${response.status}`);
  }

  const data = (await response.json()) as DeepSeekChatResponse;
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error("DeepSeek API 返回内容为空");
  }

  return text;
}
