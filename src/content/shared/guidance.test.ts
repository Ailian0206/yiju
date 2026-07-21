import { describe, expect, it } from "vitest";
import type { GameState } from "@/engine/types";
import { createInitialState as createElevator } from "@/content/elevator/module";
import { getSuggestedActions as elevatorHints } from "@/content/elevator/suggestions";
import { elevatorSceneArt } from "@/content/elevator/scene-art";
import { createInitialState as createBlindDate } from "@/content/blind-date/module";
import { getSuggestedActions as blindDateHints } from "@/content/blind-date/suggestions";
import { blindDateSceneArt } from "@/content/blind-date/scene-art";
import { createInitialState as createChunyun } from "@/content/chunyun/module";
import { getSuggestedActions as chunyunHints } from "@/content/chunyun/suggestions";
import { chunyunSceneArt } from "@/content/chunyun/scene-art";
import { createInitialState as createPlantWeek } from "@/content/plant-week/module";
import { getSuggestedActions as plantWeekHints } from "@/content/plant-week/suggestions";
import { plantWeekSceneArt } from "@/content/plant-week/scene-art";
import { lostCatSceneArt } from "@/content/lost-cat/scene-art";

function withEvents(base: GameState, eventIds: string[], extra: Partial<GameState> = {}): GameState {
  return { ...base, triggeredEventIds: eventIds, ...extra };
}

describe("各模组全程下一步引导", () => {
  it("电梯：按关键节点推进建议", () => {
    const s0 = createElevator();
    expect(elevatorHints(s0)).toEqual(["安抚老太太"]);
    expect(elevatorHints(withEvents(s0, ["calm-grandma"]))).toEqual(["按报警铃"]);
    expect(
      elevatorHints(withEvents(s0, ["calm-grandma"], { flags: { alarm_on: true } })),
    ).toEqual(["问问白领"]);
    expect(
      elevatorHints(
        withEvents(s0, ["calm-grandma", "ask-office"], { flags: { alarm_on: true } }),
      ),
    ).toEqual(["检查面板"]);
    expect(
      elevatorHints(
        withEvents(s0, ["calm-grandma", "ask-office"], {
          flags: { alarm_on: true, panel_checked: true },
        }),
      ),
    ).toEqual(["用对讲机"]);
    expect(
      elevatorHints(
        withEvents(s0, ["calm-grandma", "ask-office"], {
          flags: { alarm_on: true, panel_checked: true, rescue_coming: true },
        }),
      ),
    ).toEqual(["走出电梯"]);
    expect(elevatorHints(withEvents(s0, [], { closeness: "已找到" }))).toEqual(["走出电梯"]);
    expect(elevatorHints(withEvents(s0, [], { status: "won" }))).toEqual([]);
  });

  it("相亲：按关键节点推进建议", () => {
    const s0 = createBlindDate();
    expect(blindDateHints(s0)).toEqual(["跟对方打招呼"]);
    expect(blindDateHints(withEvents(s0, ["greet-partner"]))).toEqual(["敬一杯"]);
    expect(blindDateHints(withEvents(s0, ["greet-partner", "toast-wine"]))).toEqual(["聊聊工作"]);
    expect(
      blindDateHints(withEvents(s0, ["greet-partner", "toast-wine", "chat-topic"])),
    ).toEqual(["安抚介绍人"]);
    expect(
      blindDateHints(
        withEvents(s0, ["greet-partner", "toast-wine", "chat-topic", "calm-matchmaker"]),
      ),
    ).toEqual(["体面收场"]);
    expect(blindDateHints(withEvents(s0, [], { closeness: "已找到" }))).toEqual(["体面收场"]);
  });

  it("春运：按关键节点推进建议", () => {
    const s0 = createChunyun();
    expect(chunyunHints(s0)).toEqual(["刷新购票页"]);
    expect(chunyunHints(withEvents(s0, ["refresh-page"]))).toEqual(["问问家人"]);
    expect(chunyunHints(withEvents(s0, ["refresh-page", "ask-family"]))).toEqual(["换个车次"]);
    expect(
      chunyunHints(withEvents(s0, ["refresh-page", "ask-family", "change-train"])),
    ).toEqual(["候补抢票"]);
    expect(
      chunyunHints(
        withEvents(s0, ["refresh-page", "ask-family", "change-train", "grab-ticket"]),
      ),
    ).toEqual(["确认购票"]);
    expect(chunyunHints(withEvents(s0, [], { closeness: "已找到" }))).toEqual(["确认购票"]);
  });

  it("植物：按关键节点推进建议", () => {
    const s0 = createPlantWeek();
    expect(plantWeekHints(s0)).toEqual(["浇水"]);
    expect(plantWeekHints(withEvents(s0, ["water-first"]))).toEqual(["搬去阳台晒晒"]);
    expect(plantWeekHints(withEvents(s0, ["water-first", "sunbathe"]))).toEqual(["施一点肥"]);
    expect(plantWeekHints(withEvents(s0, ["water-first", "sunbathe", "fertilize"]))).toEqual([
      "挪到阴凉处",
    ]);
    expect(
      plantWeekHints(withEvents(s0, ["water-first", "sunbathe", "fertilize", "shade"])),
    ).toEqual(["看看叶子"]);
    expect(
      plantWeekHints(
        withEvents(s0, ["water-first", "sunbathe", "fertilize", "shade", "check-health"]),
      ),
    ).toEqual(["交还给朋友"]);
    expect(plantWeekHints(withEvents(s0, [], { closeness: "已找到" }))).toEqual(["交还给朋友"]);
  });

  it("各模组 sceneArt 配置齐全", () => {
    expect(lostCatSceneArt.opening).toContain("lost-cat");
    expect(elevatorSceneArt.byEventId?.["press-alarm"]).toBeTruthy();
    expect(blindDateSceneArt.opening).toContain("blind-date");
    expect(chunyunSceneArt.byEventId?.["grab-ticket"] ?? chunyunSceneArt.opening).toBeTruthy();
    expect(plantWeekSceneArt.opening).toContain("plant-week");
  });
});
