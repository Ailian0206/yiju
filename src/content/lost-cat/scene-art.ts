import type { ModuleSceneArt } from "@/content/types";
import { LOCATIONS } from "./module";

/** 找猫局内关键节点插图。 */
export const lostCatSceneArt: ModuleSceneArt = {
  opening: "/modules/lost-cat/scenes/opening.webp",
  byEventId: {
    "ask-guard": "/modules/lost-cat/scenes/guard.webp",
    "search-greenbelt": "/modules/lost-cat/scenes/greenbelt.webp",
    "use-box": "/modules/lost-cat/scenes/found.webp",
    finish: "/modules/lost-cat/scenes/found.webp",
  },
  byLocationId: {
    [LOCATIONS.GARAGE]: "/modules/lost-cat/scenes/garage.webp",
  },
};
