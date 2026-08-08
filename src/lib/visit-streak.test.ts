import { describe, expect, it } from "vitest";
import {
  EMPTY_VISIT,
  daysBetween,
  parseVisitState,
  streakAliveOn,
  streakNoteOf,
  withVisit,
  type VisitState,
} from "@/lib/visit-streak";

describe("daysBetween", () => {
  it("같은 날은 0", () => {
    expect(daysBetween("2026-08-08", "2026-08-08")).toBe(0);
  });

  it("하루 차이는 1", () => {
    expect(daysBetween("2026-08-07", "2026-08-08")).toBe(1);
  });

  it("월을 넘어가도 센다", () => {
    expect(daysBetween("2026-07-31", "2026-08-02")).toBe(2);
  });

  /*
   * 로컬 날짜 문자열을 UTC 자정으로 고정해 빼기 때문에 서머타임이 있는
   * 지역에서도 23시간·25시간짜리 하루가 0.96일이나 1.04일로 새지 않는다.
   */
  it("윤년 2월을 넘어가도 센다", () => {
    expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2);
  });

  it("형식이 깨진 값은 0으로 답한다", () => {
    expect(daysBetween("어제", "2026-08-08")).toBe(0);
  });
});

describe("withVisit", () => {
  it("첫 방문이면 연속 1로 시작한다", () => {
    const r = withVisit(EMPTY_VISIT, "2026-08-08");
    expect(r.state).toEqual({ lastVisit: "2026-08-08", streak: 1, best: 1 });
    expect(r.isFirstToday).toBe(true);
    expect(r.dayGap).toBeNull();
    expect(r.streakBroken).toBe(false);
  });

  it("어제 왔으면 연속이 하루 늘어난다", () => {
    const prev: VisitState = { lastVisit: "2026-08-07", streak: 3, best: 5 };
    const r = withVisit(prev, "2026-08-08");
    expect(r.state.streak).toBe(4);
    expect(r.dayGap).toBe(1);
    expect(r.streakBroken).toBe(false);
  });

  it("연속이 최장 기록을 넘으면 최장도 갱신한다", () => {
    const prev: VisitState = { lastVisit: "2026-08-07", streak: 5, best: 5 };
    expect(withVisit(prev, "2026-08-08").state.best).toBe(6);
  });

  /*
   * 하루에 여러 번 여는 것은 흔하다. 그때마다 연속이 늘면 숫자가 곧 거짓이
   * 되고, 저장도 매번 일어나 헛 알림이 나간다.
   */
  it("같은 날 다시 오면 아무것도 바뀌지 않는다", () => {
    const prev: VisitState = { lastVisit: "2026-08-08", streak: 3, best: 5 };
    const r = withVisit(prev, "2026-08-08");
    expect(r.state).toBe(prev); // 같은 객체를 그대로 돌려준다
    expect(r.isFirstToday).toBe(false);
    expect(r.dayGap).toBe(0);
  });

  it("하루를 건너뛰면 연속이 1로 끊기고 최장은 남는다", () => {
    const prev: VisitState = { lastVisit: "2026-08-05", streak: 4, best: 4 };
    const r = withVisit(prev, "2026-08-08");
    expect(r.state.streak).toBe(1);
    expect(r.state.best).toBe(4);
    expect(r.dayGap).toBe(3);
    expect(r.streakBroken).toBe(true);
  });

  /*
   * 기기 시계를 되돌리면 저장된 날짜가 미래가 된다. 그때 연속을 늘려 주면
   * 기록이 거짓이 되므로, 늘리지 않는 쪽으로 틀린다.
   */
  it("저장된 날짜가 미래여도 연속을 늘려 주지 않는다", () => {
    const prev: VisitState = { lastVisit: "2026-08-20", streak: 9, best: 9 };
    const r = withVisit(prev, "2026-08-08");
    expect(r.state.streak).toBe(1);
    expect(r.state.best).toBe(9);
  });
});

describe("streakAliveOn", () => {
  it("오늘 왔으면 살아 있다", () => {
    expect(streakAliveOn({ lastVisit: "2026-08-08", streak: 3, best: 3 }, "2026-08-08")).toBe(true);
  });

  it("어제까지 왔으면 아직 살아 있다(오늘 오면 이어진다)", () => {
    expect(streakAliveOn({ lastVisit: "2026-08-07", streak: 3, best: 3 }, "2026-08-08")).toBe(true);
  });

  it("이틀 전이면 이미 끊겼다", () => {
    expect(streakAliveOn({ lastVisit: "2026-08-06", streak: 3, best: 3 }, "2026-08-08")).toBe(false);
  });

  it("방문 기록이 없으면 살아 있지 않다", () => {
    expect(streakAliveOn(EMPTY_VISIT, "2026-08-08")).toBe(false);
  });
});

describe("parseVisitState", () => {
  it("정상 값을 그대로 읽는다", () => {
    expect(
      parseVisitState({ lastVisit: "2026-08-08", streak: 3, best: 7 }),
    ).toEqual({ lastVisit: "2026-08-08", streak: 3, best: 7 });
  });

  it.each([null, "문자열", 42, {}, { lastVisit: "어제" }, { lastVisit: "2026-8-8" }])(
    "형식이 아니면 빈 상태로 답한다: %s",
    (raw) => {
      expect(parseVisitState(raw)).toEqual(EMPTY_VISIT);
    },
  );

  it("음수·소수·NaN은 0으로 정규화한다", () => {
    expect(
      parseVisitState({ lastVisit: "2026-08-08", streak: -3, best: 2.7 }),
    ).toEqual({ lastVisit: "2026-08-08", streak: 0, best: 2 });
  });
});

describe("streakNoteOf", () => {
  const note = (state: VisitState) => streakNoteOf(state, "2026-08-08");

  it("첫날에는 아무 말도 하지 않는다", () => {
    expect(note({ lastVisit: "2026-08-08", streak: 1, best: 1 })).toBeNull();
  });

  it("이틀째부터 이어 온 날수를 말한다", () => {
    expect(note({ lastVisit: "2026-08-08", streak: 2, best: 2 })?.text).toBe(
      "2일째 이어서 오고 계십니다",
    );
  });

  it("최장과 나란하면 그 사실을 표시한다(3일부터)", () => {
    expect(note({ lastVisit: "2026-08-08", streak: 3, best: 3 })?.isBest).toBe(true);
    expect(note({ lastVisit: "2026-08-08", streak: 2, best: 2 })?.isBest).toBe(false);
    expect(note({ lastVisit: "2026-08-08", streak: 4, best: 9 })?.isBest).toBe(false);
  });

  /*
   * 연속이 끊겨 1로 돌아온 사람에게 끊김을 알리면, 돌아온 그 행동을 벌주는
   * 셈이 된다. 앞을 보는 말만 한다.
   */
  it("연속이 끊겨도 나무라지 않는다", () => {
    const n = note({ lastVisit: "2026-08-08", streak: 1, best: 6 });
    expect(n?.text).toBe("오늘부터 다시 이어 갑니다");
    expect(n?.text).not.toContain("끊");
  });

  it("어제까지만 온 상태여도 아직 살아 있다고 본다", () => {
    expect(note({ lastVisit: "2026-08-07", streak: 3, best: 3 })?.text).toBe(
      "3일째 이어서 오고 계십니다",
    );
  });

  it("이미 끊긴 지 오래면 말하지 않는다", () => {
    expect(note({ lastVisit: "2026-07-01", streak: 9, best: 9 })).toBeNull();
  });
});
