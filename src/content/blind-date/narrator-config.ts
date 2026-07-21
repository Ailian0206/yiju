import type { TemplatePoolConfig } from "@/engine/narrator";
import type { ModuleNarratorOptions } from "@/content/types";
import { createHybridNarrator } from "@/content/shared/hybrid-narrator";
import { blindDateEvents } from "./events";
import { LOCATIONS } from "./module";
import { blindDateTemplates } from "./templates";

const eventTemplateKeys: Record<string, string[]> = {
  ...Object.fromEntries(blindDateEvents.map((card) => [card.id, card.templateKeys])),
  finish: ["finish-success-1", "finish-success-2"],
};

export const blindDateNarratorConfig: TemplatePoolConfig = {
  templates: blindDateTemplates,
  eventTemplateKeys,
  rejectedTemplateKeys: {
    finish: ["finish-rejected-1"],
  },
  arrivalTemplateKeys: {
    [LOCATIONS.TABLE]: ["arrive-table-1"],
  },
  fallback: {
    unknown: ["generic-unknown-1", "generic-unknown-2"],
    noop: ["generic-noop-1", "generic-noop-2"],
    rejected: ["generic-rejected-1"],
  },
};

export function createBlindDateNarrator(options: ModuleNarratorOptions = {}) {
  return createHybridNarrator(blindDateNarratorConfig, options);
}
