import { describe, expect, it, vi } from "vitest";
import { notifyLocal, subscribeLocal } from "@/lib/local-events";

describe("local-events", () => {
  it("구독자에게 알린다", () => {
    const fn = vi.fn();
    const off = subscribeLocal("store", fn);
    notifyLocal("store");
    expect(fn).toHaveBeenCalledTimes(1);
    off();
  });

  it("해지하면 더 이상 알리지 않는다", () => {
    const fn = vi.fn();
    const off = subscribeLocal("store", fn);
    off();
    notifyLocal("store");
    expect(fn).not.toHaveBeenCalled();
  });

  it("채널이 격리된다 - journal 알림은 store 구독자를 깨우지 않는다", () => {
    const onStore = vi.fn();
    const onJournal = vi.fn();
    const offStore = subscribeLocal("store", onStore);
    const offJournal = subscribeLocal("journal", onJournal);
    notifyLocal("journal");
    expect(onStore).not.toHaveBeenCalled();
    expect(onJournal).toHaveBeenCalledTimes(1);
    offStore();
    offJournal();
  });

  it("같은 채널의 여러 구독자에게 모두 알린다", () => {
    const a = vi.fn();
    const b = vi.fn();
    const offA = subscribeLocal("store", a);
    const offB = subscribeLocal("store", b);
    notifyLocal("store");
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    offA();
    offB();
  });

  it("한 구독자가 던져도 나머지 구독자에게 알린다", () => {
    const bad = vi.fn(() => {
      throw new Error("boom");
    });
    const good = vi.fn();
    const offBad = subscribeLocal("store", bad);
    const offGood = subscribeLocal("store", good);
    expect(() => notifyLocal("store")).not.toThrow();
    expect(good).toHaveBeenCalledTimes(1);
    offBad();
    offGood();
  });
});
