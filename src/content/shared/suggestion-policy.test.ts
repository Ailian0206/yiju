import { describe, expect, it } from "vitest";
import { shouldOfferSuggestions } from "./suggestion-policy";

describe("shouldOfferSuggestions — 选择性提示", () => {
  it("开局(尚无玩家行动)给提示", () => {
    expect(shouldOfferSuggestions({ hasPlayerActed: false, lastOutcomeKind: null })).toBe(true);
  });

  it("成功推进后不给提示(避免点芯片一路通关)", () => {
    expect(shouldOfferSuggestions({ hasPlayerActed: true, lastOutcomeKind: "triggered" })).toBe(false);
    expect(shouldOfferSuggestions({ hasPlayerActed: true, lastOutcomeKind: "moved" })).toBe(false);
  });

  it("卡住时才给提示:unknown / noop / rejected", () => {
    expect(shouldOfferSuggestions({ hasPlayerActed: true, lastOutcomeKind: "unknown" })).toBe(true);
    expect(shouldOfferSuggestions({ hasPlayerActed: true, lastOutcomeKind: "noop" })).toBe(true);
    expect(shouldOfferSuggestions({ hasPlayerActed: true, lastOutcomeKind: "rejected" })).toBe(true);
  });

  it("已有行动但尚无最近 outcome(如读档)不给提示", () => {
    expect(shouldOfferSuggestions({ hasPlayerActed: true, lastOutcomeKind: null })).toBe(false);
  });
});
