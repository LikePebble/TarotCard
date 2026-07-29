import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  refreshFromRemote: vi.fn(() => true),
  schedulePush: vi.fn(),
}));

vi.mock("@/lib/sync/pusher", () => ({
  REFRESH_INTERVAL_MS: 300_000,
  refreshFromRemote: mocks.refreshFromRemote,
  schedulePush: mocks.schedulePush,
}));

import { wireRefreshTriggers } from "@/lib/sync/refresh-triggers";

/** addEventListener로 걸린 핸들러를 붙잡아 두는 가짜 이벤트 대상. */
function fakeTarget() {
  const handlers = new Map<string, Set<() => void>>();
  return {
    handlers,
    addEventListener(type: string, fn: () => void) {
      (handlers.get(type) ?? handlers.set(type, new Set()).get(type)!).add(fn);
    },
    removeEventListener(type: string, fn: () => void) {
      handlers.get(type)?.delete(fn);
    },
    fire(type: string) {
      for (const fn of [...(handlers.get(type) ?? [])]) fn();
    },
    count(type: string) {
      return handlers.get(type)?.size ?? 0;
    },
  };
}

function setup(visibility: DocumentVisibilityState = "visible") {
  const docTarget = fakeTarget();
  const winTarget = fakeTarget();
  let intervalFn: (() => void) | null = null;
  const clearInterval = vi.fn();

  const doc = { ...docTarget, visibilityState: visibility } as never;
  const win = {
    ...winTarget,
    setInterval: (fn: () => void) => {
      intervalFn = fn;
      return 7 as unknown as ReturnType<typeof setInterval>;
    },
    clearInterval,
  } as never;

  const off = wireRefreshTriggers(doc, win);
  return {
    off,
    docTarget,
    winTarget,
    clearInterval,
    tick: () => intervalFn?.(),
  };
}

describe("wireRefreshTriggers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.refreshFromRemote.mockReturnValue(true);
  });

  it("탭이 보이면 복귀와 포커스에서 갱신한다", () => {
    const { docTarget, winTarget } = setup("visible");

    docTarget.fire("visibilitychange");
    winTarget.fire("focus");

    expect(mocks.refreshFromRemote).toHaveBeenCalledTimes(2);
    expect(mocks.refreshFromRemote).toHaveBeenCalledWith();
  });

  it("탭이 보이지 않으면 갱신하지 않는다", () => {
    const { docTarget, tick } = setup("hidden");

    docTarget.fire("visibilitychange");
    tick();

    expect(mocks.refreshFromRemote).not.toHaveBeenCalled();
  });

  it("주기 틱에서도 갱신한다", () => {
    const { tick } = setup("visible");
    tick();
    expect(mocks.refreshFromRemote).toHaveBeenCalledTimes(1);
  });

  /*
   * 네트워크 복귀는 밀린 변경을 올릴 마지막 기회다. 갱신이 시작되면 그
   * 안에 push가 들어 있고, 건너뛰었으면 push만 예약해야 한다.
   */
  it("네트워크 복귀는 최소 간격을 무시하고 갱신한다", () => {
    const { winTarget } = setup("visible");

    winTarget.fire("online");

    expect(mocks.refreshFromRemote).toHaveBeenCalledWith({ force: true });
    expect(mocks.schedulePush).not.toHaveBeenCalled();
  });

  it("네트워크 복귀 갱신이 건너뛰어지면 push만 예약한다", () => {
    mocks.refreshFromRemote.mockReturnValue(false);
    const { winTarget } = setup("visible");

    winTarget.fire("online");

    expect(mocks.schedulePush).toHaveBeenCalledTimes(1);
  });

  it("네트워크 복귀는 탭이 보이지 않아도 돈다", () => {
    const { winTarget } = setup("hidden");
    winTarget.fire("online");
    expect(mocks.refreshFromRemote).toHaveBeenCalledWith({ force: true });
  });

  it("해제하면 리스너와 타이머를 모두 걷는다", () => {
    const { off, docTarget, winTarget, clearInterval } = setup("visible");

    off();

    expect(clearInterval).toHaveBeenCalledWith(7);
    expect(docTarget.count("visibilitychange")).toBe(0);
    expect(winTarget.count("focus")).toBe(0);
    expect(winTarget.count("online")).toBe(0);

    docTarget.fire("visibilitychange");
    winTarget.fire("online");
    expect(mocks.refreshFromRemote).not.toHaveBeenCalled();
  });
});
