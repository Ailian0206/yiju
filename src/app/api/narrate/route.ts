// 服务端代理:只有这里能看到 DEEPSEEK_API_KEY。客户端(content/lost-cat/
// llm-narrator.ts)只知道 POST 到这个路由,不知道也不需要知道密钥或
// DeepSeek 的具体接口形状。
import { NextResponse } from "next/server";
import { callDeepSeekChat } from "@/lib/deepseek-client";
import { LOCATION_NAMES } from "@/content/lost-cat/module";
import type { ActionOutcome, Closeness, GameState, SkyPhase } from "@/engine/types";

interface NarrateRequestBody {
  outcome: ActionOutcome;
  state: Pick<GameState, "currentLocationId" | "sky" | "clues" | "closeness">;
  rawText: string;
}

// 只在这三种"填词区"情况下才会被调用(见 content/lost-cat/narrator-config.ts
// 的 isFillerOutcome),所以 prompt 只需要覆盖这三种场景的措辞。
function describeSituation(outcome: ActionOutcome): string {
  switch (outcome.kind) {
    case "unknown":
      return "系统没能理解这句话具体想做什么";
    case "rejected":
      return "玩家想做的事目前条件不满足,做不成";
    default:
      return "玩家想做的事,在这个地点没有对应的具体内容";
  }
}

const SYSTEM_PROMPT = `你是中文文字冒险游戏《一局·找猫》的旁白。玩家在天黑前寻找走丢的猫「年糕」。
玩家刚才的输入没有触发游戏预设的具体剧情。请用 1-2 句温暖、口语化的中文,
针对玩家的原话给一个符合情理的场景反应。

严格规则:
- 不要发明新的线索、道具、地点或角色
- 不要让猫在这里被找到,也不要暗示游戏状态发生了变化
- 不要提到"游戏""AI""系统"这类词,保持第二人称叙事口吻
- 只输出叙述文本本身,不要加引号、前缀或解释`;

function buildUserPrompt(body: NarrateRequestBody): string {
  const locationName = LOCATION_NAMES[body.state.currentLocationId] ?? body.state.currentLocationId;

  return [
    `当前地点:${locationName}`,
    `天色:${body.state.sky}`,
    `已收集线索:${body.state.clues}`,
    `情况:${describeSituation(body.outcome)}`,
    `玩家输入原话:「${body.rawText}」`,
  ].join("\n");
}

function isValidBody(value: unknown): value is NarrateRequestBody {
  if (!value || typeof value !== "object") return false;
  const body = value as Partial<NarrateRequestBody>;
  return (
    typeof body.rawText === "string" &&
    body.rawText.length > 0 &&
    Boolean(body.outcome) &&
    Boolean(body.state) &&
    typeof body.state?.currentLocationId === "string" &&
    isSkyPhase(body.state?.sky) &&
    isCloseness(body.state?.closeness)
  );
}

function isSkyPhase(value: unknown): value is SkyPhase {
  return value === "傍晚" || value === "黄昏" || value === "擦黑" || value === "天黑";
}

function isCloseness(value: unknown): value is Closeness {
  return value === "远" || value === "有动静" || value === "很近" || value === "已找到";
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DEEPSEEK_API_KEY not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid request body" }, { status: 400 });
  }

  if (!isValidBody(body)) {
    return NextResponse.json({ error: "missing or invalid required fields" }, { status: 400 });
  }

  try {
    const text = await callDeepSeekChat(apiKey, [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(body) },
    ]);
    return NextResponse.json({ text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
