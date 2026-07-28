import { describe, expect, it } from "vitest";
import type { ArcanaStore, ReadingRecord } from "@/lib/store";
import {
  DAILY_TICKETS_BASE,
  SIGNED_IN_BONUS,
  TICKET_BONUS_HINT,
  TICKET_RESET_NOTE,
  dailyTicketsFor,
  ticketNoticeOf,
  ticketStateOf,
} from "@/lib/tickets";

function reading(over: Partial<ReadingRecord>): ReadingRecord {
  return {
    id: "r1",
    at: "2026-07-19T05:00:00.000Z",
    localDate: "2026-07-19",
    isoWeek: "2026-W29",
    spread: "one",
    typeId: "ONE_CARD",
    category: "day",
    deckId: "classic",
    cards: ["thefool"],
    orientations: ["upright"],
    ...over,
  };
}

function storeOf(readings: ReadingRecord[]): ArcanaStore {
  return { version: 2, collection: {}, readings };
}

const today = new Date(2026, 6, 19); // 2026-07-19

/** 오늘 서로 다른 테마 n개를 뽑은 스토어. */
function usedToday(n: number): ArcanaStore {
  const cats = ["day", "love", "work", "self", "health", "money"];
  return storeOf(
    cats.slice(0, n).map((category, i) => reading({ id: `r${i}`, category })),
  );
}

describe("dailyTicketsFor", () => {
  it("비로그인은 2장, 로그인은 3장", () => {
    expect(dailyTicketsFor(false)).toBe(2);
    expect(dailyTicketsFor(true)).toBe(3);
    expect(dailyTicketsFor(false)).toBe(DAILY_TICKETS_BASE);
    expect(dailyTicketsFor(true)).toBe(DAILY_TICKETS_BASE + SIGNED_IN_BONUS);
  });
});

describe("ticketStateOf", () => {
  it("오늘 기록이 없으면 전부 남는다", () => {
    expect(ticketStateOf(storeOf([]), today, false)).toEqual({
      total: 2,
      used: 0,
      remaining: 2,
    });
    expect(ticketStateOf(storeOf([]), today, true)).toEqual({
      total: 3,
      used: 0,
      remaining: 3,
    });
  });

  it("오늘 뽑은 서로 다른 테마 수만큼 차감한다", () => {
    expect(ticketStateOf(usedToday(1), today, false)).toEqual({
      total: 2,
      used: 1,
      remaining: 1,
    });
  });

  it("같은 테마를 두 번 기록해도 한 장으로 센다", () => {
    const store = storeOf([
      reading({ id: "a", category: "love" }),
      reading({ id: "b", category: "love" }),
    ]);
    expect(ticketStateOf(store, today, false).used).toBe(1);
  });

  it("과거·현재·미래(주 1회)는 티켓을 쓰지 않는다", () => {
    const store = storeOf([
      reading({
        id: "w",
        spread: "three",
        typeId: "THREE_CARD_PPF",
        category: "love",
      }),
    ]);
    expect(ticketStateOf(store, today, false).used).toBe(0);
  });

  it("비로그인 2장을 다 쓰면 0장", () => {
    expect(ticketStateOf(usedToday(2), today, false)).toEqual({
      total: 2,
      used: 2,
      remaining: 0,
    });
  });

  it("로그인 보너스가 있으면 2장을 쓰고도 한 장 남는다", () => {
    expect(ticketStateOf(usedToday(2), today, true).remaining).toBe(1);
  });

  it("used가 total보다 커도 remaining은 음수가 되지 않는다(로그아웃)", () => {
    // 로그인 상태로 3장을 쓴 뒤 로그아웃하면 total이 2로 줄어든다.
    expect(ticketStateOf(usedToday(3), today, false)).toEqual({
      total: 2,
      used: 3,
      remaining: 0,
    });
  });

  it("날짜가 바뀌면 회복된다", () => {
    const tomorrow = new Date(2026, 6, 20);
    expect(ticketStateOf(usedToday(2), tomorrow, false)).toEqual({
      total: 2,
      used: 0,
      remaining: 2,
    });
  });

  it("store가 null이면(로드 전) used는 0으로 둔다", () => {
    expect(ticketStateOf(null, today, true)).toEqual({
      total: 3,
      used: 0,
      remaining: 3,
    });
  });
});

describe("ticketNoticeOf", () => {
  it("남은 횟수를 알린다", () => {
    expect(ticketNoticeOf({ total: 2, used: 1, remaining: 1 })).toBe(
      "오늘 1번 더 받으실 수 있습니다",
    );
  });

  it("0이면 모두 받으셨다고 알린다", () => {
    expect(ticketNoticeOf({ total: 2, used: 2, remaining: 0 })).toBe(
      "오늘 받으실 수 있는 타로는 모두 받으셨습니다",
    );
  });

  // 하루 횟수를 재화처럼 부르지 않기로 했다. 문구가 다시 그쪽으로 돌아가지
  // 않도록 고정한다.
  it("재화 어휘를 쓰지 않는다", () => {
    for (const s of [
      { total: 2, used: 1, remaining: 1 },
      { total: 2, used: 2, remaining: 0 },
    ]) {
      const notice = ticketNoticeOf(s);
      for (const word of ["티켓", "소진", "차감", "쓰셨"]) {
        expect(notice).not.toContain(word);
      }
    }
    for (const word of ["티켓", "소진"]) {
      expect(TICKET_RESET_NOTE).not.toContain(word);
      expect(TICKET_BONUS_HINT).not.toContain(word);
    }
  });
});

describe("TICKET_BONUS_HINT", () => {
  it("보너스 횟수를 상수에서 파생한다", () => {
    expect(TICKET_BONUS_HINT).toContain(`${SIGNED_IN_BONUS}번 더`);
  });
});
