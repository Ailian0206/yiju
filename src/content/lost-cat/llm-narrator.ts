// 调用 /api/narrate;必须带 moduleId,服务端按模组选 prompt。
// GitHub Pages 静态站无此路由,请求失败后混合 narrator 回落模板。
import type { GameState, Narrator } from "@/engine/types";
import { publicUrl } from "@/lib/base-path";

function pickStateFields(state: GameState) {
  return {
    currentLocationId: state.currentLocationId,
    sky: state.sky,
    clues: state.clues,
    closeness: state.closeness,
  };
}

export function createLLMNarrator(moduleId: string): Narrator {
  return {
    async narrate(outcome, state, rawText) {
      const response = await fetch(publicUrl("/api/narrate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moduleId,
          outcome,
          state: pickStateFields(state),
          rawText,
        }),
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
