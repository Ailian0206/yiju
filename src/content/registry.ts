import type { ModuleBundle, ModuleMeta } from "@/content/types";
import { createLostCatBundle } from "@/content/lost-cat/bundle";
import { lostCatMeta } from "@/content/lost-cat/meta";
import { elevatorMeta } from "@/content/elevator/meta";
import { blindDateMeta } from "@/content/blind-date/meta";
import { chunyunMeta } from "@/content/chunyun/meta";
import { plantWeekMeta } from "@/content/plant-week/meta";

const ALL_META: ModuleMeta[] = [
  lostCatMeta,
  elevatorMeta,
  blindDateMeta,
  chunyunMeta,
  plantWeekMeta,
];

const bundlesById: Record<string, () => ModuleBundle> = {
  "lost-cat": createLostCatBundle,
};

/** 主页用的完整模组列表(含即将开发)。 */
export function listModules(): ModuleMeta[] {
  return ALL_META;
}

/** 仅可开玩的模组。 */
export function listPlayableModules(): ModuleMeta[] {
  return ALL_META.filter((m) => m.status === "playable");
}

export function getModule(moduleId: string): ModuleMeta | undefined {
  return ALL_META.find((m) => m.id === moduleId);
}

/** preview 模组没有 bundle,返回 undefined。 */
export function getModuleBundle(moduleId: string): ModuleBundle | undefined {
  const meta = getModule(moduleId);
  if (!meta || meta.status !== "playable") return undefined;
  const factory = bundlesById[moduleId];
  return factory ? factory() : undefined;
}
