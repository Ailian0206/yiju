// 服务端代理:只有这里能看到 DEEPSEEK_API_KEY。客户端只知道 POST 到本路由。
import { NextResponse } from "next/server";
import { callDeepSeekChat } from "@/lib/deepseek-client";
import { getNarrateModulePrompt } from "@/content/shared/narrate-prompts";
import type { ActionOutcome, Closeness, GameState, SkyPhase } from "@/engine/types";

interface NarrateRequestBody {
  moduleId: string;
  outcome: ActionOutcome;
  state: Pick<GameState, "currentLocationId" | "sky" | "clues" | "closeness">;
  rawText: string;
}

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

function buildUserPrompt(body: NarrateRequestBody, locationNames: Record<string, string>): string {
  const locationName = locationNames[body.state.currentLocationId] ?? body.state.currentLocationId;

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
    typeof body.moduleId === "string" &&
    body.moduleId.length > 0 &&
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

  const prompt = getNarrateModulePrompt(body.moduleId);
  if (!prompt) {
    return NextResponse.json({ error: `unknown moduleId:${body.moduleId}` }, { status: 400 });
  }

  try {
    const text = await callDeepSeekChat(apiKey, [
      { role: "system", content: prompt.systemPrompt },
      { role: "user", content: buildUserPrompt(body, prompt.locationNames) },
    ]);
    return NextResponse.json({ text });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
