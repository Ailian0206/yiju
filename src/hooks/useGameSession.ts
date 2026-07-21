"use client";

// 把 resolver / reduce / narrator / localStorage 串起来。
// 按 moduleId 从 registry 取 bundle——引擎仍不认识具体模组名字。
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createKeywordIntentResolver } from "@/engine/intent";
import { reduce } from "@/engine/reducer";
import type { GameState, LogEntry } from "@/engine/types";
import { getModuleBundle } from "@/content/registry";
import { resolveSceneImage } from "@/content/shared/scene-art";
import { createLLMNarrator } from "@/content/lost-cat/llm-narrator";

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

  // 用 moduleId 作 key 挂载(见 GameScreen);初始化时一次读档,避免 effect 里 setState。
  const [state, setState] = useState<GameState>(() => {
    if (typeof window === "undefined") return bundle.createInitialState();
    return loadSavedState(moduleId) ?? bundle.createInitialState();
  });
  const [isThinking, setIsThinking] = useState(false);
  const resolverRef = useRef(createKeywordIntentResolver(bundle.vocabulary));
  const narratorRef = useRef(bundle.createNarrator({ llmNarrator: createLLMNarrator(moduleId) }));
  const eventsRef = useRef(bundle.events);
  // 挂载首帧跳过保存,防止默认态盖住刚读出的存档
  const skipNextSaveRef = useRef(true);

  useEffect(() => {
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    saveState(moduleId, state);
  }, [state, moduleId]);

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
    setState(fresh);
  }, [bundle, moduleId]);

  return {
    state,
    submit,
    restart,
    isThinking,
    meta: bundle.meta,
    ui: bundle.ui,
    openingNarration: bundle.openingNarration,
    openingImageSrc: bundle.sceneArt?.opening,
    getSuggestedActions: bundle.getSuggestedActions,
  };
}
