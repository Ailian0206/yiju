/** 挑战局本机最佳纪录:各游戏自备 storage key,分数默认越小越好。 */

export type BestMap = Record<string, number>;

const caches = new Map<string, BestMap | null>();
const listeners = new Map<string, Set<() => void>>();
const emptySnapshots = new Map<string, BestMap>();

function read(key: string): BestMap {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "{}") as BestMap;
  } catch {
    return {};
  }
}

export function getBestSnapshot(storageKey: string): BestMap {
  let cached = caches.get(storageKey);
  if (cached === undefined || cached === null) {
    cached =
      typeof window === "undefined" || typeof localStorage === "undefined"
        ? {}
        : read(storageKey);
    caches.set(storageKey, cached);
  }
  return cached;
}

/** SSR 必须同引用,避免 useSyncExternalStore 死循环。 */
export function getBestServerSnapshot(storageKey: string): BestMap {
  let empty = emptySnapshots.get(storageKey);
  if (!empty) {
    empty = {};
    emptySnapshots.set(storageKey, empty);
  }
  return empty;
}

export function subscribeBest(
  storageKey: string,
  onStoreChange: () => void,
): () => void {
  let set = listeners.get(storageKey);
  if (!set) {
    set = new Set();
    listeners.set(storageKey, set);
  }
  set.add(onStoreChange);
  return () => set!.delete(onStoreChange);
}

export function persistBest(storageKey: string, map: BestMap): void {
  caches.set(storageKey, map);
  localStorage.setItem(storageKey, JSON.stringify(map));
  listeners.get(storageKey)?.forEach((fn) => fn());
}

/** 若更好(默认更小)则写入并返回 true。 */
export function recordIfBetter(
  storageKey: string,
  difficulty: string,
  score: number,
  lowerIsBetter = true,
): boolean {
  const map = { ...getBestSnapshot(storageKey) };
  const current = map[difficulty];
  const better =
    current === undefined ||
    (lowerIsBetter ? score < current : score > current);
  if (!better) return false;
  map[difficulty] = score;
  persistBest(storageKey, map);
  return true;
}
