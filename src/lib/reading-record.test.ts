import { describe, expect, it } from "vitest";
import { parseReadingRecord } from "@/lib/reading-record";

const valid = {
  id: "r1",
  at: "2026-08-08T03:00:00.000Z",
  localDate: "2026-08-08",
  isoWeek: "2026-W32",
  spread: "one",
  typeId: "ONE_CARD",
  category: "day",
  deckId: "classic",
  cards: ["the-fool"],
  orientations: ["upright"],
};

describe("parseReadingRecord", () => {
  it("정상 레코드를 통과시킨다", () => {
    expect(parseReadingRecord(valid, { requireKnownAssets: true })).toEqual(valid);
  });

  it("spread와 typeId 또는 카드 수가 어긋나면 제외한다", () => {
    expect(parseReadingRecord({ ...valid, typeId: "THREE_CARD_PPF" })).toBeNull();
    expect(parseReadingRecord({ ...valid, cards: [] })).toBeNull();
  });

  it("알 수 없는 덱·카드는 서버 경계에서 제외한다", () => {
    expect(
      parseReadingRecord(
        { ...valid, deckId: "unknown", cards: ["not-a-card"] },
        { requireKnownAssets: true },
      ),
    ).toBeNull();
  });

  it("방향 도입 전 빈 배열은 허용한다", () => {
    expect(parseReadingRecord({ ...valid, orientations: [] })).not.toBeNull();
  });
});
