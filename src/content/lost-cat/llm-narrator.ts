// 调用 /api/narrate,由服务端持有密钥并真正调用 DeepSeek。任何失败都
// 直接 throw——narrator-config.ts 的 createLostCatNarrator 统一接住、
// 静默回落模板,这里不用自己处理降级逻辑。
import type { GameState, Narrator } from "@/engine/types";

function pickStateFields(state: GameState) {
  return {
    currentLocationId: state.currentLocationId,
    sky: state.sky,
    clues: state.clues,
    closeness: state.closeness,
  };
}

export function createLLMNarrator(): Narrator {
  return {
    async narrate(outcome, state, rawText) {
      const response = await fetch("/api/narrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, state: pickStateFields(state), rawText }),
      });

      if (!response.ok) {
        throw new Error(`narrate API 请求失败:${response.status}`);
      }

      const data = (await response.json()) as { text?: string };
      if (!data.text) {
        throw new Error("narrate API 返回内容为空");
      }
      return data.text;
    },
  };
}
