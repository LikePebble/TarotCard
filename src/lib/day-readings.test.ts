import { describe, expect, it } from "vitest";
import {
  activeReadingIndex,
  defaultReadingTabIndex,
  orderedDayReadings,
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

  it("1장과 3장을 유형별 이름으로 구분한다", () => {
    expect(
      readingTabLabels([
        reading("1", "love", "one", "2026-07-28T02:00:00.000Z"),
        reading("2", "love", "three", "2026-07-28T01:00:00.000Z"),
        reading("3", "work", "one", "2026-07-28T03:00:00.000Z"),
      ]),
    ).toEqual(["사랑", "일", "사랑 3장"]);
  });

  it("같은 그룹 안에서 주제가 겹치면 순번을 붙인다", () => {
    expect(
      readingTabLabels([
        reading("1", "love", "one", "2026-07-28T01:00:00.000Z"),
        reading("2", "love", "one", "2026-07-28T02:00:00.000Z"),
        reading("3", "love", "three", "2026-07-28T03:00:00.000Z"),
        reading("4", "love", "three", "2026-07-28T04:00:00.000Z"),
      ]),
    ).toEqual(["사랑 1", "사랑 2", "사랑 3장 1", "사랑 3장 2"]);
  });

  it("모르는 카테고리는 저장된 값을 그대로 보여준다", () => {
    expect(readingTabLabels([reading("1", "새주제")])).toEqual(["새주제"]);
  });

  it("3장 리딩만 있으면 모든 라벨에 3장을 붙인다", () => {
    expect(
      readingTabLabels([
        reading("1", "day", "three", "2026-07-28T01:00:00.000Z"),
        reading("2", "love", "three", "2026-07-28T02:00:00.000Z"),
      ]),
    ).toEqual(["하루 3장", "사랑 3장"]);
  });
});

describe("orderedDayReadings", () => {
  it("1장 먼저, 각 그룹은 뽑은 시각 오름차순으로 정렬한다", () => {
    const result = orderedDayReadings([
      reading("three-late", "love", "three", "2026-07-28T04:00:00.000Z"),
      reading("one-late", "work", "one", "2026-07-28T03:00:00.000Z"),
      reading("three-early", "day", "three", "2026-07-28T01:00:00.000Z"),
      reading("one-early", "day", "one", "2026-07-28T02:00:00.000Z"),
    ]);
    expect(result.readings.map(({ id }) => id)).toEqual([
      "one-early",
      "one-late",
      "three-early",
      "three-late",
    ]);
    expect(result.oneCardCount).toBe(2);
  });

  it("시각이 같으면 원래 배열 순서를 유지한다", () => {
    const result = orderedDayReadings([
      reading("second", "love", "one", "2026-07-28T01:00:00.000Z"),
      reading("first", "day", "one", "2026-07-28T01:00:00.000Z"),
    ]);
    expect(result.readings.map(({ id }) => id)).toEqual(["second", "first"]);
  });

  it("한 그룹만 있어도 경계가 정확하다", () => {
    expect(orderedDayReadings([reading("1", "day")])).toMatchObject({ oneCardCount: 1 });
    expect(orderedDayReadings([reading("1", "day", "three")])).toMatchObject({ oneCardCount: 0 });
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
    expect(defaultReadingTabIndex(readings)).toBe(2);
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

  it("정렬 전 입력에서도 정렬된 탭 인덱스를 돌려준다", () => {
    expect(activeReadingIndex([readings[1], readings[0]], "1")).toBe(0);
  });

  it("고른 리딩이 목록에 없으면 기본 탭으로 되돌아간다", () => {
    expect(activeReadingIndex(readings, "없는id")).toBe(1);
  });

  it("리딩이 없으면 0", () => {
    expect(activeReadingIndex([], "1")).toBe(0);
  });
});
