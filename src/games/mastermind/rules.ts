/** Mastermind(密码破译)纯规则:与 UI / React 解耦。 */

export type DifficultyId = "easy" | "normal" | "hard";

export type DifficultyConfig = {
  id: DifficultyId;
  /** 中文显示名 */
  label: string;
  codeLength: number;
  colorCount: number;
  maxAttempts: number;
  /** false = 秘密码各位颜色互异 */
  allowDuplicates: boolean;
};

export const DIFFICULTIES: Record<DifficultyId, DifficultyConfig> = {
  easy: {
    id: "easy",
    label: "简单",
    codeLength: 3,
    colorCount: 5,
    maxAttempts: 10,
    allowDuplicates: false,
  },
  normal: {
    id: "normal",
    label: "普通",
    codeLength: 4,
    colorCount: 6,
    maxAttempts: 10,
    allowDuplicates: false,
  },
  hard: {
    id: "hard",
    label: "困难",
    codeLength: 5,
    colorCount: 8,
    maxAttempts: 12,
    allowDuplicates: true,
  },
};

export type PegFeedback = {
  /** 位准:颜色与位置都对(黑钉) */
  exact: number;
  /** 色准:颜色对但位置错(白钉);已计入 exact 的不再算 */
  color: number;
};

/**
 * 经典 Mastermind 计分:先扫位准,再对剩余做多重集合匹配算色准。
 * peg 为颜色下标 0..colorCount-1。
 */
export function evaluateGuess(
  secret: readonly number[],
  guess: readonly number[],
): PegFeedback {
  if (secret.length !== guess.length) {
    throw new Error("猜测与密码长度不一致");
  }

  const n = secret.length;
  const secretLeft = new Array<number>(n);
  const guessLeft = new Array<number>(n);
  let exact = 0;

  for (let i = 0; i < n; i++) {
    if (secret[i] === guess[i]) {
      exact += 1;
      secretLeft[i] = -1;
      guessLeft[i] = -1;
    } else {
      secretLeft[i] = secret[i]!;
      guessLeft[i] = guess[i]!;
    }
  }

  let color = 0;
  for (let i = 0; i < n; i++) {
    const g = guessLeft[i]!;
    if (g < 0) continue;
    const j = secretLeft.indexOf(g);
    if (j >= 0) {
      color += 1;
      secretLeft[j] = -1;
    }
  }

  return { exact, color };
}

export function isWin(feedback: PegFeedback, codeLength: number): boolean {
  return feedback.exact === codeLength;
}

export function remainingAttempts(
  usedAttempts: number,
  maxAttempts: number,
): number {
  return Math.max(0, maxAttempts - usedAttempts);
}

/** 生成秘密码;rng 返回 [0,1),便于测试注入。 */
export function createSecret(
  config: DifficultyConfig,
  rng: () => number = Math.random,
): number[] {
  if (config.allowDuplicates) {
    return Array.from({ length: config.codeLength }, () =>
      Math.floor(rng() * config.colorCount),
    );
  }

  // 无重复:洗牌取前 codeLength 个
  const pool = Array.from({ length: config.colorCount }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  return pool.slice(0, config.codeLength);
}
