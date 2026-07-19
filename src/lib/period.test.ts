import { describe, expect, it } from "vitest";
import { isoWeekOf, localDateOf } from "@/lib/period";

describe("localDateOf", () => {
  it("로컬 연-월-일을 0패딩해서 YYYY-MM-DD로 만든다", () => {
    expect(localDateOf(new Date(2026, 0, 5))).toBe("2026-01-05");
    expect(localDateOf(new Date(2026, 6, 19))).toBe("2026-07-19");
  });
});

describe("isoWeekOf", () => {
  it("일요일도 그 주의 ISO 주차로 넣는다 (2026-07-19 → 2026-W29)", () => {
    expect(isoWeekOf(new Date(2026, 6, 19))).toBe("2026-W29");
  });

  it("연초 주차를 주-연도 기준으로 계산한다 (2026-01-01 → 2026-W01)", () => {
    expect(isoWeekOf(new Date(2026, 0, 1))).toBe("2026-W01");
  });
});
