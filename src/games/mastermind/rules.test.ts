import { describe, expect, it } from "vitest";
import {
  createSecret,
  DIFFICULTIES,
  evaluateGuess,
  isWin,
  rateClearance,
  remainingAttempts,
} from "./rules";

describe("evaluateGuess(Mastermind 黑白钉)", () => {
  it("全对:全部位准", () => {
    expect(evaluateGuess([0, 1, 2, 3], [0, 1, 2, 3])).toEqual({
      exact: 4,
      color: 0,
    });
  });

  it("颜色对但位置全错:全部色准", () => {
    expect(evaluateGuess([0, 1, 2, 3], [3, 2, 1, 0])).toEqual({
      exact: 0,
      color: 4,
    });
  });

  it("混合:先算位准,再算剩余色准", () => {
    // 秘密 红绿蓝黄;猜测 红蓝绿黄 → 位准红+黄,色准蓝+绿
    expect(evaluateGuess([0, 1, 2, 3], [0, 2, 1, 3])).toEqual({
      exact: 2,
      color: 2,
    });
  });

  it("重复色:每位最多匹配一次(经典计分)", () => {
    // 秘密两个红;猜测三个红 → 最多 2 个钉(此处 1 位准 + 1 色准)
    expect(evaluateGuess([0, 0, 1, 2], [0, 3, 0, 0])).toEqual({
      exact: 1,
      color: 1,
    });
  });

  it("长度不一致抛错", () => {
    expect(() => evaluateGuess([0, 1], [0])).toThrow(/长度/);
  });
});

describe("createSecret / 胜负", () => {
  it("简单档:无重复色", () => {
    const cfg = DIFFICULTIES.easy;
    for (let i = 0; i < 40; i++) {
      const secret = createSecret(cfg, () => Math.random());
      expect(secret).toHaveLength(cfg.codeLength);
      expect(new Set(secret).size).toBe(cfg.codeLength);
      for (const peg of secret) {
        expect(peg).toBeGreaterThanOrEqual(0);
        expect(peg).toBeLessThan(cfg.colorCount);
      }
    }
  });

  it("困难档:允许重复色", () => {
    const cfg = DIFFICULTIES.hard;
    // 固定 RNG 产出重复,验证允许
    let n = 0;
    const rng = () => {
      const seq = [0.1, 0.1, 0.5, 0.9, 0.2];
      return seq[n++ % seq.length]!;
    };
    const secret = createSecret(cfg, rng);
    expect(secret).toHaveLength(cfg.codeLength);
  });

  it("猜中即胜;用尽次数未猜中则负", () => {
    const secret = [0, 1, 2, 3];
    expect(isWin(evaluateGuess(secret, secret), secret.length)).toBe(true);
    expect(isWin(evaluateGuess(secret, [0, 1, 2, 0]), secret.length)).toBe(
      false,
    );
    expect(remainingAttempts(3, 10)).toBe(7);
    expect(remainingAttempts(10, 10)).toBe(0);
  });
});

describe("rateClearance(通关评价)", () => {
  it("按用次占比给出档位", () => {
    expect(rateClearance(1, 10).id).toBe("perfect");
    expect(rateClearance(3, 10).id).toBe("great");
    expect(rateClearance(6, 10).id).toBe("good");
    expect(rateClearance(9, 10).id).toBe("close");
  });
});
