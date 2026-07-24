import { describe, expect, it, beforeEach } from "vitest";
import {
  getBestSnapshot,
  persistBest,
  recordIfBetter,
} from "./bestStore";

const KEY = "yiju-test-best";

describe("bestStore", () => {
  beforeEach(() => {
    localStorage.clear();
    persistBest(KEY, {});
  });

  it("更优分数写入,平局不写", () => {
    expect(recordIfBetter(KEY, "easy", 40)).toBe(true);
    expect(getBestSnapshot(KEY).easy).toBe(40);
    expect(recordIfBetter(KEY, "easy", 40)).toBe(false);
    expect(recordIfBetter(KEY, "easy", 35)).toBe(true);
    expect(getBestSnapshot(KEY).easy).toBe(35);
  });
});
