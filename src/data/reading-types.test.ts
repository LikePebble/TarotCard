import { describe, expect, it } from "vitest";
import { readingTypeOf } from "@/data/reading-types";

describe("readingTypeOf", () => {
  it("오늘의 타로: 1장, 일 케이던스", () => {
    const t = readingTypeOf("one");
    expect(t.id).toBe("ONE_CARD");
    expect(t.count).toBe(1);
    expect(t.cadenceUnit).toBe("day");
    expect(t.positions).toEqual(["today"]);
  });

  it("과거·현재·미래: 3장, 주 케이던스, 포지션 순서 고정", () => {
    const t = readingTypeOf("three");
    expect(t.id).toBe("THREE_CARD_PPF");
    expect(t.count).toBe(3);
    expect(t.cadenceUnit).toBe("week");
    expect(t.positions).toEqual(["past", "present", "future"]);
  });
});
