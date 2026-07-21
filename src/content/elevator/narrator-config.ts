import type { TemplatePoolConfig } from "@/engine/narrator";
import type { ModuleNarratorOptions } from "@/content/types";
import { createHybridNarrator } from "@/content/shared/hybrid-narrator";
import { elevatorEvents } from "./events";
import { LOCATIONS } from "./module";
import { elevatorTemplates } from "./templates";

const eventTemplateKeys: Record<string, string[]> = {
  ...Object.fromEntries(elevatorEvents.map((card) => [card.id, card.templateKeys])),
  finish: ["finish-success-1", "finish-success-2"],
};

export const elevatorNarratorConfig: TemplatePoolConfig = {
  templates: elevatorTemplates,
  eventTemplateKeys,
  rejectedTemplateKeys: {
    "use-intercom": ["generic-rejected-1"],
    finish: ["finish-rejected-1"],
  },
  arrivalTemplateKeys: {
    [LOCATIONS.CABIN]: ["arrive-cabin-1"],
  },
  fallback: {
    unknown: ["generic-unknown-1", "generic-unknown-2"],
    noop: ["generic-noop-1", "generic-noop-2"],
    rejected: ["generic-rejected-1"],
  },
};

export function createElevatorNarrator(options: ModuleNarratorOptions = {}) {
  return createHybridNarrator(elevatorNarratorConfig, options);
}
