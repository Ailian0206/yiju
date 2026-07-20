import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useGameSession } from "./useGameSession";

describe("useGameSession", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("初始状态是新的一局,叙事日志为空", () => {
    const { result } = renderHook(() => useGameSession());

    expect(result.current.state.status).toBe("playing");
    expect(result.current.state.log).toEqual([]);
  });

  it("submit 会依次追加玩家输入和叙述两条日志", () => {
    const { result } = renderHook(() => useGameSession());

    act(() => {
      result.current.submit("问问门卫");
    });

    expect(result.current.state.log).toHaveLength(2);
    expect(result.current.state.log[0]).toMatchObject({ kind: "player", text: "问问门卫" });
    expect(result.current.state.log[1].kind).toBe("narration");
    expect(result.current.state.log[1].text.length).toBeGreaterThan(0);
    expect(result.current.state.clues).toBe(1);
  });

  it("空白输入不会产生任何状态变化", () => {
    const { result } = renderHook(() => useGameSession());

    act(() => {
      result.current.submit("   ");
    });

    expect(result.current.state.log).toEqual([]);
    expect(result.current.state.actionsRemaining).toBe(12);
  });

  it("游戏结束后再 submit 不会继续变化状态", () => {
    const { result } = renderHook(() => useGameSession());

    act(() => {
      result.current.submit("去快递柜");
      result.current.submit("打开纸箱");
    });
    const beforeStatus = result.current.state.status;
    expect(beforeStatus).toBe("playing"); // 没拿到手电,开箱应该被拒绝而不是通关

    act(() => {
      // 走一条真正能赢的路径,确认赢了之后追加输入不会破坏终局状态
      result.current.restart();
    });
    act(() => {
      for (const text of [
        "问问门卫",
        "去绿化带",
        "仔细找找",
        "去物业",
        "找找看",
        "去车库",
        "仔细找找",
        "去快递柜",
        "打开纸箱",
        "带年糕回家",
      ]) {
        result.current.submit(text);
      }
    });

    expect(result.current.state.status).toBe("won");
    const logLengthAtWin = result.current.state.log.length;

    act(() => {
      result.current.submit("还想再做点什么");
    });

    expect(result.current.state.status).toBe("won");
    expect(result.current.state.log).toHaveLength(logLengthAtWin);
  });

  it("restart 重置为新的一局并清空日志", () => {
    const { result } = renderHook(() => useGameSession());

    act(() => {
      result.current.submit("问问门卫");
    });
    expect(result.current.state.log.length).toBeGreaterThan(0);

    act(() => {
      result.current.restart();
    });

    expect(result.current.state.log).toEqual([]);
    expect(result.current.state.clues).toBe(0);
    expect(result.current.state.status).toBe("playing");
  });

  it("刷新后(重新挂载)能恢复上一次保存的进度", () => {
    const first = renderHook(() => useGameSession());
    act(() => {
      first.result.current.submit("问问门卫");
    });
    first.unmount();

    const second = renderHook(() => useGameSession());
    // localStorage 的读取发生在 effect 里,renderHook 已经 flush 了初次 effect
    expect(second.result.current.state.clues).toBe(1);
    expect(second.result.current.state.log).toHaveLength(2);
  });
});
