import type { TemplatePoolConfig } from "@/engine/narrator";
import type { ModuleNarratorOptions } from "@/content/types";
import { createHybridNarrator } from "@/content/shared/hybrid-narrator";
import { plantWeekEvents } from "./events";
import { LOCATIONS } from "./module";
import { plantWeekTemplates } from "./templates";

export const plantWeekNarratorConfig: TemplatePoolConfig = {
  templates: plantWeekTemplates,
  eventTemplateKeys: {
    ...Object.fromEntries(plantWeekEvents.map((c) => [c.id, c.templateKeys])),
    finish: ["finish-success-1", "finish-success-2"],
  },
  rejectedTemplateKeys: { finish: ["finish-rejected-1"] },
  arrivalTemplateKeys: {
    [LOCATIONS.LIVING]: ["arrive-living-1"],
    [LOCATIONS.BALCONY]: ["arrive-balcony-1"],
  },
  fallback: {
    unknown: ["generic-unknown-1", "generic-unknown-2"],
    noop: ["generic-noop-1", "generic-noop-2"],
    rejected: ["generic-rejected-1"],
  },
};

export function createPlantWeekNarrator(options: ModuleNarratorOptions = {}) {
  return createHybridNarrator(plantWeekNarratorConfig, options);
}
