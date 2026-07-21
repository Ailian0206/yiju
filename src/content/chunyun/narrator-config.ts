import type { TemplatePoolConfig } from "@/engine/narrator";
import type { ModuleNarratorOptions } from "@/content/types";
import { createHybridNarrator } from "@/content/shared/hybrid-narrator";
import { chunyunEvents } from "./events";
import { LOCATIONS } from "./module";
import { chunyunTemplates } from "./templates";

export const chunyunNarratorConfig: TemplatePoolConfig = {
  templates: chunyunTemplates,
  eventTemplateKeys: {
    ...Object.fromEntries(chunyunEvents.map((c) => [c.id, c.templateKeys])),
    finish: ["finish-success-1", "finish-success-2"],
  },
  rejectedTemplateKeys: { finish: ["finish-rejected-1"] },
  arrivalTemplateKeys: { [LOCATIONS.DESK]: ["arrive-desk-1"] },
  fallback: {
    unknown: ["generic-unknown-1", "generic-unknown-2"],
    noop: ["generic-noop-1", "generic-noop-2"],
    rejected: ["generic-rejected-1"],
  },
};

export function createChunyunNarrator(options: ModuleNarratorOptions = {}) {
  return createHybridNarrator(chunyunNarratorConfig, options);
}
