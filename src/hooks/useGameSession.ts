"use client";

// 把 resolver / reduce / narrator / localStorage 串起来。
// 按 moduleId 从 registry 取 bundle——引擎仍不认识具体模组名字。
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createKeywordIntentResolver } from "@/engine/intent";
import { reduce } from "@/engine/reducer";
import type { ActionOutcome, GameState, LogEntry } from "@/engine/types";
import { getModuleBundle } from "@/content/registry";
import { resolveSceneImage } from "@/content/shared/scene-art";
import { shouldOfferSuggestions } from "@/content/shared/suggestion-policy";
import { createLLMNarrator } from "@/content/lost-cat/llm-narrator";

function hasPlayerActed(state: GameState): boolean {
  return state.log.some((entry) => entry.kind === "player");
}

function storageKeyFor(moduleId: string): string {
  return `yiju-${moduleId}-session-v1`;
}

function loadSavedState(moduleId: string): GameState | null {
  try {
    const raw = window.localStorage.getItem(storageKeyFor(moduleId));
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

function saveState(moduleId: string, state: GameState): void {
  try {
    window.localStorage.setItem(storageKeyFor(moduleId), JSON.stringify(state));
  } catch {
    // 隐私模式等场景下 localStorage 可能不可用
  }
}

function makeLogEntry(kind: LogEntry["kind"], text: string, imageSrc?: string): LogEntry {
  const id = typeof crypto !== "undefined" ? crypto.randomUUID() : `${kind}-${Date.now()}-${Math.random()}`;
  return imageSrc ? { id, kind, text, imageSrc } : { id, kind, text };
}

export function useGameSession(moduleId: string) {
  const bundle = useMemo(() => getModuleBundle(moduleId), [moduleId]);
  if (!bundle) {
    throw new Error(`模组不可玩或不存在:${moduleId}`);
  }

  // 首屏必须与 SSR 一致(只用初始态);存档在挂载后再灌入,避免水合失败。
  const [state, setState] = useState<GameState>(() => bundle.createInitialState());
  const [hydrated, setHydrated] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  // 最近一次 outcome:读档后为 null → 不提示,直到再次卡住
  const [lastOutcomeKind, setLastOutcomeKind] = useState<ActionOutcome["kind"] | null>(null);
  const resolverRef = useRef(createKeywordIntentResolver(bundle.vocabulary));
  const narratorRef = useRef(bundle.createNarrator({ llmNarrator: createLLMNarrator(moduleId) }));
  const eventsRef = useRef(bundle.events);

  useEffect(() => {
    const saved = loadSavedState(moduleId);
    if (saved) {
      // 有意:挂载后灌档才能与 SSR 首屏对齐
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 读档必须在客户端挂载后
      setState(saved);
    }
    setHydrated(true);
  }, [moduleId]);

  useEffect(() => {
    // 等灌档完成后再写回,避免默认态盖住存档
    if (!hydrated) return;
    saveState(moduleId, state);
  }, [state, moduleId, hydrated]);

  const submit = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text || state.status !== "playing" || isThinking) return;

      const intent = resolverRef.current.resolve(text, state);
      const result = reduce(state, intent, eventsRef.current);

      setIsThinking(true);
      try {
        const narration = await narratorRef.current.narrate(result.outcome, result.nextState, text);
        const imageSrc = resolveSceneImage(bundle.sceneArt, result.outcome);
        setLastOutcomeKind(result.outcome.kind);
        setState({
          ...result.nextState,
          log: [
            ...state.log,
            makeLogEntry("player", text),
            makeLogEntry("narration", narration, imageSrc),
          ],
        });
      } finally {
        setIsThinking(false);
      }
    },
    [state, isThinking, bundle],
  );

  const restart = useCallback(() => {
    const fresh = bundle.createInitialState();
    narratorRef.current = bundle.createNarrator({ llmNarrator: createLLMNarrator(moduleId) });
    saveState(moduleId, fresh);
    setLastOutcomeKind(null);
    setState(fresh);
  }, [bundle, moduleId]);

  const getSuggestedActions = useCallback(
    (current: GameState) => {
      if (
        !shouldOfferSuggestions({
          hasPlayerActed: hasPlayerActed(current),
          lastOutcomeKind,
        })
      ) {
        return [];
      }
      return bundle.getSuggestedActions(current);
    },
    [bundle, lastOutcomeKind],
  );

  return {
    state,
    submit,
    restart,
    isThinking,
    meta: bundle.meta,
    ui: bundle.ui,
    openingNarration: bundle.openingNarration,
    openingImageSrc: bundle.sceneArt?.opening,
    getSuggestedActions,
  };
}
