import type { ModuleSceneArt } from "@/content/types";

export const elevatorSceneArt: ModuleSceneArt = {
  opening: "/modules/elevator/scenes/opening.webp",
  byEventId: {
    "press-alarm": "/modules/elevator/scenes/alarm.webp",
    "use-intercom": "/modules/elevator/scenes/rescue.webp",
    finish: "/modules/elevator/scenes/rescue.webp",
  },
};
