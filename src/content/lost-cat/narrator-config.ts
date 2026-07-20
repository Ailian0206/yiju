// 把 events.ts / templates.ts 的分散数据组装成 engine/narrator.ts 要的
// 扁平配置。这是唯一知道"某张事件卡对应哪些模板 key"的地方——
// engine/narrator.ts 本身不 import events.ts。
import { createTemplatePoolNarrator, type TemplatePoolConfig } from "@/engine/narrator";
import { LOCATIONS } from "./module";
import { lostCatEvents } from "./events";
import { lostCatTemplates } from "./templates";

const eventTemplateKeys: Record<string, string[]> = {
  ...Object.fromEntries(lostCatEvents.map((card) => [card.id, card.templateKeys])),
  // finish 成功不是一张 EventCard(引擎在 resolveFinish 里直接合成
  // eventId: "finish"),事件表里天然没有它,要在这里单独补上。
  finish: ["finish-success-1", "finish-success-2"],
};

const rejectedTemplateKeys: Record<string, string[]> = {
  "search-garage-with-flashlight": ["garage-dark-rejected-1"],
  "use-flashlight-garage": ["garage-dark-rejected-1"],
  finish: ["finish-rejected-1"],
};

const arrivalTemplateKeys: Record<string, string[]> = {
  [LOCATIONS.UNIT_ENTRANCE]: ["arrive-unit-entrance-1"],
  [LOCATIONS.GREENBELT]: ["arrive-greenbelt-1"],
  [LOCATIONS.GARAGE]: ["arrive-garage-1"],
  [LOCATIONS.OFFICE]: ["arrive-office-1"],
  [LOCATIONS.LOCKERS]: ["arrive-lockers-1"],
};

export const lostCatNarratorConfig: TemplatePoolConfig = {
  templates: lostCatTemplates,
  eventTemplateKeys,
  rejectedTemplateKeys,
  arrivalTemplateKeys,
  fallback: {
    unknown: ["generic-unknown-1", "generic-unknown-2"],
    noop: ["generic-noop-1", "generic-noop-2"],
    rejected: ["generic-rejected-1"],
  },
};

export const lostCatNarrator = createTemplatePoolNarrator(lostCatNarratorConfig);
