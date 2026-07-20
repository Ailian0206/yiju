import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGameSession } from "./useGameSession";

describe("useGameSession", () => {
  beforeEach(() => {
    window.localStorage.clear();
    // 模拟"没配置 DeepSeek key"的默认状态:/api/narrate 请求失败,
    // 混合 narrator 应该静默回落模板——这是 P0/未配置密钥时的真实行为,
    // 不 mock 的话测试会真的尝试打一个必然失败的网络请求,虽然结果一样
    // 兜底成功,但方式是隐式依赖 fetch 对相对路径抛错这种实现细节。
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("fetch not mocked for this test")),
    );
  });

  afterEach(() => {
    window.localStorage.clear();
    vi.unstubAllGlobals();
  });

  it("初始状态是新的一局,叙事日志为空", () => {
    const { result } = renderHook(() => useGameSession());

    expect(result.current.state.status).toBe("playing");
    expect(result.current.state.log).toEqual([]);
    expect(result.current.isThinking).toBe(false);
  });

  it("submit 会依次追加玩家输入和叙述两条日志", async () => {
    const { result } = renderHook(() => useGameSession());

    await act(async () => {
      await result.current.submit("问问门卫");
    });

    expect(result.current.state.log).toHaveLength(2);
    expect(result.current.state.log[0]).toMatchObject({ kind: "player", text: "问问门卫" });
    expect(result.current.state.log[1].kind).toBe("narration");
    expect(result.current.state.log[1].text.length).toBeGreaterThan(0);
    expect(result.current.state.clues).toBe(1);
    expect(result.current.isThinking).toBe(false);
  });

  it("triggered 事件不走 LLM,不发起 /api/narrate 请求", async () => {
    const { result } = renderHook(() => useGameSession());

    await act(async () => {
      await result.current.submit("问问门卫");
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it("filler 场景(如无法理解的输入)会尝试调用 /api/narrate,失败后静默回落模板", async () => {
    const { result } = renderHook(() => useGameSession());

    await act(async () => {
      await result.current.submit("这是一句系统听不懂的话");
    });

    expect(fetch).toHaveBeenCalledWith("/api/narrate", expect.objectContaining({ method: "POST" }));
    expect(result.current.state.log[1].text.length).toBeGreaterThan(0);
  });

  it("空白输入不会产生任何状态变化", async () => {
    const { result } = renderHook(() => useGameSession());

    await act(async () => {
      await result.current.submit("   ");
    });

    expect(result.current.state.log).toEqual([]);
    expect(result.current.state.actionsRemaining).toBe(12);
  });

  it("游戏结束后再 submit 不会继续变化状态", async () => {
    const { result } = renderHook(() => useGameSession());

    // 每次 submit 各自用一个 act():act() 的状态更新 flush 是在整个回调
    // (含它包住的所有 await)结束后才发生的,把多次 submit 塞进同一个
    // act() 里,后面几次调用会读到 act() 开始时的旧闭包,而不是上一次
    // submit 提交后的新状态——这也是这个测试曾经失败过的原因。
    await act(async () => {
      await result.current.submit("去快递柜");
    });
    await act(async () => {
      await result.current.submit("打开纸箱");
    });
    const beforeStatus = result.current.state.status;
    expect(beforeStatus).toBe("playing"); // 没拿到手电,开箱应该被拒绝而不是通关

    act(() => {
      // 走一条真正能赢的路径,确认赢了之后追加输入不会破坏终局状态
      result.current.restart();
    });

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
      await act(async () => {
        await result.current.submit(text);
      });
    }

    expect(result.current.state.status).toBe("won");
    const logLengthAtWin = result.current.state.log.length;

    await act(async () => {
      await result.current.submit("还想再做点什么");
    });

    expect(result.current.state.status).toBe("won");
    expect(result.current.state.log).toHaveLength(logLengthAtWin);
  });

  it("restart 重置为新的一局并清空日志", async () => {
    const { result } = renderHook(() => useGameSession());

    await act(async () => {
      await result.current.submit("问问门卫");
    });
    expect(result.current.state.log.length).toBeGreaterThan(0);

    act(() => {
      result.current.restart();
    });

    expect(result.current.state.log).toEqual([]);
    expect(result.current.state.clues).toBe(0);
    expect(result.current.state.status).toBe("playing");
  });

  it("刷新后(重新挂载)能恢复上一次保存的进度", async () => {
    const first = renderHook(() => useGameSession());
    await act(async () => {
      await first.result.current.submit("问问门卫");
    });
    first.unmount();

    const second = renderHook(() => useGameSession());
    // localStorage 的读取发生在 effect 里,renderHook 已经 flush 了初次 effect
    expect(second.result.current.state.clues).toBe(1);
    expect(second.result.current.state.log).toHaveLength(2);
  });

  it("恢复存档时,写回 localStorage 的每一次调用都不会用挂载瞬间的默认状态覆盖已有存档", async () => {
    // 回归用例:曾经因为"两个 useEffect 谁先跑"这种没有文档保证的时序
    // 假设,导致挂载时会先用默认空状态写一次 localStorage,再被正确值
    // 覆盖回去——生产环境里因为两个 effect 在同一次 flush 里跑完,
    // 用户看不出问题,但这属于"结果碰巧对,原理是错的"。
    const first = renderHook(() => useGameSession());
    await act(async () => {
      await first.result.current.submit("问问门卫");
    });
    first.unmount();

    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    renderHook(() => useGameSession());

    for (const call of setItemSpy.mock.calls) {
      const written = JSON.parse(call[1] as string);
      expect(written.clues, "不应该有任何一次写入是清空过的默认状态").toBe(1);
      expect(written.log).toHaveLength(2);
    }

    setItemSpy.mockRestore();
  });
});
