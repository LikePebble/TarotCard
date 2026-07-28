import { describe, expect, it } from "vitest";
import {
  activeReadingIndex,
  defaultReadingTabIndex,
  readingTabLabels,
  readingTypeLabel,
  type DayReading,
} from "@/lib/day-readings";

function reading(
  id: string,
  category: string,
  spread: DayReading["spread"] = "one",
  at = `2026-07-28T0${id}:00:00.000Z`,
): DayReading {
  return { id, at, spread, category };
}

describe("readingTypeLabel", () => {
  it("스프레드별 이름을 돌려준다", () => {
    expect(readingTypeLabel("one")).toBe("오늘의 카드");
    expect(readingTypeLabel("three")).toBe("과거 · 현재 · 미래");
  });
});

describe("readingTabLabels", () => {
  it("리딩이 없으면 빈 배열", () => {
    expect(readingTabLabels([])).toEqual([]);
  });

  it("주제가 서로 다르면 주제 이름만 쓴다", () => {
    expect(
      readingTabLabels([
        reading("1", "day"),
        reading("2", "love"),
        reading("3", "work"),
      ]),
    ).toEqual(["하루", "사랑", "일"]);
  });

  it("주제가 겹치면 리딩 유형을 덧붙여 구분한다", () => {
    expect(
      readingTabLabels([
        reading("1", "love", "one"),
        reading("2", "love", "three"),
        reading("3", "work", "one"),
      ]),
    ).toEqual(["사랑 (오늘의 카드)", "사랑 (과거 · 현재 · 미래)", "일"]);
  });

  it("주제와 유형까지 같으면 순번을 붙인다", () => {
    expect(
      readingTabLabels([
        reading("1", "love", "one"),
        reading("2", "love", "one"),
      ]),
    ).toEqual(["사랑 (오늘의 카드) 1", "사랑 (오늘의 카드) 2"]);
  });

  it("모르는 카테고리는 저장된 값을 그대로 보여준다", () => {
    expect(readingTabLabels([reading("1", "새주제")])).toEqual(["새주제"]);
  });
});

describe("defaultReadingTabIndex", () => {
  it("리딩이 없으면 0", () => {
    expect(defaultReadingTabIndex([])).toBe(0);
  });

  it("하나면 0", () => {
    expect(defaultReadingTabIndex([reading("1", "day")])).toBe(0);
  });

  it("그날 마지막으로 뽑은 리딩을 고른다", () => {
    const readings = [
      reading("1", "day", "one", "2026-07-28T01:00:00.000Z"),
      reading("3", "work", "one", "2026-07-28T09:00:00.000Z"),
      reading("2", "love", "one", "2026-07-28T04:00:00.000Z"),
    ];
    expect(defaultReadingTabIndex(readings)).toBe(1);
  });

  it("시각이 같으면 나중에 저장된 쪽을 고른다", () => {
    const readings = [
      reading("1", "day", "one", "2026-07-28T01:00:00.000Z"),
      reading("2", "love", "one", "2026-07-28T01:00:00.000Z"),
    ];
    expect(defaultReadingTabIndex(readings)).toBe(1);
  });
});

describe("activeReadingIndex", () => {
  const readings = [
    reading("1", "day", "one", "2026-07-28T01:00:00.000Z"),
    reading("2", "love", "one", "2026-07-28T02:00:00.000Z"),
  ];

  it("아직 고르지 않았으면 기본 탭", () => {
    expect(activeReadingIndex(readings, null)).toBe(1);
  });

  it("고른 리딩이 있으면 그 탭", () => {
    expect(activeReadingIndex(readings, "1")).toBe(0);
  });

  it("고른 리딩이 목록에 없으면 기본 탭으로 되돌아간다", () => {
    expect(activeReadingIndex(readings, "없는id")).toBe(1);
  });

  it("리딩이 없으면 0", () => {
    expect(activeReadingIndex([], "1")).toBe(0);
  });
});
