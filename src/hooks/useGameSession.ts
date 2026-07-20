"use client";

// 把 resolver(自然语言 -> 意图)、reduce(状态机)、narrator(叙述文本)
// 和 localStorage 存档串起来。这是唯一知道"一次玩家输入要依次做哪几件事"
// 的地方——引擎和内容层互相都不知道对方,靠这层拼接。
import { useCallback, useEffect, useRef, useState } from "react";
import { createKeywordIntentResolver } from "@/engine/intent";
import { reduce } from "@/engine/reducer";
import type { GameState, LogEntry } from "@/engine/types";
import { lostCatEvents } from "@/content/lost-cat/events";
import { lostCatVocabulary } from "@/content/lost-cat/lexicon";
import { createInitialState } from "@/content/lost-cat/module";
import { lostCatNarrator } from "@/content/lost-cat/narrator-config";

const STORAGE_KEY = "yiju-lost-cat-session-v1";

function loadSavedState(): GameState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GameState) : null;
  } catch {
    return null;
  }
}

function saveState(state: GameState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 隐私模式等场景下 localStorage 可能不可用,不影响当前会话继续游玩
  }
}

function makeLogEntry(kind: LogEntry["kind"], text: string): LogEntry {
  const id = typeof crypto !== "undefined" ? crypto.randomUUID() : `${kind}-${Date.now()}-${Math.random()}`;
  return { id, kind, text };
}

export function useGameSession() {
  const [state, setState] = useState<GameState>(createInitialState);
  const hydratedRef = useRef(false);
  const resolverRef = useRef(createKeywordIntentResolver(lostCatVocabulary));

  useEffect(() => {
    const saved = loadSavedState();
    if (saved) {
      // 一次性从 localStorage(外部系统)同步进 React state,不是渲染期间
      // 互相触发的循环——SSR 阶段没有 window,只能在挂载后读取,
      // 符合 lint 规则本身说明里"从外部系统读取后 setState"的例外情形。
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(saved);
    }
    hydratedRef.current = true;
  }, []);

  useEffect(() => {
    if (hydratedRef.current) {
      saveState(state);
    }
  }, [state]);

  const submit = useCallback((rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    setState((prev) => {
      if (prev.status !== "playing") return prev;

      const intent = resolverRef.current.resolve(text, prev);
      const result = reduce(prev, intent, lostCatEvents);
      const narration = lostCatNarrator.narrate(result.outcome, result.nextState);

      return {
        ...result.nextState,
        log: [...prev.log, makeLogEntry("player", text), makeLogEntry("narration", narration)],
      };
    });
  }, []);

  const restart = useCallback(() => {
    const fresh = createInitialState();
    saveState(fresh);
    setState(fresh);
  }, []);

  return { state, submit, restart };
}
