import { describe, expect, it, vi } from "vitest";
import {
  ANALYTICS_EVENT_NAMES,
  PARAM_VALUE_MAX,
  PENDING_MAX,
  drainPending,
  emitEvent,
  emitEventOnce,
  enqueuePending,
  isAnalyticsEventName,
  memoryOnceStore,

  normalizeGaId,
  normalizeParams,
  parseLoginMethod,
  ticketsExhaustedKey,
  type PendingEvent,
} from "@/lib/analytics";

describe("normalizeGaId", () => {
  it("G-로 시작하는 측정 ID를 통과시킨다", () => {
    expect(normalizeGaId("G-ABC123XYZ")).toBe("G-ABC123XYZ");
  });

  it("앞뒤 공백을 다듬는다", () => {
    expect(normalizeGaId("  G-ABC123  ")).toBe("G-ABC123");
  });

  it("비었거나 없으면 null — GA를 아예 로드하지 않는 상태", () => {
    expect(normalizeGaId("")).toBeNull();
    expect(normalizeGaId("   ")).toBeNull();
    expect(normalizeGaId(undefined)).toBeNull();
    expect(normalizeGaId(null)).toBeNull();
  });

  it("형식이 아닌 값은 null", () => {
    expect(normalizeGaId("UA-12345-1")).toBeNull();
    expect(normalizeGaId("ca-pub-123")).toBeNull();
    expect(normalizeGaId("G-")).toBeNull();
    expect(normalizeGaId("g-abc")).toBeNull();
  });
});

// AdSense ID 정규화 테스트는 src/lib/adsense.test.ts에 있다. 판정을 한 곳에
// 모아 두어야 스크립트는 실리는데 ads.txt는 404인 어긋남이 생기지 않는다.

describe("이벤트 이름", () => {
  it("퍼널 여덟 건을 모두 들고 있다", () => {
    expect([...ANALYTICS_EVENT_NAMES].sort()).toEqual([
      "deck_modal_opened",
      "draw_completed",
      "focus_selected",
      "login_completed",
      "reading_start",
      "result_viewed",
      "share_clicked",
      "tickets_exhausted",
    ]);
  });

  it("사전에 없는 이름은 거른다", () => {
    expect(isAnalyticsEventName("reading_start")).toBe(true);
    expect(isAnalyticsEventName("page_view")).toBe(false);
    expect(isAnalyticsEventName("toString")).toBe(false);
  });
});

describe("normalizeParams", () => {
  it("스칼라는 그대로 싣는다", () => {
    expect(normalizeParams({ spread: "one", count: 3, first: true })).toEqual({
      count: 3,
      first: true,
      spread: "one",
    });
  });

  it("undefined·null·빈 문자열은 뺀다", () => {
    expect(
      normalizeParams({ a: undefined, b: null, c: "", d: "   ", e: "ok" }),
    ).toEqual({ e: "ok" });
  });

  it("NaN·무한대는 뺀다", () => {
    expect(normalizeParams({ a: NaN, b: Infinity, c: 0 })).toEqual({ c: 0 });
  });

  it("객체·배열·함수는 싣지 않는다 — 자유 텍스트가 새어 들어올 통로를 막는다", () => {
    expect(
      normalizeParams({
        note: { body: "일기 본문" },
        list: ["a"],
        fn: () => {},
        ok: "keep",
      }),
    ).toEqual({ ok: "keep" });
  });

  it("문자열을 다듬고 상한에서 자른다", () => {
    const long = "x".repeat(PARAM_VALUE_MAX + 50);
    const out = normalizeParams({ v: ` ${long} ` });
    expect(out.v).toHaveLength(PARAM_VALUE_MAX);
  });

  it("키를 정렬해 호출 순서에 흔들리지 않는다", () => {
    expect(Object.keys(normalizeParams({ z: 1, a: 2, m: 3 }))).toEqual([
      "a",
      "m",
      "z",
    ]);
  });
});

describe("emitEvent", () => {
  it("sender가 없으면 조용히 아무 일도 하지 않는다", () => {
    expect(emitEvent(null, "reading_start", { spread: "one" })).toBe(false);
  });

  it("이름과 정규화된 파라미터를 넘긴다", () => {
    const sender = vi.fn();
    const sent = emitEvent(sender, "draw_completed", {
      spread: "three",
      focus: " love ",
      deck_id: "classic",
    });
    expect(sent).toBe(true);
    expect(sender).toHaveBeenCalledWith("draw_completed", {
      deck_id: "classic",
      focus: "love",
      spread: "three",
    });
  });

  it("sender가 던져도 밖으로 새지 않는다", () => {
    const sender = vi.fn(() => {
      throw new Error("gtag 폭발");
    });
    expect(() =>
      emitEvent(sender, "result_viewed", { spread: "one" }),
    ).not.toThrow();
    expect(emitEvent(sender, "result_viewed", { spread: "one" })).toBe(false);
  });
});

