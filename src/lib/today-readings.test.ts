import { describe, expect, it } from "vitest";
import {
  TODAY_PANEL_MAX,
  todayOneCardReadings,
  type TodayReading,
} from "@/lib/today-readings";

const TODAY = "2026-07-28";

function reading(
  id: string,
  {
    at = `${TODAY}T01:00:00.000Z`,
    localDate = TODAY,
    typeId = "ONE_CARD",
    category = "day",
    deckId = "classic",
    cards = ["the-fool"],
  }: Partial<TodayReading> = {},
): TodayReading {
  return { id, at, localDate, typeId, category, deckId, cards };
}

const now = new Date(2026, 6, 28, 21, 0, 0); // 로컬 2026-07-28

describe("todayOneCardReadings", () => {
  it("기록이 없으면 빈 배열", () => {
    expect(todayOneCardReadings([], now)).toEqual([]);
  });

  it("오늘의 카드만 고른다 — 과거·현재·미래는 빼고", () => {
    const picked = todayOneCardReadings(
      [
        reading("1"),
        reading("2", { typeId: "THREE_CARD_PPF" }),
        reading("3"),
      ],
      now,
    );
    expect(picked.map((r) => r.id)).toEqual(["1", "3"]);
  });

  it("오늘 기록만 고른다 — 어제·내일은 빼고", () => {
    const picked = todayOneCardReadings(
      [
        reading("어제", { localDate: "2026-07-27" }),
        reading("오늘"),
        reading("내일", { localDate: "2026-07-29" }),
      ],
      now,
    );
    expect(picked.map((r) => r.id)).toEqual(["오늘"]);
  });

  it("뽑은 순서(at 오름차순)로 돌려준다", () => {
    const picked = todayOneCardReadings(
      [
        reading("점심", { at: `${TODAY}T03:00:00.000Z` }),
        reading("아침", { at: `${TODAY}T00:30:00.000Z` }),
        reading("저녁", { at: `${TODAY}T11:00:00.000Z` }),
      ],
      now,
    );
    expect(picked.map((r) => r.id)).toEqual(["아침", "점심", "저녁"]);
  });

  it("시각이 같으면 저장된 순서를 유지한다", () => {
    const picked = todayOneCardReadings(
      [reading("먼저"), reading("나중")],
      now,
    );
    expect(picked.map((r) => r.id)).toEqual(["먼저", "나중"]);
  });

  it(`${TODAY_PANEL_MAX}장을 넘기면 최신 쪽만 남긴다`, () => {
    const picked = todayOneCardReadings(
      [
        reading("1", { at: `${TODAY}T01:00:00.000Z` }),
        reading("2", { at: `${TODAY}T02:00:00.000Z` }),
        reading("3", { at: `${TODAY}T03:00:00.000Z` }),
        reading("4", { at: `${TODAY}T04:00:00.000Z` }),
      ],
      now,
    );
    expect(picked).toHaveLength(TODAY_PANEL_MAX);
    expect(picked.map((r) => r.id)).toEqual(["2", "3", "4"]);
  });

  it("입력 배열을 제자리에서 정렬하지 않는다", () => {
    const readings = [
      reading("나중", { at: `${TODAY}T05:00:00.000Z` }),
      reading("먼저", { at: `${TODAY}T01:00:00.000Z` }),
    ];
    todayOneCardReadings(readings, now);
    expect(readings.map((r) => r.id)).toEqual(["나중", "먼저"]);
  });

  it("덱과 카드를 그대로 넘겨 준다 — 그때 받은 그림을 그리기 위해", () => {
    const [picked] = todayOneCardReadings(
      [reading("1", { deckId: "moonlit", cards: ["the-star"] })],
      now,
    );
    expect(picked.deckId).toBe("moonlit");
    expect(picked.cards).toEqual(["the-star"]);
  });
});