describe("emitEventOnce", () => {
  it("같은 키로는 한 번만 보낸다", () => {
    const store = memoryOnceStore();
    const sender = vi.fn();
    const params = { surface: "reading_choice", spread: "one" } as const;

    expect(emitEventOnce(store, sender, "k", "tickets_exhausted", params)).toBe(
      true,
    );
    expect(emitEventOnce(store, sender, "k", "tickets_exhausted", params)).toBe(
      false,
    );
    expect(emitEventOnce(store, sender, "k", "tickets_exhausted", params)).toBe(
      false,
    );
    expect(sender).toHaveBeenCalledTimes(1);
  });

  it("키가 다르면 각각 나간다", () => {
    const store = memoryOnceStore();
    const sender = vi.fn();
    emitEventOnce(store, sender, "a", "result_viewed", { spread: "one" });
    emitEventOnce(store, sender, "b", "result_viewed", { spread: "three" });
    expect(sender).toHaveBeenCalledTimes(2);
  });

  it("GA가 없어도 키를 소진한다 — 늦게 붙은 GA에 밀린 이벤트가 쏟아지지 않게", () => {
    const store = memoryOnceStore();
    expect(emitEventOnce(store, null, "k", "result_viewed", { spread: "one" })).toBe(
      false,
    );
    const sender = vi.fn();
    expect(
      emitEventOnce(store, sender, "k", "result_viewed", { spread: "one" }),
    ).toBe(false);
    expect(sender).not.toHaveBeenCalled();
  });
});

describe("대기열", () => {
  const ev = (name: string): PendingEvent => ({ name, payload: {} });

  it("상한을 넘으면 오래된 것부터 버린다", () => {
    const queue: PendingEvent[] = [];
    for (let i = 0; i < PENDING_MAX + 3; i += 1) {
      enqueuePending(queue, ev(`e${i}`));
    }
    expect(queue).toHaveLength(PENDING_MAX);
    expect(queue[0].name).toBe("e3");
    expect(queue[queue.length - 1].name).toBe(`e${PENDING_MAX + 2}`);
  });

  it("sender가 없으면 한 건도 소비하지 않는다 — GA가 붙을 때까지 기다린다", () => {
    const queue = [ev("a"), ev("b")];
    expect(drainPending(queue, null)).toBe(0);
    expect(queue).toHaveLength(2);
  });

  it("sender가 생기면 담긴 순서대로 비운다", () => {
    const queue = [ev("a"), ev("b"), ev("c")];
    const sender = vi.fn();
    expect(drainPending(queue, sender)).toBe(3);
    expect(queue).toHaveLength(0);
    expect(sender.mock.calls.map((c) => c[0])).toEqual(["a", "b", "c"]);
  });

  it("한 건이 던져도 나머지를 계속 보낸다", () => {
    const queue = [ev("a"), ev("b")];
    const sender = vi.fn((name: string) => {
      if (name === "a") throw new Error("일시 오류");
    });
    expect(drainPending(queue, sender)).toBe(1);
    expect(queue).toHaveLength(0);
    expect(sender).toHaveBeenCalledTimes(2);
  });
});

describe("ticketsExhaustedKey", () => {
  it("날짜마다 새 키 — 자정에 티켓이 다시 열리므로 다음 날은 다시 한 번 나간다", () => {
    const a = ticketsExhaustedKey(new Date(2026, 6, 28, 23, 59));
    const b = ticketsExhaustedKey(new Date(2026, 6, 29, 0, 1));
    expect(a).toBe("tickets_exhausted:2026-07-28");
    expect(b).toBe("tickets_exhausted:2026-07-29");
    expect(a).not.toBe(b);
  });

  it("같은 날 안에서는 시각이 달라도 같은 키", () => {
    expect(ticketsExhaustedKey(new Date(2026, 6, 28, 1, 0))).toBe(
      ticketsExhaustedKey(new Date(2026, 6, 28, 20, 0)),
    );
  });
});

describe("parseLoginMethod", () => {
  it("아는 경로만 통과시킨다", () => {
    expect(parseLoginMethod("google")).toBe("google");
    expect(parseLoginMethod("kakao")).toBe("kakao");
    expect(parseLoginMethod("development")).toBe("development");
  });

  it("모르는 값·null은 null", () => {
    expect(parseLoginMethod("apple")).toBeNull();
    expect(parseLoginMethod("")).toBeNull();
    expect(parseLoginMethod(null)).toBeNull();
  });
});
